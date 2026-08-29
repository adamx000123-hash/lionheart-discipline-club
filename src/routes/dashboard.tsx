import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame } from "lucide-react";
import { AppShell, EmptyState, ProgressRing, StatCard } from "@/components/AppShell";
import { Heatmap } from "@/components/Heatmap";
import { computeStreak, dayRatio, journalStats, lastNDays, todayKey, useCompletions, useJournal, useTasks } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LEGEND" },
      { name: "description", content: "Today's routine, recent trades and your consistency heatmap in one disciplined overview." },
      { property: "og:title", content: "Dashboard — LEGEND" },
      { property: "og:description", content: "Today's routine, recent trades and your consistency heatmap." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [tasks] = useTasks();
  const [completions] = useCompletions();
  const [entries] = useJournal();
  const today = todayKey();
  const done = completions[today] ?? [];
  const ratio = tasks.length ? done.length / tasks.length : 0;
  const streak = computeStreak(completions, tasks.length);
  const stats = journalStats(entries);
  const week = lastNDays(7);
  const weekAvg = Math.round((week.reduce((a, d) => a + dayRatio(completions, tasks.length, d), 0) / week.length) * 100);

  return (
    <AppShell title="Overview" subtitle="Consistency is the scoreboard. Profit is the byproduct.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface flex items-center gap-5 p-5">
          <div className="relative shrink-0">
            <ProgressRing value={ratio} size={104} />
            <span className="font-stats absolute inset-0 flex items-center justify-center text-lg font-semibold text-gold">
              {Math.round(ratio * 100)}%
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Today's routine</p>
            <p className="font-stats mt-1 text-lg font-semibold">
              {done.length}/{tasks.length} done
            </p>
            <Link to="/tasks" className="mt-2 inline-flex items-center gap-1 text-xs text-gold">
              Open checklist <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="surface flex items-center gap-4 p-5">
          <Flame className="h-8 w-8 text-gold" />
          <div>
            <p className="font-stats text-3xl font-semibold text-gold">{streak}</p>
            <p className="text-xs text-muted-foreground">day discipline streak</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="7-day avg" value={`${weekAvg}%`} />
          <StatCard label="Win rate" value={`${stats.winRate}%`} />
        </div>
      </div>

      <section className="surface mt-4 p-5">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Consistency — last 17 weeks</h2>
        <Heatmap completions={completions} taskCount={tasks.length} />
      </section>

      <TradeCalendar entries={entries} />
    </AppShell>
  );
}
