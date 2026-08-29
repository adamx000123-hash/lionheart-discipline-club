import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { todayKey, type JournalEntry } from "@/lib/store";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function keyOf(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayNet(entries: JournalEntry[]) {
  const wins = entries.filter((e) => e.result === "win").length;
  const losses = entries.filter((e) => e.result === "loss").length;
  if (wins > losses) return "win" as const;
  if (losses > wins) return "loss" as const;
  return "flat" as const;
}

export function TradeCalendar({ entries }: { entries: JournalEntry[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map: Record<string, JournalEntry[]> = {};
    for (const e of entries) (map[e.date] ??= []).push(e);
    return map;
  }, [entries]);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const start = new Date(first);
    start.setDate(start.getDate() - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const today = todayKey();
  const dayEntries = selected ? (byDate[selected] ?? []) : [];

  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  return (
    <section className="surface mt-4 p-5">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Trading calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-stats min-w-[9.5rem] text-center text-sm">
            {cursor.toLocaleString("en-US", { month: "long" })} {cursor.getFullYear()}
          </span>
          <button onClick={() => shift(1)} aria-label="Next month" className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="pb-1 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {w}
          </div>
        ))}
        {cells.map((d) => {
          const k = keyOf(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const list = byDate[k] ?? [];
          const net = list.length ? dayNet(list) : null;
          const tone =
            net === "win"
              ? "border-success/40 bg-success/10"
              : net === "loss"
                ? "border-destructive/40 bg-destructive/10"
                : net === "flat"
                  ? "border-gold/35 bg-gold/10"
                  : "border-white/[0.08] bg-white/[0.02]";
          return (
            <button
              key={k}
              onClick={() => setSelected(k)}
              className={`group relative aspect-square rounded-lg border p-1.5 text-left transition-all hover:-translate-y-0.5 hover:border-gold/50 ${tone} ${
                inMonth ? "" : "opacity-30"
              } ${k === today ? "ring-1 ring-gold/70" : ""}`}
            >
              <span className={`font-stats text-xs ${inMonth ? "" : "text-muted-foreground"}`}>{d.getDate()}</span>
              {list.length > 0 && (
                <span className="font-stats absolute bottom-1 right-1 rounded px-1 text-[9px] text-muted-foreground">
                  {list.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="surface animate-rise max-h-[88vh] w-full max-w-lg overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg">{selected}</h3>
                {dayEntries.length > 0 && (
                  <p className="font-stats mt-0.5 text-xs text-muted-foreground">
                    {dayEntries.length} trades ·{" "}
                    {Math.round(
                      (dayEntries.filter((e) => e.result === "win").length /
                        Math.max(1, dayEntries.filter((e) => e.result !== "breakeven").length)) *
                        100,
                    )}
                    % win rate · net {dayNet(dayEntries) === "win" ? "profitable" : dayNet(dayEntries) === "loss" ? "losing" : "breakeven"}
                  </p>
                )}
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {dayEntries.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No trades logged</p>
                <Link
                  to="/journal"
                  className="bg-gold-gradient mt-3 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Log a trade
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEntries.map((e) => (
                  <article key={e.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-base">{e.pair}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] capitalize ${
                          e.result === "win"
                            ? "bg-success/15 text-success"
                            : e.result === "loss"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {e.result}
                      </span>
                      {e.rr && <span className="font-stats ml-auto text-xs text-gold">R:R {e.rr}</span>}
                    </div>
                    {e.setup && <p className="mt-2 text-sm">{e.setup}</p>}
                    {e.concepts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {e.concepts.map((c) => (
                          <span key={c} className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    {(e.entry || e.exit) && (
                      <p className="font-stats mt-2 text-xs text-muted-foreground">
                        Entry {e.entry || "—"} · Exit {e.exit || "—"}
                      </p>
                    )}
                    {e.notes && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{e.notes}</p>}
                    {e.screenshot && (
                      <img src={e.screenshot} alt={`${e.pair} chart`} loading="lazy" className="mt-3 max-h-48 w-full rounded-lg object-cover" />
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
