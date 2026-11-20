import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useLanguage } from "../i18n";
import { languages } from "../language";
import type { Preference } from "../language";

export type PageId = "home" | "play" | "net" | "edit";

export const links = {
  github: "https://github.com/OurTaiko",
  bilibili: "https://space.bilibili.com/485954888",
  qq: "https://qm.qq.com/q/UbdxqcTrCm",
  net: "https://net.ourtaiko.org/",
};

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="sr-only">{t("newTab")}</span>
    </a>
  );
}

/** The chevron Apple puts after a text link ("Learn more ›"). */
export function Chevron() {
  return (
    <span className="chevron" aria-hidden="true">
      ›
    </span>
  );
}

const productNav: { id: Exclude<PageId, "home">; name: string }[] = [
  { id: "play", name: "Play" },
  { id: "net", name: "Net" },
  { id: "edit", name: "Edit" },
];

function GlobalNav({ page, sticky }: { page: PageId; sticky: boolean }) {
  const { t } = useLanguage();
  return (
    <nav
      className={sticky ? "global-nav sticky" : "global-nav"}
      aria-label={t("nav.label")}
    >
      <div className="wrap">
        <a className="brand" href="/" aria-label={t("nav.home")}>
          <img src="/icons/icon-32.png" width="22" height="22" alt="" />
          <span>OurTaiko</span>
        </a>
        <div className="links">
          {productNav.map((p) => (
            <a
              key={p.id}
              href={`/${p.id}`}
              aria-current={page === p.id ? "page" : undefined}
            >
              {p.name}
            </a>
          ))}
          <ExternalLink className="hide-narrow" href={links.github}>
            GitHub
          </ExternalLink>
        </div>
      </div>
    </nav>
  );
}

/** Product pages' second bar, which stays at the top while the page scrolls. */
export function LocalNav({
  title,
  sections,
  action,
}: {
  title: string;
  sections: { href: string; label: string }[];
  action: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <nav className="local-nav" aria-label={t("nav.local")}>
      <div className="wrap">
        <a className="local-title" href="#top">
          {title}
        </a>
        <div className="links">
          {sections.map((s) => (
            <a className="hide-narrow" key={s.href} href={s.href}>
              {s.label}
            </a>
          ))}
          {action}
        </div>
      </div>
    </nav>
  );
}

const languageNames: Record<Preference, string> = {
  "zh-Hans": "中文",
  en: "EN",
  ja: "日本語",
  ko: "한국어",
  auto: "",
};
const languageTitles: Record<Preference, string> = {
  "zh-Hans": "简体中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  auto: "",
};
const choices: Preference[] = [...languages, "auto"];
const fanRadius = 136;

