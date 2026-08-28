import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, NotebookPen, BarChart3, Settings } from "lucide-react";
import type { ReactNode } from "react";
import lion from "@/assets/lion.png";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Daily Tasks", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen hero-vignette">
      <div className="mx-auto flex w-full max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/70 px-4 py-6 lg:flex">
          <Link to="/" className="mb-8 flex items-center gap-3 px-2">
            <img src={lion} alt="Legend crest" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="font-display text-lg tracking-[0.25em]">LEGEND</span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                activeProps={{ className: "bg-secondary text-gold" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <p className="px-3 text-[11px] leading-relaxed text-muted-foreground">
            Discipline is the only edge that compounds.
          </p>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-8 lg:pb-12">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div className="animate-rise">
              <h1 className="font-display text-2xl tracking-wide sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <Link to="/" className="lg:hidden">
              <img src={lion} alt="Legend crest" width={36} height={36} className="h-9 w-9 object-contain" loading="lazy" />
            </Link>
          </header>
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="flex items-stretch justify-around">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 border-t-2 border-transparent px-1 py-2.5 text-[10px] text-muted-foreground transition-colors"
              activeProps={{ className: "border-t-2 !border-gold text-gold" }}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label.replace("Daily ", "")}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="surface p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-gold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-14 text-center">
      <img src={lion} alt="" width={64} height={64} className="h-16 w-16 object-contain opacity-40" loading="lazy" />
      <h3 className="font-display text-lg">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}

export function ProgressRing({ value, size = 132 }: { value: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-secondary" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - c * value}
        className="fill-none stroke-gold transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}
