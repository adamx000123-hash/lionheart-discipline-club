import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/AppShell";
import { Heatmap } from "@/components/Heatmap";
import { computeStreak, dayRatio, journalStats, lastNDays, useCompletions, useJournal, useTasks } from "@/lib/store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Stats — LEGEND" },
      { name: "description", content: "Track compliance rate, discipline streaks, win rate and average R:R over time." },
      { property: "og:title", content: "Progress & Stats — LEGEND" },
      { property: "og:description", content: "Compliance rate, streaks, win rate and average R:R over time." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [tasks] = useTasks();
  const [completions] = useCompletions();
  const [entries] = useJournal();
  const stats = journalStats(entries);
  const days30 = lastNDays(30);
  const avg30 = Math.round((days30.reduce((a, d) => a + dayRatio(completions, tasks.length, d), 0) / days30.length) * 100);
  const perfect = days30.filter((d) => dayRatio(completions, tasks.length, d) === 1).length;
  const bars = lastNDays(14);

  return (
    <AppShell title="Progress" subtitle="Numbers do not negotiate.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="30-day compliance" value={`${avg30}%`} />
        <StatCard label="Perfect days" value={perfect} hint="last 30 days" />
        <StatCard label="Current streak" value={computeStreak(completions, tasks.length)} />
        <StatCard label="Avg R:R" value={stats.avgRR ? stats.avgRR.toFixed(2) : "—"} />
      </div>

      <section className="surface mt-4 p-5">
        <h2 className="mb-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Last 14 days</h2>
        <div className="flex h-40 items-end gap-1.5">
          {bars.map((d) => {
            const r = dayRatio(completions, tasks.length, d);
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-2" title={`${d} — ${Math.round(r * 100)}%`}>
                <div className="flex h-32 w-full items-end rounded-md bg-secondary/60">
                  <div
                    className="bg-gold-gradient w-full rounded-md transition-[height] duration-700"
                    style={{ height: `${Math.max(r * 100, 3)}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{d.slice(8)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface mt-4 p-5">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Discipline heatmap</h2>
        <Heatmap completions={completions} taskCount={tasks.length} />
      </section>

      <section className="surface mt-4 p-5">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Trade record</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display text-2xl text-success">{stats.wins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="font-display text-2xl text-destructive">{stats.losses}</p>
            <p className="text-xs text-muted-foreground">Losses</p>
          </div>
          <div>
            <p className="font-display text-2xl">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total logged</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
