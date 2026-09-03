import { useCallback, useEffect, useState } from "react";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "rating"
  | "image";

export type FieldSection = "info" | "result" | "psych";

export type JournalField = {
  id: string;
  name: string;
  question: string;
  type: FieldType;
  section: FieldSection;
  required: boolean;
  placeholder?: string;
  helper?: string;
  options?: string[];
  /** builtin fields map onto legacy entry properties and cannot change type */
  builtin?: boolean;
  /** i18n keys used when a translation exists for the default copy */
  nameKey?: string;
  questionKey?: string;
  wide?: boolean;
};

export const SECTIONS: { id: FieldSection; title: string; titleKey: string; hint: string }[] = [
  {
    id: "info",
    title: "Trade Information",
    titleKey: "jf.section.info",
    hint: "The facts of the trade — what, when and why.",
  },
  {
    id: "result",
    title: "Trade Result",
    titleKey: "jf.section.result",
    hint: "The outcome and the proof.",
  },
  {
    id: "psych",
    title: "Psychology & Review",
    titleKey: "jf.section.psych",
    hint: "The part most traders skip.",
  },
];

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "rating", label: "Rating" },
  { value: "image", label: "Image upload" },
];

export const DEFAULT_JOURNAL_FIELDS: JournalField[] = [
  {
    id: "tradeName",
    name: "Trade Name",
    question: "What is the name of this trade?",
    type: "text",
    section: "info",
    required: true,
    placeholder: "London sweep — GU",
    builtin: true,
  },
  {
    id: "date",
    name: "Entry Date",
    question: "When did you enter this trade?",
    type: "date",
    section: "info",
    required: true,
    builtin: true,
  },
  {
    id: "pair",
    name: "Trading Pair",
    question: "Which trading pair did you trade?",
    type: "text",
    section: "info",
    required: true,
    placeholder: "BTC/USDT, EUR/USD, XAU/USD",
    builtin: true,
  },
  {
    id: "bias",
    name: "Bias",
    question: "What was your market bias?",
    type: "select",
    section: "info",
    required: false,
    options: ["Bullish", "Bearish", "Neutral"],
    builtin: true,
  },
  {
    id: "setup",
    name: "Setup",
    question: "What trading setup did you use?",
    type: "textarea",
    section: "info",
    required: false,
    placeholder: "Liquidity sweep of Asia high into 15m order block…",
    helper: "Describe the structure, timeframe and the SMC concepts involved.",
    builtin: true,
    wide: true,
  },
  {
    id: "entryConfirmation",
    name: "Entry Confirmation",
    question: "What confirmed your entry?",
    type: "textarea",
    section: "info",
    required: false,
    placeholder: "CHoCH on 1m + FVG retest with displacement…",
    builtin: true,
    wide: true,
  },
  {
    id: "result",
    name: "Result",
    question: "What was the result of this trade?",
    type: "select",
    section: "result",
    required: true,
    options: ["Win", "Loss", "Break-even"],
    builtin: true,
  },
  {
    id: "pnl",
    name: "Profit / Loss",
    question: "What was your profit or loss?",
    type: "number",
    section: "result",
    required: false,
    placeholder: "-120.50",
    helper: "Use a negative value for a loss.",
    builtin: true,
  },
  {
    id: "screenshot",
    name: "Screenshot",
    question: "Upload a screenshot of your trade",
    type: "image",
    section: "result",
    required: false,
    helper: "PNG, JPG or WEBP.",
    builtin: true,
    wide: true,
  },
  {
    id: "feelings",
    name: "Feelings",
    question: "How did you feel during this trade?",
    type: "textarea",
    section: "psych",
    required: false,
    placeholder: "Calm, impatient, revenge-driven…",
    builtin: true,
  },
  {
    id: "notes",
    name: "Notes",
    question: "What did you learn from this trade?",
    type: "textarea",
    section: "psych",
    required: false,
    placeholder: "The lesson you want to remember next session.",
    builtin: true,
    wide: true,
  },
  {
    id: "review",
    name: "Review Score",
    question: "How would you rate this trade from 0 to 10?",
    type: "rating",
    section: "psych",
    required: false,
    helper: "Rate the execution, not the outcome.",
    builtin: true,
    wide: true,
  },
];

const FIELDS_KEY = "legend.journal.fields";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useStoredJson<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readJson<T>(key, fallback));
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

/** Merge stored config with defaults so new builtin fields appear and removed ones stay removed. */
export function useJournalFields() {
  return useStoredJson<JournalField[]>(FIELDS_KEY, DEFAULT_JOURNAL_FIELDS);
}

/** Unique previously-entered string values per field id — powers Google-style suggestions. */
export function collectSuggestions(
  entries: { values?: Record<string, unknown> }[],
  fields: JournalField[],
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  fields.forEach((f) => {
    if (f.type !== "text" && f.type !== "number") return;
    const seen = new Set<string>();
    entries.forEach((e) => {
      const v = e.values?.[f.id];
      if (v == null) return;
      const s = String(v).trim();
      if (s && !seen.has(s)) seen.add(s);
    });
    out[f.id] = [...seen].slice(0, 12);
  });
  return out;
}

export function emptyValueFor(field: JournalField): unknown {
  switch (field.type) {
    case "checkbox":
      return false;
    case "rating":
      return 5;
    case "date":
      return new Date().toISOString().slice(0, 10);
    default:
      return "";
  }
}

export function initialValues(fields: JournalField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  fields.forEach((f) => {
    out[f.id] = emptyValueFor(f);
  });
  return out;
}

export function isEmptyValue(field: JournalField, value: unknown) {
  if (field.type === "checkbox") return value !== true;
  if (field.type === "rating") return value === undefined || value === null || value === "";
  return value === undefined || value === null || String(value).trim() === "";
}

export function validateValues(fields: JournalField[], values: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  fields.forEach((f) => {
    if (f.required && isEmptyValue(f, values[f.id])) {
      errors[f.id] = `${f.name} is required`;
    }
  });
  return errors;
}

export function slugId(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "field"}-${Math.random().toString(36).slice(2, 7)}`;
}
