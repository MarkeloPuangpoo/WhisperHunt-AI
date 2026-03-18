"use client";

import { useCallback, useRef, useState } from "react";
import { uploadSlide } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

type UploadStatus = "idle" | "dragging" | "uploading" | "success" | "error";

interface DropZoneProps {
  classId: string;
  onUploadSuccess?: () => void;
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DropZone({ classId, onUploadSuccess }: DropZoneProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setErrorMsg("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
        setStatus("error");
        return;
      }
      setFileName(file.name);
      setErrorMsg(null);
      setStatus("uploading");
      try {
        await uploadSlide(classId, file);
        setStatus("success");
        onUploadSuccess?.();
      } catch {
        setErrorMsg("อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        setStatus("error");
      }
    },
    [classId, onUploadSuccess]
  );

  // Drag-and-drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setStatus("dragging");
  };
  const onDragLeave = () => setStatus("idle");
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Click-to-browse
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  // ── Derived styles ─────────────────────────────────────────────────────────
  const borderColor =
    status === "dragging"
      ? "border-violet-500 bg-violet-50"
      : status === "success"
        ? "border-emerald-400 bg-emerald-50"
        : status === "error"
          ? "border-red-400 bg-red-50"
          : "border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/40";

  const iconColor =
    status === "success"
      ? "text-emerald-500"
      : status === "error"
        ? "text-red-400"
        : status === "dragging"
          ? "text-violet-500"
          : "text-slate-400";

  return (
    <div
      id="pdf-dropzone"
      role="button"
      aria-label="อัปโหลดไฟล์ PDF"
      tabIndex={0}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => status !== "uploading" && inputRef.current?.click()}
      onKeyDown={(e) =>
        e.key === "Enter" && status !== "uploading" && inputRef.current?.click()
      }
      className={`
        relative flex flex-col items-center justify-center gap-3
        rounded-2xl border-2 border-dashed p-10 text-center
        transition-all duration-200 cursor-pointer select-none
        ${borderColor}
        ${status === "uploading" ? "cursor-not-allowed" : ""}
      `}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={onFileChange}
        tabIndex={-1}
      />

      {/* Icon / Spinner */}
      {status === "uploading" ? (
        <span className="flex h-10 w-10 items-center justify-center">
          <span className="h-8 w-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        </span>
      ) : status === "success" ? (
        <span className="text-4xl">✅</span>
      ) : status === "error" ? (
        <span className="text-4xl">❌</span>
      ) : (
        <span className={iconColor}>
          <FileIcon />
        </span>
      )}

      {/* Text */}
      {status === "uploading" && (
        <p className="font-semibold text-violet-700">กำลังสกัดข้อความจาก PDF…</p>
      )}
      {status === "success" && (
        <>
          <p className="font-bold text-emerald-700">อัปโหลดสำเร็จ! 🎉</p>
          <p className="text-xs text-emerald-600 truncate max-w-[200px]">{fileName}</p>
        </>
      )}
      {status === "error" && (
        <>
          <p className="font-bold text-red-600">ล้มเหลว</p>
          <p className="text-xs text-red-500">{errorMsg}</p>
        </>
      )}
      {(status === "idle" || status === "dragging") && (
        <>
          <p className="font-semibold text-slate-600">
            {status === "dragging"
              ? "วางไฟล์ที่นี่เลย 🎯"
              : "ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก"}
          </p>
          <p className="text-xs text-slate-400">รองรับเฉพาะไฟล์ .pdf</p>
        </>
      )}

      {/* Reset button after success/error */}
      {(status === "success" || status === "error") && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setStatus("idle");
            setFileName(null);
            setErrorMsg(null);
          }}
          className="mt-1 text-xs font-semibold underline text-slate-500 hover:text-slate-800"
        >
          อัปโหลดไฟล์ใหม่
        </button>
      )}
    </div>
  );
}
