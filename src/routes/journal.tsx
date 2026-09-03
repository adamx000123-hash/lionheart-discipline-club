import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, EmptyState, StatCard } from "@/components/AppShell";
import { TradeEntryForm, type TradeFormSubmit } from "@/components/journal/TradeEntryForm";
import {
  journalStats,
  useCompletions,
  useJournal,
  useTasks,
  computeStreak,
  type JournalEntry,
} from "@/lib/store";


export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Trade Journal — LEGEND" },
      {
        name: "description",
        content:
          "Log every forex trade with SMC context, screenshots and honest notes on emotion and discipline.",
      },
      { property: "og:title", content: "Trade Journal — LEGEND" },
      {
        property: "og:description",
        content: "Log every trade with SMC context, screenshots and discipline notes.",
      },
    ],
  }),
  component: JournalPage,
});

const asString = (v: unknown) => (v == null ? "" : String(v));

const toResult = (v: unknown): JournalEntry["result"] => {
  const s = asString(v).toLowerCase();
  if (s.startsWith("l")) return "loss";
  if (s.startsWith("b")) return "breakeven";
  return "win";
};

function JournalPage() {
  const [entries, setEntries] = useJournal();
  const [tasks] = useTasks();
  const [completions] = useCompletions();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [filter, setFilter] = useState<"all" | JournalEntry["result"]>("all");

  const stats = useMemo(() => journalStats(entries), [entries]);
  const streak = computeStreak(completions, tasks.length);
  const visible = entries
    .filter((e) => filter === "all" || e.result === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleSubmit = ({ values }: TradeFormSubmit) => {
    const base: Omit<JournalEntry, "id"> = {
      date: asString(values["date"]) || new Date().toISOString().slice(0, 10),
      pair: asString(values["pair"]).toUpperCase(),
      setup: asString(values["setup"]) || asString(values["tradeName"]),
      concepts: [asString(values["bias"])].filter(Boolean),
      entry: asString(values["entryConfirmation"]),
      exit: "",
      rr: asString(values["pnl"]),
      result: toResult(values["result"]),
      screenshot: (values["screenshot"] as string | undefined) || undefined,
      notes: [asString(values["feelings"]), asString(values["notes"])].filter(Boolean).join(" — "),
      values,
    };
    setEntries((prev) =>
      editing
        ? prev.map((e) => (e.id === editing.id ? { ...base, id: editing.id } : e))
        : [{ ...base, id: crypto.randomUUID() }, ...prev],
    );
    toast.success(editing ? "Trade updated" : "Trade saved");
    setEditing(null);
    setOpen(false);
  };


  return (
    <AppShell title="Journal" subtitle="Unlogged trades did not happen. Write them down.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Win rate"
          value={`${stats.winRate}%`}
          hint={`${stats.wins}W / ${stats.losses}L`}
        />
        <StatCard label="Total trades" value={stats.total} />
        <StatCard label="Avg R:R" value={stats.avgRR ? stats.avgRR.toFixed(2) : "—"} />
        <StatCard label="Streak" value={streak} hint="disciplined days" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", "win", "loss", "breakeven"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`glass-chip px-4 py-1.5 text-xs capitalize transition-all duration-200 ${
              filter === f
                ? "border-gold/60 bg-gold/10 text-gold shadow-[0_0_18px_-10px_var(--gold)]"
                : "text-muted-foreground hover:border-white/[0.22] hover:bg-white/[0.07] hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="glass-button glass-button-gold ml-auto inline-flex px-5 py-2 text-xs font-semibold"
        >
          <Plus className="h-4 w-4" /> New entry
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            title="No trades logged yet"
            body="Your first entry sets the standard. Log the pair, the SMC reasoning, the result, and how you felt executing it."
            action={
              <button
                onClick={() => setOpen(true)}
                className="glass-button glass-button-gold mt-2 px-5 py-2.5 text-sm font-semibold"
              >
                Log first trade
              </button>
            }
          />
        ) : (
          visible.map((e) => (
            <article
              key={e.id}
              className="surface animate-rise p-4 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-lg">{e.pair}</span>
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
                <span className="text-xs text-muted-foreground">{e.date}</span>
                {e.rr && <span className="text-xs text-gold">R:R {e.rr}</span>}
                <button
                  onClick={() => {
                    setEditing(e);
                    setOpen(true);
                  }}
                  aria-label="Edit entry"
                  className="glass-icon-button ml-auto hover:border-gold/50 hover:bg-gold/10 hover:text-gold"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
                  aria-label="Delete entry"
                  className="glass-icon-button hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

              </div>
              {e.setup && <p className="mt-2 text-sm">{e.setup}</p>}
              {e.concepts.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {e.concepts.map((c) => (
                    <span
                      key={c}
                      className="glass-chip px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {(e.entry || e.exit) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Entry {e.entry || "—"} · Exit {e.exit || "—"}
                </p>
              )}
              {e.notes && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{e.notes}</p>
              )}
              {e.screenshot && (
                <img
                  src={e.screenshot}
                  alt={`${e.pair} chart`}
                  loading="lazy"
                  className="mt-3 max-h-72 w-full rounded-lg object-cover"
                />
              )}
            </article>
          ))
        )}
      </div>

      {open && (
        <TradeEntryForm
          editing={editing}
          onClose={() => {
            setEditing(null);
            setOpen(false);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </AppShell>
  );
}
