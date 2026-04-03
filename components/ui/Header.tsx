import Link from "next/link";

type HeaderLink = {
  label: string;
  href: string;
  active?: boolean;
};

type HeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  statusLabel?: string;
  links?: HeaderLink[];
  className?: string;
};

export default function Header({
  eyebrow = "UrbanPilot",
  title,
  subtitle,
  statusLabel,
  links = [],
  className = "",
}: HeaderProps) {
  return (
    <header
      className={`rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)] ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-50 sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-300">{subtitle}</p> : null}
        </div>

        {statusLabel ? (
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200 ring-1 ring-cyan-400/30">
            {statusLabel}
          </span>
        ) : null}
      </div>

      {links.length > 0 ? (
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Page navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                link.active
                  ? "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/40"
                  : "bg-slate-800 text-slate-300 ring-1 ring-white/10 hover:bg-slate-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}