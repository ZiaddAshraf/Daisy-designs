"use client";
export function UploadFeedback({ busy, uploaded, error, isAr, retry, remove }: {
  busy: boolean; uploaded: boolean; error: string | null; isAr: boolean; retry: () => void; remove: () => void;
}) {
  return <div className="mt-2 text-sm leading-relaxed" data-upload-feedback>
    <p role="status" aria-live="polite" className={uploaded ? "text-teal-700 dark:text-teal-300" : "text-[var(--muted-foreground)]"}>
      {busy ? (isAr ? "جاري رفع الصورة… استني لحد ما يظهر تأكيد الرفع." : "Uploading… wait for the upload confirmation.") : uploaded ? (isAr ? "تم رفع الصورة ✓ هتتضاف مع طلبك." : "Image uploaded ✓ It will be included with your order.") : null}
    </p>
    {error && <div role="alert" className="text-rose-700 dark:text-rose-300">
      <p>{error}</p>
      <div className="flex flex-wrap gap-3 mt-1">
        <button type="button" onClick={retry} className="min-h-11 underline font-semibold">{isAr ? "حاولي رفعها تاني" : "Retry upload"}</button>
        <button type="button" onClick={remove} className="min-h-11 underline">{isAr ? "احذفي الصورة" : "Remove image"}</button>
      </div>
    </div>}
  </div>;
}
