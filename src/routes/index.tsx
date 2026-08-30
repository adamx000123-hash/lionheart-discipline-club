import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ListChecks, NotebookPen, Flame } from "lucide-react";
import lion from "@/assets/lion.png";
import { LanguageToggle, useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const features = [
    { icon: ListChecks, title: t("landing.f1.title"), body: t("landing.f1.body") },
    { icon: NotebookPen, title: t("landing.f2.title"), body: t("landing.f2.body") },
    { icon: Flame, title: t("landing.f3.title"), body: t("landing.f3.body") },
  ];

  return (
    <div className="hero-vignette grain relative min-h-screen overflow-hidden">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <span className="font-hero text-sm font-bold tracking-[0.4em]">LEGEND</span>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            to="/dashboard"
            className="glass-button px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground"
          >
            {t("landing.enter")}
          </Link>
        </div>
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
          {t("landing.kicker")}
        </p>
        <h1 className="font-hero mt-5 text-4xl font-bold leading-[1.1] sm:text-6xl">
          {t("landing.headline.a")}
          <span className="text-gradient-gold">{t("landing.headline.edge")}</span>
          {t("landing.headline.b")}
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("landing.body")}
        </p>
        <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/dashboard"
            className="glass-button glass-button-gold glow-gold inline-flex w-full px-7 py-3.5 text-sm font-semibold sm:w-auto"
          >
            {t("landing.cta")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-16 grid w-full gap-3 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="surface p-5 text-start transition-transform duration-300 hover:-translate-y-1"
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
