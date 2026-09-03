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
                  onClick={() => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
                  aria-label="Delete entry"
                  className="glass-icon-button ml-auto hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="surface animate-rise max-h-[92vh] w-full max-w-lg overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg">New trade entry</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="glass-icon-button"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Pair">
                  <input
                    value={form.pair}
                    onChange={(e) => setForm({ ...form, pair: e.target.value })}
                    placeholder="EURUSD"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Setup / strategy">
                <input
                  value={form.setup}
                  onChange={(e) => setForm({ ...form, setup: e.target.value })}
                  placeholder="London sweep into 15m OB"
                  className={inputCls}
                />
              </Field>
              <Field label="SMC concepts">
                <div className="flex flex-wrap gap-1.5">
                  {SMC_CONCEPTS.map((c) => {
                    const on = form.concepts.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            concepts: on ? f.concepts.filter((x) => x !== c) : [...f.concepts, c],
                          }))
                        }
                        className={`glass-chip rounded-md px-2.5 py-1 text-[11px] transition-all duration-200 ${
                          on
                            ? "border-gold/60 bg-gold/10 text-gold shadow-[0_0_18px_-10px_var(--gold)]"
                            : "text-muted-foreground hover:border-white/[0.22] hover:bg-white/[0.07]"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Entry">
                  <input
                    value={form.entry}
                    onChange={(e) => setForm({ ...form, entry: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Exit">
                  <input
                    value={form.exit}
                    onChange={(e) => setForm({ ...form, exit: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="R:R">
                  <input
                    value={form.rr}
                    onChange={(e) => setForm({ ...form, rr: e.target.value })}
                    placeholder="2.5"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Result">
                <div className="flex gap-2">
                  {(["win", "loss", "breakeven"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, result: r })}
                      className={`glass-control flex-1 px-3 py-2 text-xs capitalize transition-all duration-200 ${
                        form.result === r
                          ? "border-gold/60 bg-gold/10 text-gold shadow-[0_0_18px_-10px_var(--gold)]"
                          : "text-muted-foreground hover:border-white/[0.22] hover:bg-white/[0.07]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Chart screenshot">
                <label className="glass-control flex cursor-pointer items-center gap-2 border-dashed px-3 py-3 text-xs text-muted-foreground hover:border-gold/50 hover:bg-gold/[0.06]">
                  <ImagePlus className="h-4 w-4" />
                  {form.screenshot ? "Screenshot attached — replace" : "Upload chart screenshot"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                </label>
              </Field>
              <Field label="Emotion & discipline notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Did you follow the plan? What did you feel before the entry?"
                  className={inputCls}
                />
              </Field>
              <button
                onClick={save}
                className="glass-button glass-button-gold mt-1 w-full rounded-lg py-3 text-sm font-semibold"
              >
                Save entry
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

const inputCls =
  "glass-control w-full px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
