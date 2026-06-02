import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error";

export interface ToastData {
  readonly type: ToastType;
  readonly text: string;
}

interface ToastProps {
  readonly toast: ToastData;
  readonly onClose: () => void;
  /** Tempo em ms até o fechamento automático. 0 desativa o auto-close. */
  readonly duration?: number;
}

export function Toast({ toast, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  const isSuccess = toast.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm justify-end"
      aria-live="polite"
    >
      <div
        role="alert"
        className={cn(
          "toast-enter pointer-events-auto flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-sm text-white shadow-xl shadow-black/40 backdrop-blur",
          "app-bg-todos",
          isSuccess ? "border-green-500" : "border-red-500"
        )}
      >
        <Icon
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0",
            isSuccess ? "text-green-400" : "text-red-400"
          )}
        />
        <p className="flex-1 leading-snug">{toast.text}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar notificação"
          className="-mr-1 -mt-0.5 shrink-0 rounded p-0.5 text-white/70 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
