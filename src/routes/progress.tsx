import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/AppShell";
import { Heatmap } from "@/components/Heatmap";
import { useI18n } from "@/lib/i18n";
import {
  computeStreak,
  dayRatio,
  journalStats,
  lastNDays,
  useCompletions,
  useJournal,
  useTasks,
} from "@/lib/store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Stats — LEGEND" },
      {
        name: "description",
        content: "Track compliance rate, discipline streaks, win rate and average R:R over time.",
      },
      { property: "og:title", content: "Progress & Stats — LEGEND" },
      {
        property: "og:description",
        content: "Compliance rate, streaks, win rate and average R:R over time.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { t } = useI18n();
  const [tasks] = useTasks();
  const [completions] = useCompletions();
  const [entries] = useJournal();
  const stats = journalStats(entries);
  const days30 = lastNDays(30);
  const avg30 = Math.round(
    (days30.reduce((a, d) => a + dayRatio(completions, tasks.length, d), 0) / days30.length) * 100,
  );
  const perfect = days30.filter((d) => dayRatio(completions, tasks.length, d) === 1).length;
  const bars = lastNDays(14);

  return (
    <AppShell title={t("progress.title")} subtitle={t("progress.subtitle")}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("progress.compliance30")} value={`${avg30}%`} />
        <StatCard label={t("progress.perfectDays")} value={perfect} hint={t("progress.last30")} />
        <StatCard label={t("progress.currentStreak")} value={computeStreak(completions, tasks.length)} />
        <StatCard label={t("journal.avgRR")} value={stats.avgRR ? stats.avgRR.toFixed(2) : "—"} />
      </div>

      <section className="surface mt-4 p-5 transition-transform duration-300 hover:-translate-y-0.5">
        <h2 className="mb-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("progress.last14")}
        </h2>
        <div className="flex h-40 items-end gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
          {bars.map((d) => {
            const r = dayRatio(completions, tasks.length, d);
            return (
              <div
                key={d}
                className="flex flex-1 flex-col items-center gap-2"
                title={`${d} — ${Math.round(r * 100)}%`}
              >
                <div className="flex h-32 w-full items-end rounded-md bg-white/[0.06] shadow-[inset_0_1px_0_oklch(1_0_0_/_5%)]">
                  <div
                    className="bg-gold-gradient w-full rounded-md shadow-[0_0_14px_-8px_var(--gold)] transition-[height] duration-700"
                    style={{ height: `${Math.max(r * 100, 3)}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{d.slice(8)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface mt-4 p-5 transition-transform duration-300 hover:-translate-y-0.5">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("progress.heatmap")}
        </h2>
        <Heatmap completions={completions} taskCount={tasks.length} />
      </section>

      <section className="surface mt-4 p-5 transition-transform duration-300 hover:-translate-y-0.5">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {t("progress.record")}
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-stats text-2xl font-semibold text-success">{stats.wins}</p>
            <p className="text-xs text-muted-foreground">{t("progress.wins")}</p>
          </div>
          <div>
            <p className="font-stats text-2xl font-semibold text-destructive">{stats.losses}</p>
            <p className="text-xs text-muted-foreground">{t("progress.losses")}</p>
          </div>
          <div>
            <p className="font-stats text-2xl font-semibold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{t("progress.totalLogged")}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
