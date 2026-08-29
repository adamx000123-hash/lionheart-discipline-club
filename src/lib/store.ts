import { useCallback, useEffect, useState } from "react";

export type Task = {
  id: string;
  title: string;
  detail?: string;
  group: "Pre-market" | "Execution" | "Review";
};

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
};

export type Completions = Record<string, string[]>; // date -> task ids

const KEYS = {
  tasks: "legend.tasks",
  completions: "legend.completions",
  journal: "legend.journal",
  profile: "legend.profile",
};

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
  { id: "t1", title: "Review higher timeframe bias", detail: "Daily and 4H structure before anything else.", group: "Pre-market" },
  { id: "t2", title: "Mark key liquidity and order blocks", detail: "Levels defined before the session opens.", group: "Pre-market" },
  { id: "t3", title: "Confirm max risk per trade", detail: "No position exceeds 1% of account equity.", group: "Execution" },
  { id: "t4", title: "Only A+ setups taken", detail: "No entry without confirmation from the plan.", group: "Execution" },
  { id: "t5", title: "No revenge trades after a loss", detail: "Step away for 15 minutes minimum.", group: "Execution" },
  { id: "t6", title: "Journal every trade taken", detail: "Screenshot, reasoning, emotion.", group: "Review" },
  { id: "t7", title: "Grade the day honestly", detail: "Process over profit and loss.", group: "Review" },
];

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
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

export const useTasks = () => useStored<Task[]>(KEYS.tasks, DEFAULT_TASKS);
export const useCompletions = () => useStored<Completions>(KEYS.completions, {});
export const useJournal = () => useStored<JournalEntry[]>(KEYS.journal, []);
export const useProfile = () => useStored<{ name: string; target: number }>(KEYS.profile, { name: "Trader", target: 90 });

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
