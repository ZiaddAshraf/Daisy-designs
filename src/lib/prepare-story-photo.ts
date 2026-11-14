const UPLOAD_LIMIT = 4 * 1024 * 1024;

export async function prepareStoryPhoto(file: File): Promise<File> {
  if (file.size <= UPLOAD_LIMIT) return file;
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 3500 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("PHOTO_PREPARATION_FAILED");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.9, 0.82, 0.72, 0.6]) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= UPLOAD_LIMIT) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
      }
    }
    throw new Error("FILE_TOO_LARGE");
  } finally {
    bitmap.close();
  }
}
