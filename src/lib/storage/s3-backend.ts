import { createHash, createHmac } from "node:crypto";
import path from "node:path";
import type { PutObjectOptions, StorageBackend, StorageObject } from "./types";

export interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export type FetchFunction = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function sha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: string | Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = hmacSha256(`AWS4${key}`, dateStamp);
  const kRegion = createHmac("sha256", kDate).update(regionName).digest();
  const kService = createHmac("sha256", kRegion).update(serviceName).digest();
  return createHmac("sha256", kService).update("aws4_request").digest();
}

function sanitizeObjectKey(key: string): string {
  const cleanKey = key.startsWith("private:") ? key.slice("private:".length) : key;
  const baseName = path.basename(cleanKey);
  if (!baseName || baseName !== cleanKey) {
    throw new Error("INVALID_STORAGE_KEY_TRAVERSAL");
  }
  if (!/^[a-zA-Z0-9_\-.]+\.(jpg|jpeg|png|webp|bin)$/i.test(baseName)) {
    throw new Error("INVALID_STORAGE_KEY_CHARACTERS");
  }
  return baseName;
}

export class S3StorageBackend implements StorageBackend {
  readonly driverName = "s3" as const;
  private readonly config: S3Config;
  private readonly customFetch?: FetchFunction;

  constructor(config?: Partial<S3Config>, customFetch?: FetchFunction) {
    this.config = {
      endpoint: config?.endpoint ?? process.env.S3_ENDPOINT ?? "",
      region: config?.region ?? process.env.S3_REGION ?? "auto",
      bucket: config?.bucket ?? process.env.S3_BUCKET ?? "",
      accessKeyId: config?.accessKeyId ?? process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: config?.secretAccessKey ?? process.env.S3_SECRET_ACCESS_KEY ?? "",
    };
    this.customFetch = customFetch;
  }

  isConfigured(): boolean {
    return Boolean(
      this.config.endpoint &&
      this.config.bucket &&
      this.config.accessKeyId &&
      this.config.secretAccessKey
    );
  }

  private getUrl(key: string): URL {
    const rawEndpoint = this.config.endpoint.replace(/\/+$/, "");
    return new URL(`${rawEndpoint}/${this.config.bucket}/${key}`);
  }

  private signRequest(
    method: string,
    url: URL,
    headers: Record<string, string>,
    payloadHash: string
  ): Record<string, string> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);

    const signedHeadersList: Record<string, string> = {
      ...headers,
      host: url.host,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
    };

    const sortedHeaderKeys = Object.keys(signedHeadersList).sort();
    const canonicalHeaders = sortedHeaderKeys.map((k) => `${k.toLowerCase()}:${signedHeadersList[k].trim()}\n`).join("");
    const signedHeaders = sortedHeaderKeys.map((k) => k.toLowerCase()).join(";");

    const canonicalRequest = [
      method,
      url.pathname,
      url.search ? url.search.slice(1) : "",
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${this.config.region}/s3/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256(canonicalRequest),
    ].join("\n");

    const signingKey = getSignatureKey(this.config.secretAccessKey, dateStamp, this.config.region, "s3");
    const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    return {
      ...signedHeadersList,
      Authorization: `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    };
  }

  private async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const fn = this.customFetch ?? fetch;
    return fn(input, init);
  }

  async put(key: string, buffer: Buffer, options?: PutObjectOptions): Promise<{ key: string }> {
    if (!this.isConfigured()) {
      throw new Error("S3_STORAGE_NOT_CONFIGURED");
    }
    const objectKey = sanitizeObjectKey(key);
    const url = this.getUrl(objectKey);
    const contentType = options?.contentType ?? "application/octet-stream";
    const payloadHash = sha256(buffer);

    const extraHeaders: Record<string, string> = {
      "content-type": contentType,
      "content-length": String(buffer.length),
    };

    if (options?.metadata) {
      for (const [metaKey, metaVal] of Object.entries(options.metadata)) {
        extraHeaders[`x-amz-meta-${metaKey.toLowerCase()}`] = metaVal;
      }
    }

    const signedHeaders = this.signRequest("PUT", url, extraHeaders, payloadHash);

    const response = await this.fetch(url, {
      method: "PUT",
      headers: signedHeaders,
      body: new Uint8Array(buffer),
    });

    if (!response.ok) {
      throw new Error(`S3_PUT_FAILED_HTTP_${response.status}`);
    }

    const canonicalKey = key.startsWith("private:") ? key : `private:${objectKey}`;
    return { key: canonicalKey };
  }

  async get(key: string): Promise<StorageObject | null> {
    if (!this.isConfigured()) {
      throw new Error("S3_STORAGE_NOT_CONFIGURED");
    }
    let objectKey: string;
    try {
      objectKey = sanitizeObjectKey(key);
    } catch {
      return null;
    }

    const url = this.getUrl(objectKey);
    const emptyPayloadHash = sha256("");
    const signedHeaders = this.signRequest("GET", url, {}, emptyPayloadHash);

    const response = await this.fetch(url, {
      method: "GET",
      headers: signedHeaders,
    });

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`S3_GET_FAILED_HTTP_${response.status}`);
    }

    const arrayBuf = await response.arrayBuffer();
    const data = Buffer.from(arrayBuf);
    const contentType = response.headers.get("content-type") ?? "application/octet-stream";

    const metadata: Record<string, string> = {};
    response.headers.forEach((val, name) => {
      if (name.startsWith("x-amz-meta-")) {
        metadata[name.slice("x-amz-meta-".length)] = val;
      }
    });

    return {
      data,
      contentType,
      contentLength: data.length,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error("S3_STORAGE_NOT_CONFIGURED");
    }
    let objectKey: string;
    try {
      objectKey = sanitizeObjectKey(key);
    } catch {
      return false;
    }

    const url = this.getUrl(objectKey);
    const emptyPayloadHash = sha256("");
    const signedHeaders = this.signRequest("DELETE", url, {}, emptyPayloadHash);

    const response = await this.fetch(url, {
      method: "DELETE",
      headers: signedHeaders,
    });

    return response.ok || response.status === 204 || response.status === 404;
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error("S3_STORAGE_NOT_CONFIGURED");
    }
    let objectKey: string;
    try {
      objectKey = sanitizeObjectKey(key);
    } catch {
      return false;
    }

    const url = this.getUrl(objectKey);
    const emptyPayloadHash = sha256("");
    const signedHeaders = this.signRequest("HEAD", url, {}, emptyPayloadHash);

    const response = await this.fetch(url, {
      method: "HEAD",
      headers: signedHeaders,
    });

    return response.ok;
  }
}

