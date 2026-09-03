import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  SECTIONS,
  collectSuggestions,
  initialValues,
  useJournalFields,
  validateValues,
  type JournalField,
} from "@/lib/journalFields";
import { FieldControl } from "./FieldControl";
import { FieldEditorDialog } from "./FieldEditorDialog";
import { useJournal, type JournalEntry } from "@/lib/store";

export type TradeFormSubmit = {
  values: Record<string, unknown>;
  fields: JournalField[];
};

export function TradeEntryForm({
  editing,
  onClose,
  onSubmit,
}: {
  editing?: JournalEntry | null;
  onClose: () => void;
  onSubmit: (payload: TradeFormSubmit) => void;
}) {
  const [fields, setFields] = useJournalFields();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editor, setEditor] = useState<{ mode: "edit" | "create"; field: JournalField | null } | null>(
    null,
  );
  const [dirty, setDirty] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready || fields.length === 0) return;
    const base = initialValues(fields);
    if (editing) {
      setValues({ ...base, ...(editing.values ?? {}) });
    } else {
      setValues(base);
    }
    setReady(true);
  }, [fields, editing, ready]);

  // warn before losing unsaved work
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const [entries] = useJournal();
  const suggestions = useMemo(() => collectSuggestions(entries, fields), [entries, fields]);

  const grouped = useMemo(
    () => SECTIONS.map((s) => ({ ...s, items: fields.filter((f) => f.section === s.id) })),
    [fields],
  );

  const setValue = (id: string, value: unknown) => {
    setDirty(true);
    setValues((v) => ({ ...v, [id]: value }));
    setErrors((e) => {
      if (!e[id]) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });
  };

  const move = (field: JournalField, dir: -1 | 1) => {
    setFields((prev) => {
      const sectionIds = prev.filter((f) => f.section === field.section).map((f) => f.id);
      const pos = sectionIds.indexOf(field.id);
      const target = sectionIds[pos + dir];
      if (!target) return prev;
      const next = [...prev];
      const a = next.findIndex((f) => f.id === field.id);
      const b = next.findIndex((f) => f.id === target);
      [next[a], next[b]] = [next[b]!, next[a]!];
      return next;
    });
  };

  const saveField = (field: JournalField) => {
    setFields((prev) =>
      prev.some((f) => f.id === field.id)
        ? prev.map((f) => (f.id === field.id ? field : f))
        : [...prev, field],
    );
    setValues((v) => (field.id in v ? v : { ...v, [field.id]: field.type === "rating" ? 5 : "" }));
    setEditor(null);
    toast.success("Field saved");
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setEditor(null);
    toast.success("Field deleted");
  };

  const submit = () => {
    const found = validateValues(fields, values);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please complete the required fields");
      const first = fields.find((f) => found[f.id]);
      if (first) document.getElementById(first.id)?.scrollIntoView({ block: "center" });
      return;
    }
    setDirty(false);
    onSubmit({ values, fields });
  };

  const cancel = () => {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="New trade entry"
    >
      <div className="surface animate-rise max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl sm:p-7">
        <div className="mb-6 flex items-start gap-3">
          <div>
            <h2 className="font-display text-xl sm:text-2xl">
              {editing ? "Edit Trade Entry" : "New Trade Entry"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Record your trade, analyze your decisions, and improve your performance.
            </p>
          </div>
          <button onClick={cancel} aria-label="Close" className="glass-icon-button ms-auto">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {grouped.map((section) => (
            <section
              key={section.id}
              className="rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 shadow-[0_24px_60px_-48px_rgba(0,0,0,0.9)] sm:p-5"
              aria-label={section.title}
            >
              <header className="mb-4">
                <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
                  {section.title}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground">{section.hint}</p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((f, i) => (
                  <FieldControl
                    key={f.id}
                    field={f}
                    value={values[f.id]}
                    error={errors[f.id]}
                    suggestions={suggestions[f.id]}
                    onChange={(v) => setValue(f.id, v)}
                    onEdit={() => setEditor({ mode: "edit", field: f })}
                    onMove={(d) => move(f, d)}
                    canMoveUp={i > 0}
                    canMoveDown={i < section.items.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={() => setEditor({ mode: "create", field: null })}
            className="glass-button flex w-full items-center justify-center gap-2 rounded-xl border-dashed py-3 text-sm font-medium hover:border-gold/50 hover:text-gold"
          >
            <Plus className="h-4 w-4" /> Add Custom Field
          </button>

          <div className="sticky bottom-0 -mx-5 mt-2 flex flex-col gap-2 border-t border-white/[0.08] bg-background/85 px-5 py-4 backdrop-blur sm:-mx-7 sm:flex-row sm:px-7">
            <button
              onClick={submit}
              className="glass-button glass-button-gold flex-1 rounded-lg py-3 text-sm font-semibold"
            >
              Save Trade
            </button>
            <button onClick={cancel} className="glass-button rounded-lg px-5 py-3 text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {editor && (
        <FieldEditorDialog
          mode={editor.mode}
          field={editor.field}
          onClose={() => setEditor(null)}
          onSave={saveField}
          onDelete={editor.field?.builtin === true ? deleteField : deleteField}
        />
      )}
    </div>
  );
}
