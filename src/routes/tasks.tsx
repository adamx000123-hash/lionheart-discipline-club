import { createFileRoute } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Apple,
  ArrowUpRight,
  Bath,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  Check,
  Clock3,
  CloudUpload,
  Flame,
  Heart,
  ImagePlus,
  LockKeyhole,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import { AppShell, ProgressRing } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import {
  PRAYER_IDS,
  type Evidence,
  type PrayerEvidenceMap,
  type PrayerId,
  type RoutineGroup,
  type Task,
  computeStreak,
  todayKey,
  useCompletions,
  useEvidence,
  usePrayerEvidence,
  useTasks,
} from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Daily Protocol — LEGEND" },
      {
        name: "description",
        content:
          "A calm daily protocol for rising early, eating well, doing meaningful work, learning, prayer, and resting on time.",
      },
      { property: "og:title", content: "Daily Protocol — LEGEND" },
      {
        property: "og:description",
        content: "Build a disciplined day one proof at a time.",
      },
    ],
  }),
  component: TasksPage,
});

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const GROUP_ORDER: RoutineGroup[] = ["Morning", "Fuel", "Focus", "Learn", "Worship", "Night"];

const GROUP_ICON: Record<RoutineGroup, LucideIcon> = {
  Morning: Sun,
  Fuel: Apple,
  Focus: BriefcaseBusiness,
  Learn: BookOpen,
  Worship: Heart,
  Night: MoonStar,
};

const TASK_ICON: Record<string, LucideIcon> = {
  "wake-early": Sun,
  "morning-shower": Bath,
  "healthy-breakfast": Apple,
  "productive-session": BriefcaseBusiness,
  "read-and-learn": BookOpen,
  "five-prayers": Heart,
  "sleep-early": MoonStar,
};


function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const source = new Image();
      source.onload = () => {
        const maxDimension = 1280;
        const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(source.width * scale));
        canvas.height = Math.max(1, Math.round(source.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      source.onerror = () => reject(new Error("Image could not be read"));
      source.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("File could not be read"));
    reader.readAsDataURL(file);
  });
}

async function makeEvidence(file: File): Promise<Evidence> {
  if (!file.type.startsWith("image/")) {
    throw new Error("err.image");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("err.size");
  }
  return {
    name: file.name,
    dataUrl: await compressImage(file),
    uploadedAt: new Date().toISOString(),
  };
}

