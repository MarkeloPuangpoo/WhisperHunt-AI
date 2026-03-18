"use client";

import { useEffect, useState } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Trigger exit animation then call onClose
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-emerald-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-sky-500";

  return (
    <div
      className={`
        fixed bottom-8 left-1/2 z-50
        flex items-center gap-3 px-6 py-4
        rounded-2xl shadow-2xl text-white font-semibold text-base
        transition-all duration-400 ease-out
        ${bgColor}
        ${visible ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 translate-y-6"}
      `}
      role="alert"
    >
      {type === "success" && <span className="text-xl">✅</span>}
      {type === "error" && <span className="text-xl">❌</span>}
      {type === "info" && <span className="text-xl">ℹ️</span>}
      <span>{message}</span>
    </div>
  );
}
