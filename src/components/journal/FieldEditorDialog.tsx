import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import {
  FIELD_TYPES,
  SECTIONS,
  slugId,
  type FieldSection,
  type FieldType,
  type JournalField,
} from "@/lib/journalFields";
import { inputCls } from "./FieldControl";
import { useI18n } from "@/lib/i18n";

type Props = {
  field: JournalField | null;
  mode: "edit" | "create";
  onClose: () => void;
  onSave: (field: JournalField) => void;
  onDelete?: (id: string) => void;
};

export function FieldEditorDialog({ field, mode, onClose, onSave, onDelete }: Props) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<JournalField>(
    field ?? {
      id: "",
      name: "",
      question: "",
      type: "text",
      section: "info",
      required: false,
    },
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    if (!draft.name.trim()) return;
    const next: JournalField = {
      ...draft,
      id: draft.id || slugId(draft.name),
      question: draft.question.trim() || draft.name.trim(),
    };
    if (draft.type === "select") {
      next.options = (draft.options ?? []).map((o) => o.trim()).filter(Boolean);
    }
    onSave(next);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? t("jf.editor.add") : t("jf.edit", { name: draft.name })}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="surface animate-rise max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base">
            {mode === "create" ? t("jf.editor.add") : t("jf.editor.edit")}
          </h3>
          <button onClick={onClose} aria-label={t("journal.close")} className="glass-icon-button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3">
          <Row label={t("jf.editor.name")}>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={inputCls}
              placeholder="Risk %"
            />
          </Row>
          <Row label={t("jf.editor.question")}>
            <input
              value={draft.question}
              onChange={(e) => setDraft({ ...draft, question: e.target.value })}
              className={inputCls}
              placeholder="How much did you risk?"
            />
          </Row>
          <div className="grid grid-cols-2 gap-3">
            <Row label={t("jf.editor.type")}>
              <select
                value={draft.type}
                disabled={draft.builtin}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as FieldType })}
                className={`${inputCls} disabled:opacity-50`}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-background">
                    {t(`jf.type.${t.value}`)}
                  </option>
                ))}
              </select>
            </Row>
            <Row label={t("jf.editor.section")}>
              <select
                value={draft.section}
                onChange={(e) => setDraft({ ...draft, section: e.target.value as FieldSection })}
                className={inputCls}
              >
                {SECTIONS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-background">
                    {t(s.titleKey)}
                  </option>
                ))}
              </select>
            </Row>
          </div>
          {draft.type === "select" && (
            <Row label={t("jf.editor.options")}>
              <input
                value={(draft.options ?? []).join(", ")}
                onChange={(e) => setDraft({ ...draft, options: e.target.value.split(",") })}
                className={inputCls}
                placeholder="Bullish, Bearish, Neutral"
              />
            </Row>
          )}
          <Row label={t("jf.editor.placeholder")}>
            <input
              value={draft.placeholder ?? ""}
              onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })}
              className={inputCls}
            />
          </Row>
          <Row label={t("jf.editor.helper")}>
            <input
              value={draft.helper ?? ""}
              onChange={(e) => setDraft({ ...draft, helper: e.target.value })}
              className={inputCls}
            />
          </Row>
          <label className="glass-control flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(e) => setDraft({ ...draft, required: e.target.checked })}
              className="h-4 w-4 accent-[var(--gold)]"
            />
            <span className="text-muted-foreground">{t("jf.editor.required")}</span>
          </label>

          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={save}
              className="glass-button glass-button-gold flex-1 rounded-lg py-2.5 text-sm font-semibold"
            >
              {t("jf.editor.save")}
            </button>
            <button onClick={onClose} className="glass-button rounded-lg px-4 py-2.5 text-sm">
              {t("journal.cancel")}
            </button>
            {mode === "edit" && onDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                aria-label={t("jf.editor.delete")}
                className="glass-icon-button hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {confirmDelete && onDelete && (
            <div className="glass-control rounded-lg border-destructive/40 p-3 text-xs">
              <p className="text-muted-foreground">
                {t("jf.editor.confirm", { name: draft.name })}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onDelete(draft.id)}
                  className="glass-button rounded-md px-3 py-1.5 text-xs text-destructive"
                >
                  {t("jf.editor.yesDelete")}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="glass-button rounded-md px-3 py-1.5 text-xs"
                >
                  {t("jf.editor.keep")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