function EvidencePreview({
  evidence,
  onRemove,
  compact = false,
}: {
  evidence: Evidence;
  onRemove: () => void;
  compact?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div
      className={`group/evidence relative overflow-hidden rounded-xl border border-gold/30 bg-black/25 ${compact ? "h-14 w-14" : "h-24 w-full sm:w-36"}`}
    >
      <img
        src={evidence.dataUrl}
        alt={t("proof.preview")}
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("proof.remove")}
        className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white opacity-0 backdrop-blur transition-opacity group-hover/evidence:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function ProofButton({
  inputId,
  uploading,
  onChange,
  hasEvidence,
}: {
  inputId: string;
  uploading: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  hasEvidence: boolean;
}) {
  const { t } = useI18n();
  return (
    <>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className="glass-button inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium"
      >
        {uploading ? (
          <CloudUpload className="h-4 w-4 animate-pulse text-gold" />
        ) : hasEvidence ? (
          <Camera className="h-4 w-4 text-gold" />
        ) : (
          <ImagePlus className="h-4 w-4 text-gold" />
        )}
        {uploading ? t("proof.saving") : hasEvidence ? t("proof.replace") : t("proof.add")}
      </label>
    </>
  );
}

function TaskCard({
  task,
  checked,
  evidence,
  uploading,
  onToggle,
  onUpload,
  onRemoveEvidence,
}: {
  task: Task;
  checked: boolean;
  evidence: Evidence | undefined;
  uploading: boolean;
  onToggle: () => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveEvidence: () => void;
}) {
  const { t } = useI18n();
  const Icon = TASK_ICON[task.id] ?? Sparkles;
  const title = t(`task.${task.id}.title`) === `task.${task.id}.title` ? task.title : t(`task.${task.id}.title`);
  const detail = t(`task.${task.id}.detail`) === `task.${task.id}.detail` ? task.detail : t(`task.${task.id}.detail`);
  const prompt = t(`prompt.${task.id}`) === `prompt.${task.id}` ? t("prompt.default") : t(`prompt.${task.id}`);
  const timing = t(`timing.${task.id}`) === `timing.${task.id}` ? "" : t(`timing.${task.id}`);
  const inputId = `proof-${task.id}`;

  return (
    <article
      className={`surface group overflow-hidden p-4 transition-all duration-200 sm:p-5 ${checked ? "border-gold/45 bg-gold/[0.07] shadow-[0_18px_48px_-34px_var(--gold)]" : "hover:-translate-y-0.5 hover:border-white/20"}`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${checked ? t("task.markIncomplete") : t("task.complete")} ${title}`}
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 active:scale-90 ${checked ? "border-gold/70 bg-gold/20 text-gold shadow-[0_0_22px_-8px_var(--gold)]" : "border-white/15 bg-white/[0.04] text-muted-foreground hover:border-gold/55 hover:bg-gold/10 hover:text-gold"}`}
        >
          {checked ? (
            <Check className="animate-check h-4 w-4" strokeWidth={3} />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-sm font-semibold ${checked ? "text-gold-soft" : "text-foreground"}`}
            >
              {title}
            </h3>
            {timing && (
              <span className="glass-chip inline-flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground">
                <Clock3 className="h-3 w-3" />
                {timing}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" />
            {prompt}
          </p>
        </div>

        <span
          className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] sm:inline-flex ${checked ? "border-gold/35 bg-gold/10 text-gold" : "border-white/10 bg-white/[0.03] text-muted-foreground"}`}
        >
          {checked ? t("status.complete") : t("status.open")}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.08] pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <LockKeyhole className="h-3.5 w-3.5 text-gold/75" />
          {t("proof.private")}
        </div>
        <div className="flex items-center gap-2">
          {evidence && <EvidencePreview evidence={evidence} onRemove={onRemoveEvidence} compact />}
          <ProofButton
            inputId={inputId}
            uploading={uploading}
            onChange={onUpload}
            hasEvidence={Boolean(evidence)}
          />
        </div>
      </div>
    </article>
  );
}

function PrayerCard({
  evidence,
  uploading,
  onUpload,
  onRemove,
}: {
  evidence: Partial<Record<PrayerId, Evidence>>;
  uploading: string | null;
  onUpload: (id: PrayerId, event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (id: PrayerId) => void;
}) {
  const { t } = useI18n();
  const complete = PRAYER_IDS.filter((id) => Boolean(evidence[id])).length;

  return (
    <article
      className={`surface overflow-hidden p-4 transition-all duration-200 sm:p-5 ${complete === 5 ? "border-gold/45 bg-gold/[0.07] shadow-[0_18px_48px_-34px_var(--gold)]" : "hover:border-white/20"}`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${complete === 5 ? "border-gold/70 bg-gold/20 text-gold" : "border-gold/30 bg-gold/10 text-gold"}`}
        >
          {complete === 5 ? (
            <Check className="animate-check h-4 w-4" strokeWidth={3} />
          ) : (
            <Heart className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{t("prayers.title")}</h3>
            <span className="glass-chip inline-flex items-center gap-1 px-2 py-1 text-[10px] text-gold">
              <Heart className="h-3 w-3" />
              {t("prayers.logged", { n: complete })}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("prayers.body")}
          </p>
        </div>
        <span
          className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] sm:inline-flex ${complete === 5 ? "border-gold/35 bg-gold/10 text-gold" : "border-white/10 bg-white/[0.03] text-muted-foreground"}`}
        >
          {complete === 5 ? t("status.complete") : t("status.inProgress")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PRAYER_IDS.map((prayerId) => {
          const prayer = { id: prayerId, label: t(`prayer.${prayerId}`), time: t(`prayer.${prayerId}.time`) };
          const prayerEvidence = evidence[prayer.id];
          const inputId = `proof-prayer-${prayer.id}`;
          const isUploading = uploading === prayer.id;
          return (
            <div
              key={prayer.id}
              className={`relative rounded-xl border p-3 transition-colors ${prayerEvidence ? "border-gold/40 bg-gold/[0.08]" : "border-white/10 bg-white/[0.025] hover:border-white/20"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${prayerEvidence ? "text-gold-soft" : "text-foreground"}`}
                >
                  {prayer.label}
                </span>
                {prayerEvidence ? (
                  <Check className="h-3.5 w-3.5 text-gold" strokeWidth={3} />
                ) : (
                  <span className="text-[10px] text-muted-foreground">{prayer.time}</span>
                )}
              </div>
              {prayerEvidence ? (
                <div className="mt-2 space-y-2">
                  <EvidencePreview evidence={prayerEvidence} onRemove={() => onRemove(prayer.id)} />
                  <label
                    htmlFor={inputId}
                    className="flex cursor-pointer items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-gold"
                  >
                    <Upload className="h-3 w-3" /> {t("proof.replaceShort")}
                  </label>
                </div>
              ) : (
                <label
                  htmlFor={inputId}
                  className="mt-3 flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.03] text-[10px] text-muted-foreground transition-colors hover:border-gold/45 hover:bg-gold/10 hover:text-gold"
                >
                  {isUploading ? (
                    <CloudUpload className="h-3.5 w-3.5 animate-pulse" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                  {isUploading ? t("proof.saveShort") : t("proof.add")}
                </label>
              )}
              <input
                id={inputId}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => onUpload(prayer.id, event)}
                className="sr-only"
              />
            </div>
          );
        })}
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/75" />
        {t("prayers.note")}
      </p>
    </article>
  );
}

function TasksPage() {
  const { t } = useI18n();
  const [tasks] = useTasks();
  const [completions, setCompletions] = useCompletions();
  const [evidence, setEvidence] = useEvidence();
  const [prayerEvidence, setPrayerEvidence] = usePrayerEvidence();
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const today = todayKey();
  const done = completions[today] ?? [];
  const dayEvidence = evidence[today] ?? {};
  const dayPrayers = prayerEvidence[today] ?? {};
  const prayerCount = PRAYER_IDS.filter((id) => Boolean(dayPrayers[id])).length;
  const ratio = tasks.length ? done.length / tasks.length : 0;
  const streak = computeStreak(completions, tasks.length);
  const evidenceCount = Object.keys(dayEvidence).length + prayerCount;
  const groupedTasks = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({ group, tasks: tasks.filter((task) => task.group === group) })),
    [tasks],
  );

  const setTaskCompleted = (id: string, completed: boolean) => {
    setCompletions((previous) => {
      const current = previous[today] ?? [];
      const next = completed
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((taskId) => taskId !== id);
      return { ...previous, [today]: next };
    });
  };

  const toggleTask = (id: string) => setTaskCompleted(id, !done.includes(id));

  const saveEvidence = async (scope: string, file: File) => {
    setError("");
    setUploading(scope);
    try {
      const proof = await makeEvidence(file);
      setEvidence((previous) => ({
        ...previous,
        [today]: { ...(previous[today] ?? {}), [scope]: proof },
      }));
      setTaskCompleted(scope, true);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? t(uploadError.message) : t("err.save"),
      );
    } finally {
      setUploading(null);
    }
  };

  const savePrayerEvidence = async (id: PrayerId, file: File) => {
    setError("");
    setUploading(id);
    try {
      const proof = await makeEvidence(file);
      const nextPrayers = { ...(dayPrayers ?? {}), [id]: proof };
      setPrayerEvidence((previous) => ({ ...previous, [today]: nextPrayers }));
      if (PRAYER_IDS.every((prayerId) => Boolean(nextPrayers[prayerId]))) {
        setTaskCompleted("five-prayers", true);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? t(uploadError.message) : t("err.savePrayer"),
      );
    } finally {
      setUploading(null);
    }
  };

  const removeEvidence = (scope: string) => {
    setEvidence((previous) => {
      const nextDay = { ...(previous[today] ?? {}) };
      delete nextDay[scope];
      return { ...previous, [today]: nextDay };
    });
  };

  const removePrayerEvidence = (id: PrayerId) => {
    const nextPrayers = { ...(dayPrayers ?? {}) };
    delete nextPrayers[id];
    setPrayerEvidence((previous) => ({ ...previous, [today]: nextPrayers }));
    setTaskCompleted("five-prayers", false);
  };

  const onTaskUpload = (taskId: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void saveEvidence(taskId, file);
  };

  const onPrayerUpload = (id: PrayerId, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void savePrayerEvidence(id, file);
  };

  return (
    <AppShell title={t("protocol.title")} subtitle={t("protocol.subtitle")}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <section className="surface relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              {t("protocol.eyebrow")}
            </div>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <ProgressRing value={ratio} size={118} />
                <span className="font-stats absolute inset-0 flex items-center justify-center text-2xl font-semibold text-gold">
                  {Math.round(ratio * 100)}%
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-hero text-2xl leading-tight text-foreground sm:text-3xl">
                  {t("protocol.headline")}
                </p>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {t("protocol.body")}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="glass-chip inline-flex items-center gap-1.5 px-2.5 py-1.5 text-foreground">
                    <Check className="h-3.5 w-3.5 text-gold" />
                    {t("protocol.steps", { done: done.length, total: tasks.length })}
                  </span>
                  <span className="glass-chip inline-flex items-center gap-1.5 px-2.5 py-1.5 text-foreground">
                    <Camera className="h-3.5 w-3.5 text-gold" />
                    {t("protocol.proofs", { n: evidenceCount })}
                  </span>
                  <span className="glass-chip inline-flex items-center gap-1.5 px-2.5 py-1.5 text-foreground">
                    <Heart className="h-3.5 w-3.5 text-gold" />
                    {t("protocol.prayers", { n: prayerCount })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface flex flex-col justify-between gap-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {t("protocol.streak")}
              </p>
              <p className="font-stats mt-2 text-4xl font-semibold text-gold">{streak}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("protocol.streakHint")}</p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
            <p className="flex items-center gap-2 text-xs font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-gold" />
              {t("protocol.locker")}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              {t("protocol.lockerBody")}
            </p>
          </div>
        </section>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-xs text-destructive-foreground"
        >
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-7 space-y-7">
        {groupedTasks.map(({ group, tasks: list }) => {
          if (!list.length) return null;
          const GroupIcon = GROUP_ICON[group];
          return (
            <section key={group}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-gold/80">
                    {t(`g.${group}.eyebrow`)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
                      <GroupIcon className="h-4 w-4" />
                    </span>
                    <h2 className="font-hero text-xl text-foreground">{t(`g.${group}.label`)}</h2>
                  </div>
                </div>
                <p className="hidden max-w-xs text-right text-[11px] leading-relaxed text-muted-foreground sm:block">
                  {t(`g.${group}.desc`)}
                </p>
              </div>
              <div className="space-y-2.5">
                {list.map((task) =>
                  task.id === "five-prayers" ? (
                    <PrayerCard
                      key={task.id}
                      evidence={dayPrayers}
                      uploading={uploading}
                      onUpload={onPrayerUpload}
                      onRemove={removePrayerEvidence}
                    />
                  ) : (
                    <TaskCard
                      key={task.id}
                      task={task}
                      checked={done.includes(task.id)}
                      evidence={dayEvidence[task.id]}
                      uploading={uploading === task.id}
                      onToggle={() => toggleTask(task.id)}
                      onUpload={onTaskUpload(task.id)}
                      onRemoveEvidence={() => removeEvidence(task.id)}
                    />
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="surface mt-7 overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
              <LockKeyhole className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t("protocol.privacyTitle")}</p>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                {t("protocol.privacyBody")}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-gold">
            <ArrowUpRight className="h-4 w-4" />
            {t("protocol.keepGoing")}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
