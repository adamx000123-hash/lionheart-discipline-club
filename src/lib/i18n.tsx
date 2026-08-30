import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ar";

const STORAGE_KEY = "legend.lang";

const en = {
  "brand.tagline": "Discipline is the only edge that compounds.",

  "nav.dashboard": "Dashboard",
  "nav.tasks": "Daily Tasks",
  "nav.journal": "Journal",
  "nav.progress": "Progress",
  "nav.settings": "Settings",
  "nav.short.dashboard": "Dashboard",
  "nav.short.tasks": "Tasks",
  "nav.short.journal": "Journal",
  "nav.short.progress": "Progress",
  "nav.short.settings": "Settings",

  "lang.switch": "Switch language",
  "lang.en": "EN",
  "lang.ar": "AR",

  "landing.enter": "Enter",
  "landing.kicker": "Private members' desk",
  "landing.headline.a": "Discipline is the ",
  "landing.headline.edge": "edge",
  "landing.headline.b": ". Everything else is noise.",
  "landing.body":
    "Funded traders are not smarter. They repeat the same process on every session, log every decision, and refuse to break their own rules. LEGEND holds you to that standard, daily.",
  "landing.cta": "Start today's routine",
  "landing.f1.title": "Daily routine",
  "landing.f1.body": "A non-negotiable checklist before, during and after the session.",
  "landing.f2.title": "SMC journal",
  "landing.f2.body": "Liquidity, order blocks, FVG — logged with screenshots and emotion.",
  "landing.f3.title": "Streaks",
  "landing.f3.body": "Consecutive disciplined days, tracked without mercy.",

  "dash.title": "Overview",
  "dash.subtitle": "Consistency is the scoreboard. Profit is the byproduct.",
  "dash.todayRoutine": "Today's routine",
  "dash.done": "{done}/{total} done",
  "dash.openChecklist": "Open checklist",
  "dash.streak": "day discipline streak",
  "dash.weekAvg": "7-day avg",
  "dash.winRate": "Win rate",
  "dash.consistency": "Consistency — last 17 weeks",

  "tasks.title": "Daily Tasks",
  "tasks.subtitle": "Execute the process. The results follow.",
  "tasks.todayDiscipline": "Today's discipline",
  "tasks.completed": "{done} of {total} completed",
  "tasks.full": "Full compliance. This is what separates you from the crowd.",
  "tasks.partial": "Close the gap before the session ends. Partial discipline is no discipline.",
  "tasks.streakLabel": "consecutive disciplined days",
  "tasks.addRule": "Add a rule",
  "tasks.placeholder": "e.g. No trading during high-impact news",
  "tasks.add": "Add",
  "tasks.delete": "Delete task",
  "tasks.toggle": "Toggle task",
  "group.Pre-market": "Pre-market",
  "group.Execution": "Execution",
  "group.Review": "Review",

  "journal.title": "Journal",
  "journal.subtitle": "Unlogged trades did not happen. Write them down.",
  "journal.winRate": "Win rate",
  "journal.totalTrades": "Total trades",
  "journal.avgRR": "Avg R:R",
  "journal.streak": "Streak",
  "journal.disciplinedDays": "disciplined days",
  "filter.all": "All",
  "filter.win": "Win",
  "filter.loss": "Loss",
  "filter.breakeven": "Breakeven",
  "journal.new": "New entry",
  "journal.empty.title": "No trades logged yet",
  "journal.empty.body":
    "Your first entry sets the standard. Log the pair, the SMC reasoning, the result, and how you felt executing it.",
  "journal.empty.cta": "Log first trade",
  "journal.deleteEntry": "Delete entry",
  "journal.entryExit": "Entry {entry} · Exit {exit}",
  "journal.modalTitle": "New trade entry",
  "journal.close": "Close",
  "field.date": "Date",
  "field.pair": "Pair",
  "field.setup": "Setup / strategy",
  "field.setupPlaceholder": "London sweep into 15m OB",
  "field.concepts": "SMC concepts",
  "field.entry": "Entry",
  "field.exit": "Exit",
  "field.rr": "R:R",
  "field.result": "Result",
  "field.screenshot": "Chart screenshot",
  "field.screenshotAttached": "Screenshot attached — replace",
  "field.screenshotUpload": "Upload chart screenshot",
  "field.notes": "Emotion & discipline notes",
  "field.notesPlaceholder": "Did you follow the plan? What did you feel before the entry?",
  "journal.save": "Save entry",

  "smc.Liquidity sweep": "Liquidity sweep",
  "smc.Order block": "Order block",
  "smc.Fair value gap": "Fair value gap",
  "smc.Break of structure": "Break of structure",
  "smc.Change of character": "Change of character",
  "smc.Premium / discount": "Premium / discount",
  "smc.Session open": "Session open",

  "progress.title": "Progress",
  "progress.subtitle": "Numbers do not negotiate.",
  "progress.compliance30": "30-day compliance",
  "progress.perfectDays": "Perfect days",
  "progress.last30": "last 30 days",
  "progress.currentStreak": "Current streak",
  "progress.last14": "Last 14 days",
  "progress.heatmap": "Discipline heatmap",
  "progress.record": "Trade record",
  "progress.wins": "Wins",
  "progress.losses": "Losses",
  "progress.totalLogged": "Total logged",

  "heatmap.low": "Undisciplined",
  "heatmap.high": "Full compliance",

  "cal.title": "Trading calendar",
  "cal.prev": "Previous month",
  "cal.next": "Next month",
  "cal.tradesCount": "{n} trades",
  "cal.winRateSuffix": "% win rate",
  "cal.net": "net",
  "cal.net.win": "profitable",
  "cal.net.loss": "losing",
  "cal.net.flat": "breakeven",
  "cal.noTrades": "No trades logged",
  "cal.logTrade": "Log a trade",

  "settings.title": "Settings",
  "settings.subtitle": "Define the standard you refuse to fall below.",
  "settings.profile": "Profile",
  "settings.displayName": "Display name",
  "settings.target": "Monthly compliance target: {n}%",
  "settings.language": "Language",
  "settings.languageHint":
    "Choose the interface language. Arabic switches the layout to right-to-left.",
  "settings.data": "Data",
  "settings.dataHint": "Your routine, journal and streaks are stored privately on this device.",
  "settings.restore": "Restore default routine",
  "settings.clearStreaks": "Clear streak history",
  "settings.deleteJournal": "Delete all journal entries",

  "task.t1.title": "Review higher timeframe bias",
  "task.t1.detail": "Daily and 4H structure before anything else.",
  "task.t2.title": "Mark key liquidity and order blocks",
  "task.t2.detail": "Levels defined before the session opens.",
  "task.t3.title": "Confirm max risk per trade",
  "task.t3.detail": "No position exceeds 1% of account equity.",
  "task.t4.title": "Only A+ setups taken",
  "task.t4.detail": "No entry without confirmation from the plan.",
  "task.t5.title": "No revenge trades after a loss",
  "task.t5.detail": "Step away for 15 minutes minimum.",
  "task.t6.title": "Journal every trade taken",
  "task.t6.detail": "Screenshot, reasoning, emotion.",
  "task.t7.title": "Grade the day honestly",
  "task.t7.detail": "Process over profit and loss.",
};

