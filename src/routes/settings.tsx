import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DEFAULT_TASKS, useCompletions, useJournal, useProfile, useTasks } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LEGEND" },
      {
        name: "description",
        content: "Set your discipline standard, reset your routine and manage stored trading data.",
      },
      { property: "og:title", content: "Settings — LEGEND" },
      {
        property: "og:description",
        content: "Set your discipline standard and manage your stored trading data.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useProfile();
  const [, setTasks] = useTasks();
  const [, setCompletions] = useCompletions();
  const [, setJournal] = useJournal();

  return (
    <AppShell title="Settings" subtitle="Define the standard you refuse to fall below.">
      <div className="grid gap-4 lg:max-w-2xl">
        <section className="surface p-5 transition-transform duration-300 hover:-translate-y-0.5">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Profile
          </h2>
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted-foreground">Display name</span>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="glass-control w-full px-3 py-2.5 text-sm outline-none"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs text-muted-foreground">
              Monthly compliance target: {profile.target}%
            </span>
            <input
              type="range"
              min={50}
              max={100}
              value={profile.target}
              onChange={(e) => setProfile({ ...profile, target: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/[0.1] accent-[var(--gold)]"
            />
          </label>
        </section>

        <section className="surface p-5 transition-transform duration-300 hover:-translate-y-0.5">
          <h2 className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Data
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Your routine, journal and streaks are stored privately on this device.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTasks(DEFAULT_TASKS)}
              className="glass-button rounded-lg px-4 py-2 text-xs hover:border-gold/50 hover:text-gold"
            >
              Restore default routine
            </button>
            <button
              onClick={() => setCompletions({})}
              className="glass-button rounded-lg px-4 py-2 text-xs hover:border-gold/50 hover:text-gold"
            >
              Clear streak history
            </button>
            <button
              onClick={() => setJournal([])}
              className="glass-button rounded-lg border-destructive/40 px-4 py-2 text-xs text-destructive hover:bg-destructive/10"
            >
              Delete all journal entries
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
