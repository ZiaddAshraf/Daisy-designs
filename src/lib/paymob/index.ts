export * from "./types";
export * from "./hmac";
export * from "./client";

import { PaymobClient } from "./client";

let defaultPaymobClient: PaymobClient | null = null;

export function getPaymobClient(): PaymobClient {
  if (defaultPaymobClient) return defaultPaymobClient;
  defaultPaymobClient = new PaymobClient();
  return defaultPaymobClient;
}

export function setPaymobClientForTesting(client: PaymobClient | null): void {
  defaultPaymobClient = client;
}

