import { ChevronDown, ChevronUp, ImagePlus, Pencil, X } from "lucide-react";
import { useRef, useState } from "react";
import type { JournalField } from "@/lib/journalFields";

export const inputCls =
  "glass-control w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-gold/60 focus:shadow-[0_0_22px_-12px_var(--gold)]";

type Props = {
  field: JournalField;
  value: unknown;
  error?: string | undefined;
  onChange: (value: unknown) => void;
  onEdit: () => void;
  onMove: (dir: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function FieldControl({
  field,
  value,
  error,
  onChange,
  onEdit,
  onMove,
  canMoveUp,
  canMoveDown,
}: Props) {
  const describedBy = error ? `${field.id}-error` : field.helper ? `${field.id}-help` : undefined;

  return (
    <div className={field.wide ? "sm:col-span-2" : ""}>
      <div className="mb-1.5 flex items-center gap-2">
        <label
          htmlFor={field.id}
          className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {field.question}
          {field.required && (
            <span className="ms-1 text-gold" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="ms-auto flex items-center gap-0.5 opacity-60 transition-opacity duration-200 hover:opacity-100">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={!canMoveUp}
            aria-label={`Move ${field.name} up`}
            className="glass-icon-button h-6 w-6 disabled:opacity-25"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={!canMoveDown}
            aria-label={`Move ${field.name} down`}
            className="glass-icon-button h-6 w-6 disabled:opacity-25"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit field ${field.name}`}
            className="glass-icon-button h-6 w-6 hover:border-gold/50 hover:text-gold"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Control field={field} value={value} onChange={onChange} describedBy={describedBy} />

      {field.helper && !error && (
        <p id={`${field.id}-help`} className="mt-1.5 text-[11px] text-muted-foreground">
          {field.helper}
        </p>
      )}
      {error && (
        <p id={`${field.id}-error`} role="alert" className="mt-1.5 text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Control({
  field,
  value,
  onChange,
  describedBy,
}: {
  field: JournalField;
  value: unknown;
  onChange: (v: unknown) => void;
  describedBy?: string | undefined;
}) {
  const common = {
    id: field.id,
    "aria-describedby": describedBy,
    "aria-required": field.required,
  };

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          {...common}
          rows={field.wide ? 4 : 3}
          value={String(value ?? "")}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} resize-y`}
        />
      );
    case "number":
      return (
        <input
          {...common}
          type="number"
          step="any"
          value={String(value ?? "")}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} font-stats`}
        />
      );
    case "date":
      return (
        <input
          {...common}
          type="date"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} font-stats`}
        />
      );
    case "select":
      return (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={field.name}>
          {(field.options ?? []).map((opt) => {
            const on = value === opt;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(opt)}
                className={`glass-control flex-1 rounded-lg px-3 py-2 text-xs transition-all duration-200 ${
                  on
                    ? "border-gold/60 bg-gold/10 text-gold shadow-[0_0_18px_-10px_var(--gold)]"
                    : "text-muted-foreground hover:border-white/[0.22] hover:bg-white/[0.07]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    case "checkbox":
      return (
        <label className="glass-control flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm">
          <input
            {...common}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-[var(--gold)]"
          />
          <span className="text-muted-foreground">{field.placeholder || field.name}</span>
        </label>
      );
    case "rating":
      return <Rating id={field.id} value={Number(value ?? 0)} onChange={onChange} />;
    case "image":
      return <ImageDrop field={field} value={String(value ?? "")} onChange={onChange} />;
    default:
      return (
        <input
          {...common}
          type="text"
          value={String(value ?? "")}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      );
  }
}

function Rating({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            aria-label={`Review ${n} of 10`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={`font-stats h-8 w-8 rounded-lg border text-xs transition-all duration-200 ${
              value === n
                ? "border-gold/60 bg-gold/15 text-gold shadow-[0_0_18px_-10px_var(--gold)]"
                : "border-white/[0.12] text-muted-foreground hover:border-white/[0.24] hover:bg-white/[0.06]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--gold)]"
        aria-label="Review score"
      />
      <p className="font-stats mt-1 text-xs text-gold">Review: {value}/10</p>
    </div>
  );
}

function ImageDrop({
  field,
  value,
  onChange,
}: {
  field: JournalField;
  value: string;
  onChange: (v: string) => void;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const read = (file?: File) => {
    if (!file || !/^image\/(png|jpeg|jpg|webp)$/.test(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-white/[0.12]">
        <img src={value} alt="Trade screenshot preview" className="max-h-64 w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Remove screenshot"
          className="glass-icon-button absolute end-2 top-2 hover:border-destructive/50 hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        read(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={field.question}
      className={`glass-control flex cursor-pointer flex-col items-center gap-2 rounded-xl border-dashed px-4 py-8 text-center text-xs transition-all duration-200 ${
        over
          ? "border-gold/60 bg-gold/[0.08] text-gold"
          : "text-muted-foreground hover:border-gold/50 hover:bg-gold/[0.05]"
      }`}
    >
      <ImagePlus className="h-6 w-6" />
      <span className="text-sm text-foreground">Drag & drop your chart here</span>
      <span>or click to browse — PNG, JPG, WEBP</span>
      <input
        ref={inputRef}
        id={field.id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => read(e.target.files?.[0])}
      />
    </div>
  );
}
