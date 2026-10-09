import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useLanguage } from "../i18n";
import type { Preference } from "../language";

export function Header() {
  const { t, preference, selectLanguage } = useLanguage();
  const [navOpen, setNavOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const languageArea = useRef<HTMLDivElement>(null);
  const languageButton = useRef<HTMLButtonElement>(null);
  const navButton = useRef<HTMLButtonElement>(null);
  const languageItems = useRef<(HTMLButtonElement | null)[]>([]);
  const options: { value: Preference; label: string }[] = [
    { value: "auto", label: t("language.auto") },
    { value: "zh-Hans", label: "简体中文" },
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
  ];
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) {
        setNavOpen(false);
        setLanguageOpen(false);
      } else if (!languageArea.current?.contains(event.target as Node))
        setLanguageOpen(false);
    };
    const resize = () => {
      if (window.innerWidth >= 850) setNavOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", resize);
    };
  }, []);
  useEffect(() => {
    if (languageOpen)
      languageItems.current
        .find((item) => item?.getAttribute("aria-checked") === "true")
        ?.focus();
  }, [languageOpen]);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      if (languageOpen) {
        setLanguageOpen(false);
        languageButton.current?.focus();
      } else if (navOpen) {
        setNavOpen(false);
        navButton.current?.focus();
      }
    }
  };
  const onMenuKey = (event: KeyboardEvent) => {
    const current = languageItems.current.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let next: number | undefined;
    if (event.key === "ArrowDown") next = (current + 1) % options.length;
    if (event.key === "ArrowUp")
      next = (current - 1 + options.length) % options.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      languageItems.current[next]?.focus();
    }
  };
  return (
    <header className="site-header" ref={header} onKeyDown={onKeyDown}>
      <div className="nav-wrap">
        <a
          className="brand"
          href="#home"
          aria-label={t("home")}
          onClick={() => setNavOpen(false)}
        >
          <img src="/icons/icon-192.png" width="40" height="40" alt="" />
          <span>
            Our<span className="red">Taiko</span>
          </span>
        </a>
        <nav
          id="site-nav"
          className={navOpen ? "is-open" : ""}
          aria-label={t("navigation")}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setNavOpen(false);
          }}
        >
          <a href="#products">{t("products.label")}</a>
          <a href="#community">{t("community.label")}</a>
          <a
            href="https://github.com/OurTaiko"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <span aria-hidden="true">↗</span>
            <span className="sr-only">{t("newTab")}</span>
          </a>
          <a
            className="nav-account"
            href="https://sso.ourtaiko.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("account")}
            <span className="sr-only">{t("newTab")}</span>
          </a>
        </nav>
        <div
          className="language-switcher"
          ref={languageArea}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setLanguageOpen(false);
          }}
        >
          <button
            className="language-toggle icon-button"
            ref={languageButton}
            type="button"
            aria-label={t("language.label")}
            title={t("language.label")}
            aria-haspopup="menu"
            aria-expanded={languageOpen}
            aria-controls="language-menu"
            onClick={() => {
              setLanguageOpen(!languageOpen);
              setNavOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setLanguageOpen(true);
                setNavOpen(false);
              }
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M3 5h12M9 2v3M12 5c-1 6-4 9-9 11M5 8c1 3 4 6 8 8m0 5 5-12 5 12m-8-4h6" />
            </svg>
          </button>
          <ul
            id="language-menu"
            className="language-menu"
            role="menu"
            aria-label={t("language.label")}
            hidden={!languageOpen}
            onKeyDown={onMenuKey}
          >
            {options.map((option, index) => (
              <li key={option.value} role="none">
                <button
                  type="button"
                  ref={(element) => {
                    languageItems.current[index] = element;
                  }}
                  role="menuitemradio"
                  tabIndex={-1}
                  lang={option.value === "auto" ? undefined : option.value}
                  aria-checked={preference === option.value}
                  data-language={option.value}
                  onClick={() => {
                    selectLanguage(option.value);
                    setLanguageOpen(false);
                    languageButton.current?.focus();
                  }}
                >
                  {option.label}
                  {preference === option.value ? (
                    <span aria-hidden="true">✓</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          className="menu-toggle icon-button"
          ref={navButton}
          type="button"
          aria-expanded={navOpen}
          aria-controls="site-nav"
          aria-label={t(navOpen ? "nav.close" : "nav.open")}
          onClick={() => {
            setNavOpen(!navOpen);
            setLanguageOpen(false);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              d={navOpen ? "m5 5 14 14M5 19 19 5" : "M3 5h18M3 12h18M3 19h18"}
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
