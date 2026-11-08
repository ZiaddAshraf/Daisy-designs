"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { uploadErrorMessage, uploadImage } from "@/lib/upload-feedback";

export function useImageUpload(endpoint: string, keyField: "url" | "storageKey", maxMB: number, isAr: boolean) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);
  const blob = useRef<string | null>(null);
  const release = useCallback(() => {
    active.current?.abort(); active.current = null;
    if (blob.current) URL.revokeObjectURL(blob.current);
    blob.current = null;
  }, []);
  useEffect(() => release, [release]);
  const clear = useCallback(() => {
    release(); setFile(null); setPreview(null); setKey(null); setError(null); setBusy(false);
  }, [release]);
  const choose = useCallback(async (next: File) => {
    release();
    const controller = new AbortController(); active.current = controller;
    setFile(next); setKey(null); setError(null); setBusy(true);
    const supported = ["image/jpeg", "image/png", "image/webp"].includes(next.type);
    blob.current = supported ? URL.createObjectURL(next) : null; setPreview(blob.current);
    try {
      const uploaded = await uploadImage(next, endpoint, keyField, maxMB, controller.signal);
      if (active.current === controller) setKey(uploaded);
    } catch (failure) {
      if (active.current === controller) setError(uploadErrorMessage(failure instanceof Error ? failure.message : "UPLOAD_FAILED", isAr));
    } finally {
      if (active.current === controller) setBusy(false);
    }
  }, [endpoint, keyField, maxMB, isAr, release]);
  return { file, preview, key, busy, error, setError, choose, clear, retry: () => file && void choose(file), blocked: busy || Boolean(file && !key) };
}