/** RhythmHub's floating language ball: the choices fan out in a quarter circle. */
function LanguageBall() {
  const { t, preference, selectLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const ball = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const current = Math.max(choices.indexOf(preference), 0);
    items.current[current]?.focus({ preventScroll: true });
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, preference]);

  const close = () => {
    setOpen(false);
    ball.current?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    const index = items.current.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const last = choices.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? index >= last
          ? 0
          : index + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? index <= 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    items.current[next]?.focus();
  };

  return (
    <div
      ref={root}
      className={open ? "lang-fab open" : "lang-fab"}
      onKeyDown={open ? onKeyDown : undefined}
    >
      <div
        className="lang-options"
        id="lang-options"
        role="menu"
        aria-label={t("language.label")}
      >
        {choices.map((choice, i) => {
          // Spread the choices from straight left (180°) to straight up (90°),
          // far enough out that neighbouring 48px circles do not touch.
          const angle = Math.PI - (i * (Math.PI / 2)) / (choices.length - 1);
          const style = {
            "--x": `${Math.round(Math.cos(angle) * fanRadius)}px`,
            "--y": `${Math.round(-Math.sin(angle) * fanRadius)}px`,
            "--i": i,
          } as CSSProperties;
          const auto = choice === "auto";
          return (
            <button
              type="button"
              key={choice}
              ref={(node) => {
                items.current[i] = node;
              }}
              role="menuitemradio"
              aria-checked={preference === choice}
              tabIndex={open ? 0 : -1}
              lang={auto ? undefined : choice}
              title={auto ? t("language.auto") : languageTitles[choice]}
              style={style}
              onClick={() => {
                selectLanguage(choice);
                close();
              }}
            >
              {auto ? t("language.autoShort") : languageNames[choice]}
            </button>
          );
        })}
      </div>
      <button
        ref={ball}
        type="button"
        className="lang-ball"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="lang-options"
        aria-label={t("language.label")}
        onClick={() => setOpen(!open)}
      >
        {/* Fluent UI System Icons "translate_24_regular", © Microsoft, MIT License. */}
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3.39 6a6.07 6.07 0 0 1 4.57-.47 3.25 3.25 0 0 1 2.24 1.94c.3.75.3 1.54.3 1.99v5.79a.75.75 0 0 1-1.5 0v-.3l-.4.22a5.95 5.95 0 0 1-3.75.76 3.52 3.52 0 0 1-2.8-2.95 3.39 3.39 0 0 1 1.9-3.7 6.83 6.83 0 0 1 4.12-.42c.34.06.65.13.92.2a3.11 3.11 0 0 0-.18-1.03c-.17-.42-.5-.83-1.27-1.06-1.7-.5-3.03.12-3.43.34A.75.75 0 0 1 3.39 6Zm4.42 4.33a5.34 5.34 0 0 0-3.21.3c-.9.43-1.21 1.28-1.07 2.1.14.86.74 1.57 1.58 1.73.94.17 1.95-.17 2.79-.61a8.3 8.3 0 0 0 1.1-.7v-2.51c-.3-.1-.7-.22-1.2-.3Zm8.68-3.3c.39.14.6.56.47.96-.09.27-.18.6-.27.94.95-.1 1.87-.23 2.64-.41a.75.75 0 1 1 .34 1.46c-.97.23-2.15.4-3.34.48-.1.55-.19 1.05-.25 1.5a5.94 5.94 0 0 1 1.67-.24.75.75 0 0 1 1.5.03v.22a4.04 4.04 0 0 1 2.35 5.55 5.01 5.01 0 0 1-2.83 2.43.75.75 0 0 1-.54-1.4 3.52 3.52 0 0 0 2.02-1.68c.3-.64.32-1.34.1-1.95a2.55 2.55 0 0 0-1.28-1.4 7.63 7.63 0 0 1-2.29 4.04l.17.43a.75.75 0 1 1-1.42.48c-.42.22-.84.38-1.24.47-.72.15-1.56.1-2.13-.49-.87-.88-.82-2.27-.2-3.44a5.94 5.94 0 0 1 2.53-2.41c.06-.62.16-1.3.3-2.06-.65 0-1.28 0-1.84-.04a.75.75 0 0 1 .1-1.5c.62.04 1.33.05 2.07.03.11-.48.27-1.07.42-1.52.13-.39.55-.6.95-.47Zm-2.06 7.38a4 4 0 0 0-1.15 1.3c-.44.84-.29 1.45-.05 1.7.06.05.26.17.74.06.35-.07.67-.2.98-.37a7.84 7.84 0 0 1-.52-2.69Zm1.75 1.66a6.65 6.65 0 0 0 1.42-2.85 4.72 4.72 0 0 0-1.67.37 8.62 8.62 0 0 0 .25 2.48Z" />
        </svg>
      </button>
    </div>
  );
}

function Footer({ children }: { children?: ReactNode }) {
  const { t, preference, selectLanguage } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="wrap">
        {children ? <div className="footer-extra">{children}</div> : null}
        <div className="footer-columns">
          <div>
            <h2>{t("footer.products")}</h2>
            <a href="/play">OurTaikoPlay</a>
            <a href="/net">OurTaikoNet</a>
            <a href="/edit">OurTaikoEdit</a>
          </div>
          <div>
            <h2>{t("footer.community")}</h2>
            <ExternalLink href={links.github}>GitHub</ExternalLink>
            <ExternalLink href={links.bilibili}>
              {t("footer.bilibili")}
            </ExternalLink>
            <ExternalLink href={links.qq}>{t("footer.qq")}</ExternalLink>
          </div>
        </div>
        <p className="footer-notice">{t("footer.notice")}</p>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} OurTaiko</span>
          <span className="langs" role="group" aria-label={t("language.label")}>
            {choices.map((choice) => (
              <button
                type="button"
                key={choice}
                lang={choice === "auto" ? undefined : choice}
                aria-pressed={preference === choice}
                onClick={() => selectLanguage(choice)}
              >
                {choice === "auto"
                  ? t("language.auto")
                  : languageTitles[choice]}
              </button>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

/** The frame every page shares: skip link, navigation, language ball and footer. */
export function Shell({
  page,
  localNav,
  footer,
  children,
}: {
  page: PageId;
  localNav?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <>
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      <GlobalNav page={page} sticky={!localNav} />
      {localNav}
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer>{footer}</Footer>
      <LanguageBall />
    </>
  );
}
