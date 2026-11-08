import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { stripMetadata as stripPhoto } from "../src/lib/child-photo-storage";
import { stripMetadata as stripArtwork } from "../src/lib/tshirt-artwork-storage";
import { handleApiError } from "../src/lib/api-request";
import { CashOnDeliveryProvider, PaymobProvider } from "../src/lib/payments";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { purgeOrphanedPhotos } from "../src/lib/child-photo-storage";
import { POST as uploadCustomization } from "../src/app/api/uploads/customization/route";

for (const [name, strip] of [["photo", stripPhoto], ["artwork", stripArtwork]] as const) {
  test(`${name}: PNG sanitization retains terminal IEND`, () => {
    const png = Buffer.from("89504e470d0a1a0a0000000049454e44ae426082", "hex");
    assert.deepEqual(strip(png, "png"), png);
  });
  test(`${name}: WebP EXIF and XMP are removed and RIFF size updated`, () => {
    const chunk = (tag: string, value: Buffer) => {
      const header = Buffer.alloc(8); header.write(tag); header.writeUInt32LE(value.length, 4);
      return Buffer.concat([header, value, Buffer.alloc(value.length % 2)]);
    };
    const flags = Buffer.alloc(10); flags[0] = 0x0c;
    const body = Buffer.concat([Buffer.from("WEBP"), chunk("VP8X", flags), chunk("EXIF", Buffer.from("synthetic-location")), chunk("XMP ", Buffer.from("synthetic-author")), chunk("VP8 ", Buffer.alloc(10))]);
    const head = Buffer.alloc(8); head.write("RIFF"); head.writeUInt32LE(body.length, 4);
    const clean = strip(Buffer.concat([head, body]), "webp");
    assert.equal(clean.includes(Buffer.from("synthetic-")), false);
    assert.equal(clean.readUInt32LE(4), clean.length - 8);
    assert.equal(clean[20] & 0x0c, 0);
  });
  test(`${name}: truncated metadata chunks fail closed`, () => {
    assert.throws(() => strip(Buffer.from("89504e470d0a1a0a000000204558494600000000", "hex"), "png"));
  });
}

test("unexpected errors never appear in public JSON", async () => {
  const response = handleApiError(new Error("synthetic-private-data"), "REQUEST_FAILED");
  assert.deepEqual(await response.json(), { error: "REQUEST_FAILED" });
});

test("COD remains pending; unconfigured Paymob cannot report success", async () => {
  const request = { orderNumber: "SYNTHETIC", amount: 200 };
  assert.deepEqual(await new CashOnDeliveryProvider().createPayment(request), { status: "PENDING" });
  await assert.rejects(new PaymobProvider().createPayment(request), /not configured/);
});

test("retention is disabled without a reference check and preserves referenced photos", async () => {
  const read = mock.method(fs, "readdir", async () => [{ name: "story_child_synthetic.png", isFile: () => true }]);
  const stat = mock.method(fs, "stat", async () => ({ mtimeMs: 0 }));
  const unlink = mock.method(fs, "unlink", async () => { throw new Error("Must not delete referenced data"); });
  try {
    assert.equal(await purgeOrphanedPhotos(), 0); assert.equal(read.mock.callCount(), 0);
    assert.equal(await purgeOrphanedPhotos(24, async () => false), 0);
    assert.equal(unlink.mock.callCount(), 0);
  } finally { read.mock.restore(); stat.mock.restore(); unlink.mock.restore(); }
});

test("customization upload stores synthetic PNG privately and rejects MIME spoofing", async () => {
  const original = process.cwd();
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "daisy-upload-audit-"));
  process.chdir(root);
  try {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/7sAAAAASUVORK5CYII=", "base64");
    const form = new FormData(); form.append("file", new Blob([png], { type: "image/png" }), "synthetic.png");
    const res = await uploadCustomization(new Request("http://localhost/api/uploads/customization", { method: "POST", body: form }));
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.match(body.url, /^private:story_child_[a-f0-9-]+\.png$/);
    assert.equal(body.url, body.key);
    await assert.rejects(fs.stat(path.join(root, "public")), { code: "ENOENT" });
    const stored = await fs.readFile(path.join(root, "storage/private_uploads/story_child_photos", body.filename));
    assert.equal(stored.includes(Buffer.from("IEND")), true);
    await fs.unlink(path.join(root, "storage/private_uploads/story_child_photos", body.filename));
    const bad = new FormData(); bad.append("file", new Blob(["<svg>synthetic</svg>"], { type: "image/png" }), "fake.png");
    assert.equal((await uploadCustomization(new Request("http://localhost/api/uploads/customization", { method: "POST", body: bad }))).status, 400);
  } finally { process.chdir(original); }
});
