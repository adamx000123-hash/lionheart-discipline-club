import { useI18n } from "@/lib/i18n";
import { dayRatio, lastNDays, type Completions } from "@/lib/store";

export function Heatmap({ completions, taskCount, days = 119 }: { completions: Completions; taskCount: number; days?: number }) {
  const { t } = useI18n();
  const list = lastNDays(days);
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {list.map((d) => {
          const r = dayRatio(completions, taskCount, d);
          const opacity = r === 0 ? 0.06 : 0.2 + r * 0.8;
          return (
            <div
              key={d}
              title={`${d} — ${Math.round(r * 100)}%`}
              className="h-3.5 w-3.5 rounded-[3px]"
              style={{ backgroundColor: `color-mix(in oklab, var(--gold) ${opacity * 100}%, transparent)` }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>{t("heatmap.low")}</span>
        {[0.06, 0.35, 0.6, 0.85, 1].map((o) => (
          <span
            key={o}
            className="h-3 w-3 rounded-[3px]"
            style={{ backgroundColor: `color-mix(in oklab, var(--gold) ${o * 100}%, transparent)` }}
          />
        ))}
        <span>{t("heatmap.high")}</span>
      </div>
    </div>
  );
}
