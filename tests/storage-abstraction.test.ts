import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  LocalStorageBackend,
  S3StorageBackend,
  getStorageBackend,
  setStorageBackendForTesting,
} from "../src/lib/storage";

test("LocalStorageBackend: stores, retrieves, checks existence, and deletes objects safely", async () => {
  const tempDir = path.join(os.tmpdir(), `daisy-storage-test-${Date.now()}`);
  const storage = new LocalStorageBackend(tempDir);

  const testKey = "story_child_test-uuid-1234.jpg";
  const testData = Buffer.from("fake-jpeg-binary-content-1234");
  const options = { contentType: "image/jpeg", metadata: { uploader: "guest_session_1" } };

  // 1. Put
  const putResult = await storage.put(testKey, testData, options);
  assert.equal(putResult.key, `private:${testKey}`);

  // 2. Exists
  const existsBefore = await storage.exists(testKey);
  assert.equal(existsBefore, true);

  const existsWithPrefix = await storage.exists(`private:${testKey}`);
  assert.equal(existsWithPrefix, true);

  // 3. Get
  const obj = await storage.get(testKey);
  assert.ok(obj, "Object should be retrieved");
  assert.equal(obj.contentType, "image/jpeg");
  assert.equal(obj.contentLength, testData.length);
  assert.equal(obj.data.toString(), testData.toString());
  assert.equal(obj.metadata?.uploader, "guest_session_1");

  // 4. Delete
  const deleted = await storage.delete(testKey);
  assert.equal(deleted, true);

  // 5. Exists after delete
  const existsAfter = await storage.exists(testKey);
  assert.equal(existsAfter, false);

  const objAfter = await storage.get(testKey);
  assert.equal(objAfter, null);

  // Cleanup temp dir
  await fs.rm(tempDir, { recursive: true, force: true });
});

test("LocalStorageBackend: rejects directory traversal and invalid file types", async () => {
  const tempDir = path.join(os.tmpdir(), `daisy-storage-sec-${Date.now()}`);
  const storage = new LocalStorageBackend(tempDir);
  const data = Buffer.from("test");

  // Path traversal attempts
  await assert.rejects(async () => {
    await storage.put("../../../etc/passwd.jpg", data);
  }, /INVALID_STORAGE_KEY_TRAVERSAL/);

  await assert.rejects(async () => {
    await storage.put("subfolder/file.jpg", data);
  }, /INVALID_STORAGE_KEY_TRAVERSAL/);

  // Invalid extension
  await assert.rejects(async () => {
    await storage.put("malicious.exe", data);
  }, /INVALID_STORAGE_KEY_CHARACTERS/);

  await assert.rejects(async () => {
    await storage.put("script.sh", data);
  }, /INVALID_STORAGE_KEY_CHARACTERS/);

  // Non-existent key returns null safely without throwing
  assert.equal(await storage.get("non-existent-file.png"), null);
  assert.equal(await storage.exists("non-existent-file.png"), false);
  assert.equal(await storage.delete("non-existent-file.png"), false);

  await fs.rm(tempDir, { recursive: true, force: true });
});

test("S3StorageBackend: correctly signs SigV4 requests and handles PUT/GET/HEAD/DELETE via mock fetch", async () => {
  const recordedRequests: Array<{ url: string; method: string; headers: Record<string, string>; body?: string }> = [];

  const mockData = Buffer.from("s3-binary-payload");
  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = input.toString();
    const method = init?.method ?? "GET";
    const headersRecord: Record<string, string> = {};

    if (init?.headers) {
      const h = init.headers as Record<string, string>;
      for (const [k, v] of Object.entries(h)) {
        headersRecord[k.toLowerCase()] = v;
      }
    }

    recordedRequests.push({
      url: urlStr,
      method,
      headers: headersRecord,
    });

    if (method === "PUT") {
      return new Response(null, { status: 200 });
    }
    if (method === "GET") {
      if (urlStr.includes("not-found")) {
        return new Response(null, { status: 404 });
      }
      return new Response(new Uint8Array(mockData), {
        status: 200,
        headers: {
          "content-type": "image/webp",
          "content-length": String(mockData.length),
          "x-amz-meta-orderid": "ord_9988",
        },
      });
    }
    if (method === "HEAD") {
      if (urlStr.includes("not-found")) {
        return new Response(null, { status: 404 });
      }
      return new Response(null, { status: 200 });
    }
    if (method === "DELETE") {
      return new Response(null, { status: 204 });
    }
    return new Response(null, { status: 500 });
  };

  const s3 = new S3StorageBackend(
    {
      endpoint: "https://mock-account.r2.cloudflarestorage.com",
      region: "auto",
      bucket: "daisy-private",
      accessKeyId: "MOCK_KEY_ID",
      secretAccessKey: "MOCK_SECRET_KEY",
    },
    mockFetch
  );

  assert.equal(s3.isConfigured(), true);

  // 1. PUT
  const putRes = await s3.put("story_child_s3-uuid.webp", mockData, {
    contentType: "image/webp",
    metadata: { orderId: "ord_9988" },
  });
  assert.equal(putRes.key, "private:story_child_s3-uuid.webp");

  const putReq = recordedRequests[0];
  assert.equal(putReq.method, "PUT");
  assert.ok(putReq.headers["authorization"]?.startsWith("AWS4-HMAC-SHA256 Credential=MOCK_KEY_ID/"));
  assert.ok(putReq.headers["x-amz-date"]);
  assert.equal(putReq.headers["x-amz-meta-orderid"], "ord_9988");
  assert.equal(putReq.headers["content-type"], "image/webp");

  // 2. HEAD (exists)
  const exists = await s3.exists("story_child_s3-uuid.webp");
  assert.equal(exists, true);

  const notExists = await s3.exists("not-found.webp");
  assert.equal(notExists, false);

  // 3. GET
  const getRes = await s3.get("story_child_s3-uuid.webp");
  assert.ok(getRes);
  assert.equal(getRes.contentType, "image/webp");
  assert.equal(getRes.data.toString(), mockData.toString());
  assert.equal(getRes.metadata?.orderid, "ord_9988");

  const getNotFound = await s3.get("not-found.webp");
  assert.equal(getNotFound, null);

  // 4. DELETE
  const delRes = await s3.delete("story_child_s3-uuid.webp");
  assert.equal(delRes, true);

  // 5. Unconfigured S3 throws descriptive safe error
  const unconfiguredS3 = new S3StorageBackend({});
  assert.equal(unconfiguredS3.isConfigured(), false);
  await assert.rejects(async () => {
    await unconfiguredS3.put("test.jpg", mockData);
  }, /S3_STORAGE_NOT_CONFIGURED/);
});

test("Storage Factory: defaults to local backend and supports testing injection", () => {
  setStorageBackendForTesting(null);
  const defaultBackend = getStorageBackend();
  assert.equal(defaultBackend.driverName, "local");

  const customBackend = new LocalStorageBackend(os.tmpdir());
  setStorageBackendForTesting(customBackend);
  assert.equal(getStorageBackend(), customBackend);

  // Reset
  setStorageBackendForTesting(null);
});

