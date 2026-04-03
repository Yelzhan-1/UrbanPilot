import { ReactNode } from "react";

type PageStateType = "loading" | "error" | "empty";

type PageStateBlockProps = {
  type: PageStateType;
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
};

const toneStyles: Record<PageStateType, string> = {
  loading: "border-white/10 bg-slate-900/60 text-slate-200",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-100",
  empty: "border-dashed border-white/20 bg-slate-900/50 text-slate-300",
};

const defaultTitle: Record<PageStateType, string> = {
  loading: "Loading data",
  error: "Data unavailable",
  empty: "No data available",
};

function Spinner() {
  return (
    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
  );
}

export default function PageStateBlock({
  type,
  title,
  message,
  action,
  className = "",
}: PageStateBlockProps) {
  return (
    <section
      className={`rounded-2xl border p-6 text-center ${toneStyles[type]} ${className}`}
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {type === "loading" ? <Spinner /> : null}
      <h2 className="mt-3 text-base font-semibold">{title ?? defaultTitle[type]}</h2>
      <p className="mt-2 text-sm">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </section>
  );
}