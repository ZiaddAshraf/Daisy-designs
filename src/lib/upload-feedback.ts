export function uploadErrorMessage(code: string, isAr: boolean) {
  const messages: Record<string, [string, string]> = {
    FILE_TOO_LARGE: ["الصورة كبيرة. اختاري صورة أصغر من الحد المكتوب تحت زر الرفع.", "This image is too large. Choose one below the limit shown by the upload button."],
    INVALID_FILE_TYPE: ["اختاري صورة بصيغة JPG أو PNG أو WebP.", "Choose a JPG, PNG or WebP image."],
    IMAGE_RESOLUTION_TOO_LOW: ["الصورة صغيرة للطباعة. اختاري الصورة الأصلية بدقة ٦٠٠ × ٦٠٠ بكسل على الأقل.", "Choose the original image, at least 600 × 600 pixels, for printing."],
  };
  return messages[code]?.[isAr ? 0 : 1] ?? (isAr
    ? "الصورة ماترفعتش. حاولي تاني، أو احذفيها واختاري صورة أخرى."
    : "The image was not uploaded. Retry, or remove it and choose another image.");
}

export async function uploadImage(file: File, endpoint: string, keyField: "url" | "storageKey", maxMB: number, signal: AbortSignal) {
  if (file.size > maxMB * 1024 * 1024) throw new Error("FILE_TOO_LARGE");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("INVALID_FILE_TYPE");
  const form = new FormData(); form.append("file", file);
  const response = await fetch(endpoint, { method: "POST", body: form, signal });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "UPLOAD_FAILED");
  const key = data[keyField];
  if (typeof key !== "string" || !key.startsWith("private:")) throw new Error("UPLOAD_FAILED");
  return key;
}