type Key = keyof typeof en;

const ar: Record<Key, string> = {
  "brand.tagline": "الانضباط هو الميزة الوحيدة التي تتراكم.",

  "nav.dashboard": "لوحة التحكم",
  "nav.tasks": "المهام اليومية",
  "nav.journal": "المفكرة",
  "nav.progress": "التقدم",
  "nav.settings": "الإعدادات",
  "nav.short.dashboard": "اللوحة",
  "nav.short.tasks": "المهام",
  "nav.short.journal": "المفكرة",
  "nav.short.progress": "التقدم",
  "nav.short.settings": "الإعدادات",

  "lang.switch": "تغيير اللغة",
  "lang.en": "EN",
  "lang.ar": "AR",

  "landing.enter": "دخول",
  "landing.kicker": "مكتب الأعضاء الخاص",
  "landing.headline.a": "الانضباط هو ",
  "landing.headline.edge": "الميزة",
  "landing.headline.b": ". وكل ما عداه ضجيج.",
  "landing.body":
    "المتداولون الممولون ليسوا أذكى منك. هم فقط يكررون نفس العملية في كل جلسة، ويوثّقون كل قرار، ويرفضون كسر قواعدهم. منصة LEGEND تُلزمك بهذا المعيار كل يوم.",
  "landing.cta": "ابدأ روتين اليوم",
  "landing.f1.title": "روتين يومي",
  "landing.f1.body": "قائمة مهام غير قابلة للتفاوض قبل الجلسة وأثناءها وبعدها.",
  "landing.f2.title": "مفكرة SMC",
  "landing.f2.body": "السيولة، كتل الأوامر، فجوات القيمة العادلة — موثقة بالصور والمشاعر.",
  "landing.f3.title": "سلاسل الالتزام",
  "landing.f3.body": "أيام منضبطة متتالية، تُحتسب بلا تهاون.",

  "dash.title": "نظرة عامة",
  "dash.subtitle": "الاستمرارية هي لوحة النتائج. الربح مجرد نتيجة جانبية.",
  "dash.todayRoutine": "روتين اليوم",
  "dash.done": "{done}/{total} منجزة",
  "dash.openChecklist": "افتح القائمة",
  "dash.streak": "يوم من الانضباط المتواصل",
  "dash.weekAvg": "متوسط 7 أيام",
  "dash.winRate": "نسبة الربح",
  "dash.consistency": "الاستمرارية — آخر 17 أسبوعًا",

  "tasks.title": "المهام اليومية",
  "tasks.subtitle": "نفّذ العملية، والنتائج تتبع.",
  "tasks.todayDiscipline": "انضباط اليوم",
  "tasks.completed": "{done} من {total} مكتملة",
  "tasks.full": "التزام كامل. هذا ما يفصلك عن الآخرين.",
  "tasks.partial": "أغلق الفجوة قبل نهاية الجلسة. الانضباط الجزئي ليس انضباطًا.",
  "tasks.streakLabel": "أيام انضباط متتالية",
  "tasks.addRule": "أضف قاعدة",
  "tasks.placeholder": "مثال: لا تداول أثناء الأخبار عالية التأثير",
  "tasks.add": "إضافة",
  "tasks.delete": "حذف المهمة",
  "tasks.toggle": "تبديل المهمة",
  "group.Pre-market": "ما قبل السوق",
  "group.Execution": "التنفيذ",
  "group.Review": "المراجعة",

  "journal.title": "المفكرة",
  "journal.subtitle": "الصفقة غير الموثقة لم تحدث. دوّنها.",
  "journal.winRate": "نسبة الربح",
  "journal.totalTrades": "إجمالي الصفقات",
  "journal.avgRR": "متوسط العائد/المخاطرة",
  "journal.streak": "السلسلة",
  "journal.disciplinedDays": "أيام منضبطة",
  "filter.all": "الكل",
  "filter.win": "ربح",
  "filter.loss": "خسارة",
  "filter.breakeven": "تعادل",
  "journal.new": "إدخال جديد",
  "journal.empty.title": "لا توجد صفقات موثقة بعد",
  "journal.empty.body":
    "أول إدخال يضع المعيار. سجّل الزوج، ومنطق SMC، والنتيجة، وشعورك أثناء التنفيذ.",
  "journal.empty.cta": "وثّق أول صفقة",
  "journal.deleteEntry": "حذف الإدخال",
  "journal.entryExit": "الدخول {entry} · الخروج {exit}",
  "journal.modalTitle": "إدخال صفقة جديدة",
  "journal.close": "إغلاق",
  "field.date": "التاريخ",
  "field.pair": "الزوج",
  "field.setup": "النموذج / الاستراتيجية",
  "field.setupPlaceholder": "كنس سيولة لندن نحو كتلة أوامر 15 دقيقة",
  "field.concepts": "مفاهيم SMC",
  "field.entry": "الدخول",
  "field.exit": "الخروج",
  "field.rr": "العائد/المخاطرة",
  "field.result": "النتيجة",
  "field.screenshot": "صورة الشارت",
  "field.screenshotAttached": "تم إرفاق الصورة — استبدال",
  "field.screenshotUpload": "ارفع صورة الشارت",
  "field.notes": "ملاحظات المشاعر والانضباط",
  "field.notesPlaceholder": "هل التزمت بالخطة؟ بماذا شعرت قبل الدخول؟",
  "journal.save": "حفظ الإدخال",

  "smc.Liquidity sweep": "كنس السيولة",
  "smc.Order block": "كتلة أوامر",
  "smc.Fair value gap": "فجوة القيمة العادلة",
  "smc.Break of structure": "كسر الهيكل",
  "smc.Change of character": "تغير الطابع",
  "smc.Premium / discount": "منطقة مرتفعة / مخفضة",
  "smc.Session open": "افتتاح الجلسة",

  "progress.title": "التقدم",
  "progress.subtitle": "الأرقام لا تجامل.",
  "progress.compliance30": "التزام 30 يومًا",
  "progress.perfectDays": "الأيام المثالية",
  "progress.last30": "آخر 30 يومًا",
  "progress.currentStreak": "السلسلة الحالية",
  "progress.last14": "آخر 14 يومًا",
  "progress.heatmap": "خريطة الانضباط",
  "progress.record": "سجل الصفقات",
  "progress.wins": "أرباح",
  "progress.losses": "خسائر",
  "progress.totalLogged": "إجمالي الموثق",

  "heatmap.low": "بلا انضباط",
  "heatmap.high": "التزام كامل",

  "cal.title": "تقويم التداول",
  "cal.prev": "الشهر السابق",
  "cal.next": "الشهر التالي",
  "cal.tradesCount": "{n} صفقات",
  "cal.winRateSuffix": "% نسبة ربح",
  "cal.net": "الصافي",
  "cal.net.win": "رابح",
  "cal.net.loss": "خاسر",
  "cal.net.flat": "متعادل",
  "cal.noTrades": "لا توجد صفقات موثقة",
  "cal.logTrade": "وثّق صفقة",

  "settings.title": "الإعدادات",
  "settings.subtitle": "حدد المعيار الذي ترفض النزول عنه.",
  "settings.profile": "الملف الشخصي",
  "settings.displayName": "الاسم الظاهر",
  "settings.target": "هدف الالتزام الشهري: {n}%",
  "settings.language": "اللغة",
  "settings.languageHint":
    "اختر لغة الواجهة. العربية تحوّل التصميم إلى اتجاه من اليمين إلى اليسار.",
  "settings.data": "البيانات",
  "settings.dataHint": "روتينك ومفكرتك وسلاسلك محفوظة بشكل خاص على هذا الجهاز.",
  "settings.restore": "استعادة الروتين الافتراضي",
  "settings.clearStreaks": "مسح سجل السلاسل",
  "settings.deleteJournal": "حذف كل إدخالات المفكرة",

  "task.t1.title": "مراجعة اتجاه الأطر الزمنية الكبرى",
  "task.t1.detail": "هيكل اليومي و4 ساعات قبل أي شيء آخر.",
  "task.t2.title": "تحديد السيولة وكتل الأوامر الرئيسية",
  "task.t2.detail": "المستويات تُحدد قبل افتتاح الجلسة.",
  "task.t3.title": "تأكيد الحد الأقصى للمخاطرة لكل صفقة",
  "task.t3.detail": "لا تتجاوز أي صفقة 1% من رأس المال.",
  "task.t4.title": "الدخول في نماذج A+ فقط",
  "task.t4.detail": "لا دخول بدون تأكيد من الخطة.",
  "task.t5.title": "لا صفقات انتقامية بعد الخسارة",
  "task.t5.detail": "ابتعد 15 دقيقة على الأقل.",
  "task.t6.title": "توثيق كل صفقة",
  "task.t6.detail": "صورة، سبب، شعور.",
  "task.t7.title": "قيّم يومك بصدق",
  "task.t7.detail": "العملية أهم من الربح والخسارة.",
};

const DICTS: Record<Lang, Record<string, string>> = { en, ar };

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: Key | string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "ar" || stored === "en") setLangState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang];
    return {
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      toggle: () => setLang(lang === "ar" ? "en" : "ar"),
      t: (key, vars) => {
        let out = dict[key as string] ?? DICTS.en[key as string] ?? (key as string);
        if (vars) {
          for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
        }
        return out;
      },
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      className={`glass-chip inline-flex items-center gap-0.5 rounded-full p-0.5 ${className}`}
      role="group"
      aria-label={t("lang.switch")}
    >
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.12em] transition-all duration-200 ${
            lang === l
              ? "bg-gold/15 text-gold shadow-[0_0_18px_-10px_var(--gold)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "en" ? "EN" : "ع"}
        </button>
      ))}
    </div>
  );
}
