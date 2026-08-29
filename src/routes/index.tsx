import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ListChecks, NotebookPen, Flame } from "lucide-react";
import lion from "@/assets/lion.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LEGEND — Trading Discipline for Elite Forex Traders" },
      {
        name: "description",
        content:
          "A private discipline platform for serious forex traders: daily routine checklists, SMC trade journaling, streaks and consistency analytics.",
      },
      { property: "og:title", content: "LEGEND — Trading Discipline for Elite Forex Traders" },
      {
        property: "og:description",
        content:
          "Daily routine checklists, SMC trade journaling and consistency analytics for disciplined traders.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="hero-vignette grain relative min-h-screen overflow-hidden">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <span className="font-hero text-sm font-bold tracking-[0.4em]">LEGEND</span>
        <Link
          to="/dashboard"
          className="glass-button px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground"
        >
          Enter
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-3xl flex-col items-center justify-center px-5 pb-20 text-center">
        <img
          src={lion}
          alt="LEGEND lion crest"
          width={1024}
          height={1024}
          className="h-44 w-44 object-contain drop-shadow-[0_0_60px_rgba(201,168,92,0.18)] sm:h-56 sm:w-56"
        />
        <p className="mt-6 text-[11px] uppercase tracking-[0.42em] text-gold/80">
          Private members' desk
        </p>
        <h1 className="font-hero mt-5 text-4xl font-bold leading-[1.1] sm:text-6xl">
          Discipline is the <span className="text-gradient-gold">edge</span>. Everything else is
          noise.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Funded traders are not smarter. They repeat the same process on every session, log every
          decision, and refuse to break their own rules. LEGEND holds you to that standard, daily.
        </p>
        <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/dashboard"
            className="glass-button glass-button-gold glow-gold inline-flex w-full px-7 py-3.5 text-sm font-semibold sm:w-auto"
          >
            Start today's routine
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-16 grid w-full gap-3 sm:grid-cols-3">
          {[
            {
              icon: ListChecks,
              title: "Daily routine",
              body: "A non-negotiable checklist before, during and after the session.",
            },
            {
              icon: NotebookPen,
              title: "SMC journal",
              body: "Liquidity, order blocks, FVG — logged with screenshots and emotion.",
            },
            {
              icon: Flame,
              title: "Streaks",
              body: "Consecutive disciplined days, tracked without mercy.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="surface p-5 text-left transition-transform duration-300 hover:-translate-y-1"
            >
              <Icon className="h-5 w-5 text-gold" />
              <h2 className="mt-3 font-display text-base">{title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
