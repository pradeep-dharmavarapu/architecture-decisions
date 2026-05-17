import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-ink text-white shadow-soft hover:bg-black",
        variant === "secondary" && "border border-ink/15 bg-white/75 text-ink hover:bg-white",
        variant === "quiet" && "text-ink/75 hover:bg-ink/5",
        className
      )}
      {...props}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-ink/55">{hint}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-11 rounded-md border border-ink/15 bg-white/80 px-3 text-sm shadow-sm", props.className)} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("min-h-11 rounded-md border border-ink/15 bg-white/80 px-3 text-sm shadow-sm", props.className)} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 rounded-md border border-ink/15 bg-white/80 px-3 py-3 text-sm shadow-sm", props.className)} {...props} />;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "info" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-ink/7 text-ink/70",
        tone === "good" && "bg-moss/15 text-moss",
        tone === "warn" && "bg-clay/15 text-clay",
        tone === "info" && "bg-ocean/15 text-ocean"
      )}
    >
      {children}
    </span>
  );
}
