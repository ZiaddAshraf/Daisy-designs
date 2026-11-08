/** Remove identifying metadata without changing compressed pixel data. Invalid chunks fail closed. */
export function stripChunkMetadata(buffer: Buffer, format: "png" | "webp"): Buffer {
  const png = format === "png";
  const start = png ? 8 : 12;
  if (buffer.length < start || (!png && buffer.readUInt32LE(4) !== buffer.length - 8)) throw new Error("INVALID_IMAGE");
  const chunks: Buffer[] = [Buffer.from(buffer.subarray(0, start))];
  let offset = start;
  let ended = false;
  while (offset < buffer.length) {
    const overhead = png ? 12 : 8;
    if (buffer.length - offset < overhead) throw new Error("INVALID_IMAGE");
    const length = png ? buffer.readUInt32BE(offset) : buffer.readUInt32LE(offset + 4);
    const tag = buffer.toString("ascii", offset + (png ? 4 : 0), offset + (png ? 8 : 4));
    const size = overhead + length + (png ? 0 : length % 2);
    if (size > buffer.length - offset) throw new Error("INVALID_IMAGE");
    const excluded = png ? ["eXIf", "tEXt", "zTXt", "iTXt"] : ["EXIF", "XMP "];
    if (!excluded.includes(tag)) {
      const chunk = Buffer.from(buffer.subarray(offset, offset + size));
      if (!png && tag === "VP8X") {
        if (length !== 10) throw new Error("INVALID_IMAGE");
        chunk[8] &= ~0x0c;
      }
      chunks.push(chunk);
    }
    offset += size;
    if (png && tag === "IEND") { ended = true; break; }
  }
  if (png && !ended) throw new Error("INVALID_IMAGE");
  const result = Buffer.concat(chunks);
  if (!png) result.writeUInt32LE(result.length - 8, 4);
  return result;
}
