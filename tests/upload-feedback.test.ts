import test from "node:test";
import assert from "node:assert/strict";
import { uploadImage, uploadErrorMessage } from "../src/lib/upload-feedback";

test("upload rejects unsupported and oversized files before contacting the server", async () => {
  const signal = new AbortController().signal;
  await assert.rejects(uploadImage(new File(["text"], "test.txt", { type: "text/plain" }), "/unused", "url", 5, signal), /INVALID_FILE_TYPE/);
  await assert.rejects(uploadImage(new File([new Uint8Array(2048)], "test.png", { type: "image/png" }), "/unused", "url", 0.001, signal), /FILE_TOO_LARGE/);
});

test("upload only succeeds with a valid server key, and preserves the cancellation signal", async (t) => {
  const signal = new AbortController().signal;
  const file = new File(["synthetic"], "test.png", { type: "image/png" });
  let response = new Response(JSON.stringify({ error: "INVALID_IMAGE" }), { status: 400 });
  t.mock.method(globalThis, "fetch", async (_url: unknown, options: RequestInit) => {
    assert.equal(options.signal, signal);
    assert.ok(options.body instanceof FormData);
    return response;
  });
  await assert.rejects(uploadImage(file, "/upload", "url", 5, signal), /INVALID_IMAGE/);
  response = new Response(JSON.stringify({ success: true }));
  await assert.rejects(uploadImage(file, "/upload", "url", 5, signal), /UPLOAD_FAILED/);
  response = new Response(JSON.stringify({ url: "private:synthetic.png" }));
  assert.equal(await uploadImage(file, "/upload", "url", 5, signal), "private:synthetic.png");
  response = new Response(JSON.stringify({ storageKey: "private:synthetic.png" }));
  assert.equal(await uploadImage(file, "/upload", "storageKey", 10, signal), "private:synthetic.png");
  assert.doesNotMatch(uploadErrorMessage("INTERNAL_UPLOAD_ERROR", true), /INTERNAL_UPLOAD_ERROR/);
});
