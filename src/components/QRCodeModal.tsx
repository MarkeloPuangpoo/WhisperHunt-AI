"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { X, Smartphone, Copy, Check } from "lucide-react";

interface QRCodeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ url, isOpen, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white/95 backdrop-blur-2xl p-8 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/60 animate-in zoom-in-95 fade-in duration-300">
        <button 
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
            <Smartphone className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">สแกนเข้าร่วมห้อง!</h2>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">ให้นักเรียนสแกน QR Code นี้<br/>เพื่อเริ่มถามคำถามได้เลย</p>
        </div>

        {/* QR Code Container */}
        <div className="mx-auto mb-6 flex justify-center rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <QRCode
            value={url}
            size={180}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>

        {/* URL Display and Copy */}
        <div className="mb-6 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">หรือแชร์ลิงก์นี้</p>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200/60">
            <input 
              type="text" 
              readOnly 
              value={url} 
              className="flex-1 bg-transparent px-2 text-xs font-medium text-slate-600 outline-none w-full min-w-0"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={handleCopy}
              className="flex items-center justify-center rounded-lg bg-indigo-50 p-2 text-indigo-600 transition-all hover:bg-indigo-100 hover:scale-105 active:scale-95 shrink-0"
              aria-label="Copy link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200/50 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300/50 active:scale-[0.97]"
        >
          เริ่มสอนเลย 🚀
        </button>
      </div>
    </div>
  );
}
