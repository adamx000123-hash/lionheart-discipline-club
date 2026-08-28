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
            <span className="absolute inset-0 flex items-center justify-center font-display text-lg text-gold">
              {Math.round(ratio * 100)}%
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Today's routine</p>
            <p className="mt-1 font-display text-lg">
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
            <p className="font-display text-3xl text-gold">{streak}</p>
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

      <section className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Recent trades</h2>
          <Link to="/journal" className="text-xs text-gold">
            View journal
          </Link>
        </div>
        {entries.length === 0 ? (
          <EmptyState
            title="The journal is empty"
            body="Start by logging one trade. Reviewing your own decisions is the fastest route to consistency."
            action={
              <Link to="/journal" className="bg-gold-gradient mt-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Log a trade
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {entries.slice(0, 4).map((e) => (
              <div key={e.id} className="surface flex items-center gap-3 p-4">
                <span className="font-display text-base">{e.pair}</span>
                <span className="text-xs text-muted-foreground">{e.date}</span>
                <span
                  className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] capitalize ${
                    e.result === "win"
                      ? "bg-success/15 text-success"
                      : e.result === "loss"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {e.result}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
