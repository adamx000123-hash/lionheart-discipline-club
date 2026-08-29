import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { AppShell, ProgressRing } from "@/components/AppShell";
import { useTasks, useCompletions, todayKey, computeStreak, type Task } from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Daily Tasks — LEGEND" },
      {
        name: "description",
        content:
          "Run your non-negotiable trading routine: pre-market prep, risk rules and post-trade review.",
      },
      { property: "og:title", content: "Daily Tasks — LEGEND" },
      {
        property: "og:description",
        content: "Your non-negotiable daily trading routine, tracked with streaks and progress.",
      },
    ],
  }),
  component: TasksPage,
});

const GROUPS: Task["group"][] = ["Pre-market", "Execution", "Review"];

function TasksPage() {
  const [tasks, setTasks] = useTasks();
  const [completions, setCompletions] = useCompletions();
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState<Task["group"]>("Pre-market");
  const today = todayKey();
  const done = completions[today] ?? [];
  const ratio = tasks.length ? done.length / tasks.length : 0;
  const streak = computeStreak(completions, tasks.length);

  const toggle = (id: string) =>
    setCompletions((prev) => {
      const current = prev[today] ?? [];
      return {
        ...prev,
        [today]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      };
    });

  const addTask = () => {
    if (!title.trim()) return;
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title: title.trim(), group }]);
    setTitle("");
  };

  return (
    <AppShell title="Daily Tasks" subtitle="Execute the process. The results follow.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface flex items-center gap-5 p-5 transition-transform duration-300 hover:-translate-y-0.5 lg:col-span-2">
          <div className="relative shrink-0">
            <ProgressRing value={ratio} size={112} />
            <span className="font-stats absolute inset-0 flex items-center justify-center text-xl font-semibold text-gold">
              {Math.round(ratio * 100)}%
            </span>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Today's discipline
            </p>
            <p className="font-stats mt-1 text-xl font-semibold">
              {done.length} of {tasks.length} completed
            </p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {ratio === 1
                ? "Full compliance. This is what separates you from the crowd."
                : "Close the gap before the session ends. Partial discipline is no discipline."}
            </p>
          </div>
        </div>
        <div className="surface flex items-center gap-4 p-5 transition-transform duration-300 hover:-translate-y-0.5">
          <Flame className="h-9 w-9 text-gold" />
          <div>
            <p className="font-stats text-3xl font-semibold text-gold">{streak}</p>
            <p className="text-xs text-muted-foreground">consecutive disciplined days</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {GROUPS.map((g) => {
          const list = tasks.filter((t) => t.group === g);
          if (!list.length) return null;
          return (
            <section key={g}>
              <h2 className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {g}
              </h2>
              <div className="space-y-2.5">
                {list.map((task) => {
                  const checked = done.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`surface group flex items-start gap-3.5 p-4 transition-colors ${checked ? "border-gold/30" : ""}`}
                    >
                      <button
                        onClick={() => toggle(task.id)}
                        aria-label={`Toggle ${task.title}`}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.18] bg-white/[0.04] backdrop-blur-sm transition-all duration-200 active:scale-90 ${
                          checked
                            ? "border-gold/70 bg-gold/15 shadow-[0_0_18px_-6px_var(--gold)]"
                            : "hover:border-gold/50 hover:bg-gold/10"
                        }`}
                      >
                        {checked && (
                          <Check className="animate-check h-4 w-4 text-gold" strokeWidth={3} />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${checked ? "text-muted-foreground line-through" : ""}`}
                        >
                          {task.title}
                        </p>
                        {task.detail && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{task.detail}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                        aria-label="Delete task"
                        className="glass-icon-button h-8 w-8 opacity-0 transition-opacity hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="surface mt-6 p-4 transition-transform duration-300 hover:-translate-y-0.5">
        <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Add a rule
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="e.g. No trading during high-impact news"
            className="glass-control flex-1 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as Task["group"])}
            className="glass-control px-3 py-2.5 text-sm outline-none"
          >
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            onClick={addTask}
            className="glass-button glass-button-gold inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </AppShell>
  );
}
