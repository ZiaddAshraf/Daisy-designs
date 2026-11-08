export interface PutObjectOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageObject {
  data: Buffer;
  contentType: string;
  contentLength: number;
  metadata?: Record<string, string>;
}

export interface StorageBackend {
  readonly driverName: string;
  put(key: string, buffer: Buffer, options?: PutObjectOptions): Promise<{ key: string }>;
  get(key: string): Promise<StorageObject | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}

