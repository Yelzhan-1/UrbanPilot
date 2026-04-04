"use client";

"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Home,
  LayoutDashboard,
  MapPinned,
  Sparkles,
} from "lucide-react";

type HeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  statusLabel?: string;
  className?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/decision-center", label: "Центр решений", icon: Brain },
  { href: "/district", label: "Районы", icon: MapPinned },
  { href: "/simulator", label: "Симулятор", icon: Sparkles },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({
  eyebrow,
  title,
  subtitle,
  statusLabel,
  className = "",
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header
      className={`relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(7,15,30,0.98),rgba(8,20,44,0.97),rgba(4,10,24,0.98))] px-6 py-6 shadow-[0_30px_90px_rgba(2,8,23,0.38)] md:px-7 md:py-7 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-[-20px] top-[-20px] h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute bottom-[-30px] left-1/3 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2.5">
                {eyebrow ? (
                  <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    {eyebrow}
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
                  Smart City AI
                </span>
              </div>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl md:leading-[1.02]">
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-[15px]">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col gap-3 lg:items-end">
              {statusLabel ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.10)]">
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
                  {statusLabel}
                </span>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Режим системы
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  Аналитика Алматы
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/20 p-2 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                      active
                        ? "border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(59,130,246,0.10))] text-white shadow-[0_10px_30px_rgba(34,211,238,0.10)]"
                        : "border border-transparent bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    {Icon ? (
                      <span
                        className={`rounded-xl p-1.5 ${
                          active
                            ? "bg-cyan-300/12 text-cyan-200"
                            : "bg-white/[0.04] text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    ) : null}

                    <span>{item.label}</span>

                    {active ? (
                      <ArrowRight className="h-4 w-4 text-cyan-200" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}