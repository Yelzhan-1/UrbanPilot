import type { ReactNode } from "react";

type SectorCardProps = {
  title: string;
  subtitle: string;
  value: number;
  status: string;
  badge: string;
  accent: string;
  icon?: ReactNode;
  className?: string;
};

export default function SectorCard({
  title,
  subtitle,
  value,
  status,
  badge,
  accent,
  icon,
  className = "",
}: SectorCardProps) {
  const gradientId = `sector-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <article
      className={`group relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br ${accent} p-5 shadow-[0_10px_40px_rgba(59,130,246,0.08)] ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_38%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          {icon ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white">
              {icon}
            </div>
          ) : (
            <div />
          )}

          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            {badge}
          </span>
        </div>

        <div className="mt-6">
          <div className="text-sm text-slate-200">{title}</div>
          <div className="mt-1 text-[13px] text-slate-400">{subtitle}</div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-4xl font-semibold tracking-tight text-white">
              {value}
            </div>
            <div className="mt-2 text-sm text-slate-200">{status}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white">
            %
          </div>
        </div>

        <div className="mt-5">
          <svg
            viewBox="0 0 220 60"
            className="h-16 w-full opacity-90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 42C22 42 18 18 39 18C58 18 53 48 77 48C96 48 98 24 118 24C139 24 139 40 160 40C181 40 184 12 216 12"
              stroke={`url(#${gradientId})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="220" y2="0">
                <stop stopColor="#67e8f9" />
                <stop offset="0.5" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#f472b6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </article>
  );
}