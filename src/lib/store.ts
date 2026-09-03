import { useCallback, useEffect, useState } from "react";

export type RoutineGroup = "Morning" | "Fuel" | "Focus" | "Learn" | "Worship" | "Night";

export type Task = {
  id: string;
  title: string;
  detail?: string;
  group: RoutineGroup;
};

export type Evidence = {
  name: string;
  dataUrl: string;
  uploadedAt: string;
};

export type EvidenceMap = Record<string, Record<string, Evidence>>;

export const PRAYER_IDS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerId = (typeof PRAYER_IDS)[number];
export type PrayerEvidenceMap = Record<string, Partial<Record<PrayerId, Evidence>>>;

export type JournalEntry = {
  id: string;
  date: string;
  pair: string;
  setup: string;
  concepts: string[];
  entry: string;
  exit: string;
  rr: string;
  result: "win" | "loss" | "breakeven";
  screenshot?: string | undefined;
  notes: string;
  /** schema-driven values from the custom journal field system */
  values?: Record<string, unknown>;
};

export type Completions = Record<string, string[]>; // date -> task ids

const KEYS = {
  tasks: "legend.tasks",
  completions: "legend.completions",
  evidence: "legend.evidence",
  prayerEvidence: "legend.prayerEvidence",
  taskSchemaVersion: "legend.tasks.schemaVersion",
  journal: "legend.journal",
  profile: "legend.profile",
};

const TASK_SCHEMA_VERSION = 2;

export const SMC_CONCEPTS = [
  "Liquidity sweep",
  "Order block",
  "Fair value gap",
  "Break of structure",
  "Change of character",
  "Premium / discount",
  "Session open",
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: "wake-early",
    title: "Wake up early",
    detail: "Aim for at least 8 hours of sleep, rise on time, and start the day before the noise.",
    group: "Morning",
  },
  {
    id: "morning-shower",
    title: "Morning shower",
    detail: "Reset your body and mind immediately after waking up.",
    group: "Morning",
  },
  {
    id: "healthy-breakfast",
    title: "Healthy breakfast",
    detail: "Fuel the day with a clean meal — no autopilot choices.",
    group: "Fuel",
  },
  {
    id: "productive-session",
    title: "Productive session",
    detail: "Work, study, or build something meaningful with focused time.",
    group: "Focus",
  },
  {
    id: "read-and-learn",
    title: "Read or learn",
    detail: "A useful book, lesson, or video that adds a real idea to your mind.",
    group: "Learn",
  },
  {
    id: "five-prayers",
    title: "The five prayers",
    detail: "Log one private proof for Fajr, Dhuhr, Asr, Maghrib, and Isha.",
    group: "Worship",
  },
  {
    id: "sleep-early",
    title: "Sleep early",
    detail: "Sleep early and protect the 8 hours of rest needed to repeat the standard tomorrow.",
    group: "Night",
  },
];

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const version = Number(window.localStorage.getItem(KEYS.taskSchemaVersion) ?? "0");
    if (
      version < TASK_SCHEMA_VERSION &&
      [KEYS.tasks, KEYS.completions, KEYS.evidence, KEYS.prayerEvidence].includes(key)
    ) {
      return fallback;
    }
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* quota */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export const useTasks = () => {
  const stored = useStored<Task[]>(KEYS.tasks, DEFAULT_TASKS);
  const [, , hydrated] = stored;

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const version = Number(window.localStorage.getItem(KEYS.taskSchemaVersion) ?? "0");
    if (version < TASK_SCHEMA_VERSION) {
      [KEYS.tasks, KEYS.completions, KEYS.evidence, KEYS.prayerEvidence].forEach((key) =>
        window.localStorage.removeItem(key),
      );
      window.localStorage.setItem(KEYS.taskSchemaVersion, String(TASK_SCHEMA_VERSION));
    }
  }, [hydrated]);

  return stored;
};

export const useCompletions = () => useStored<Completions>(KEYS.completions, {});
export const useEvidence = () => useStored<EvidenceMap>(KEYS.evidence, {});
export const usePrayerEvidence = () => useStored<PrayerEvidenceMap>(KEYS.prayerEvidence, {});
export const useJournal = () => useStored<JournalEntry[]>(KEYS.journal, []);
export const useProfile = () =>
  useStored<{ name: string; target: number }>(KEYS.profile, { name: "Trader", target: 90 });

export function dayRatio(completions: Completions, taskCount: number, date: string) {
  if (!taskCount) return 0;
  return Math.min(1, (completions[date]?.length ?? 0) / taskCount);
}

export function computeStreak(completions: Completions, taskCount: number, threshold = 0.8) {
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i++) {
    const key = todayKey(cursor);
    const ratio = dayRatio(completions, taskCount, key);
    if (ratio >= threshold) {
      streak++;
    } else if (i > 0 || ratio > 0) {
      break;
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function lastNDays(n: number) {
  const days: string[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    days.push(todayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function journalStats(entries: JournalEntry[]) {
  const total = entries.length;
  const wins = entries.filter((e) => e.result === "win").length;
  const losses = entries.filter((e) => e.result === "loss").length;
  const rrValues = entries.map((e) => parseFloat(e.rr)).filter((n) => !Number.isNaN(n));
  const avgRR = rrValues.length ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : 0;
  const decided = wins + losses;
  return {
    total,
    wins,
    losses,
    winRate: decided ? Math.round((wins / decided) * 100) : 0,
    avgRR,
  };
}
