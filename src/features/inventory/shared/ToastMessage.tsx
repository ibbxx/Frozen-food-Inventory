import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/shared/ui/button";

type ToastTone = "success" | "error";

interface ToastMessageProps {
  message: string;
  onClose: () => void;
  tone: ToastTone;
}

export function ToastMessage({ message, onClose, tone }: ToastMessageProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onCloseRef.current();
    }, 3200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const isSuccess = tone === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      aria-live={isSuccess ? "polite" : "assertive"}
      className="fixed right-4 top-4 z-[60] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur"
      role={isSuccess ? "status" : "alert"}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-full p-1 ${
            isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">{message}</p>
        </div>
        <Button className="h-8 w-8 p-0" onClick={onClose} type="button" variant="ghost">
          <X className="h-4 w-4" />
          <span className="sr-only">Tutup notifikasi</span>
        </Button>
      </div>
    </div>
  );
}
