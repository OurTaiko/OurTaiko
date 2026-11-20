import type { ReactNode } from "react";
import { useLanguage } from "../i18n";

/** A drum lane drawn in CSS. Decorative: it is not a screenshot of the game. */
export function LaneArt({ full = false }: { full?: boolean }) {
  const notes: [string, number][] = [
    ["don", 22],
    ["ka", 33],
    ["don", 44],
    ["don big", 60],
    ["ka", 75],
    ["don", 86],
    ["ka", 97],
  ];
  return (
    <div className={full ? "lane-art full" : "lane-art"} aria-hidden="true">
      <div className="combo">DON · KA · DON!</div>
      <div className="gauge">
        <i />
      </div>
      <div className="track" />
      <div className="judge" />
      <i className="bar" style={{ left: "52%" }} />
      {notes.map(([kind, left], i) => (
        <i className={`note ${kind}`} key={i} style={{ left: `${left}%` }} />
      ))}
    </div>
  );
}

export const icons = {
  charts: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 24V7l14-3v17" />
      <circle cx="8.5" cy="24" r="3.5" />
      <circle cx="22.5" cy="21" r="3.5" />
    </svg>
  ),
  library: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="5" width="6" height="22" rx="1.5" />
      <rect x="13" y="5" width="6" height="22" rx="1.5" />
      <path d="M21.5 6.5l5.6 1.5-5 19-5.6-1.5" />
    </svg>
  ),
  player: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="16" cy="11" r="5" />
      <path d="M6 27c1.5-5.5 5.4-8 10-8s8.5 2.5 10 8" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="14" width="20" height="13" rx="3" />
      <path d="M11 14v-3a5 5 0 0110 0v3M16 19v3" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="16" cy="16" r="12" />
      <path d="M13 11l8 5-8 5z" fill="currentColor" />
    </svg>
  ),
  rooms: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="12" r="4" />
      <circle cx="22" cy="12" r="4" />
      <path d="M3.5 26c1-4 4-6 7.5-6s6.5 2 7.5 6M18 20.5c.9-.3 2-.5 4-.5 3.5 0 6.5 2 7.5 6" />
    </svg>
  ),
  skin: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="6" width="24" height="20" rx="4" />
      <circle cx="12" cy="16" r="4" />
      <path d="M19 13h5M19 19h5" />
    </svg>
  ),
  input: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="16" cy="12" rx="11" ry="5" />
      <path d="M5 12v8c0 2.8 4.9 5 11 5s11-2.2 11-5v-8" />
    </svg>
  ),
  modes: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="10" height="10" rx="2.5" />
      <rect x="18" y="4" width="10" height="10" rx="2.5" />
      <rect x="4" y="18" width="10" height="10" rx="2.5" />
      <rect x="18" y="18" width="10" height="10" rx="2.5" />
    </svg>
  ),
  chara: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4l11 6v12l-11 6-11-6V10z" />
      <path d="M5 10l11 6 11-6M16 16v12" />
    </svg>
  ),
  audio: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 13v6M9 9v14M14 5v22M19 10v12M24 13v6M28 15v2" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="16" cy="16" r="12" />
      <path d="M4 16h24M16 4c3.3 3.3 5 7.3 5 12s-1.7 8.7-5 12c-3.3-3.3-5-7.3-5-12s1.7-8.7 5-12z" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 9l-7 7 7 7M21 9l7 7-7 7M18 6l-4 20" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4l10 4v7c0 6.5-4.3 11.2-10 13-5.7-1.8-10-6.5-10-13V8z" />
      <path d="M11.5 16l3.2 3.2 6-6.4" />
    </svg>
  ),
  timeline: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h24M4 16h24M4 23h24M20 5v22" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="13" cy="16" r="1.5" fill="currentColor" />
      <circle cx="25" cy="23" r="1.5" fill="currentColor" />
    </svg>
  ),
  branch: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="7" r="3" />
      <circle cx="8" cy="25" r="3" />
      <circle cx="24" cy="11" r="3" />
      <path d="M8 10v12M24 14c0 6-16 4-16 8" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h12M11 8v16M19 14h9M23.5 14v10" />
    </svg>
  ),
  translate: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h14M11 4v3M15 7c-1.2 5-4.6 9-9 11M8 11c1.5 3 4 5.4 7 6.5" />
      <path d="M17 28l5-12 5 12M18.7 24h6.6" />
    </svg>
  ),
};

export const osIcons = {
  windows: (
    <svg viewBox="0 0 30 30" fill="currentColor" aria-hidden="true">
      <path d="M4 7l9-1.3V14H4zM14.5 5.5L26 4v10H14.5zM4 15.5h9v8.8L4 23zM14.5 15.5H26V26l-11.5-1.6z" />
    </svg>
  ),
  mac: (
    <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="24" height="16" rx="2" />
      <path d="M10 26h10M15 21v5" />
    </svg>
  ),
  android: (
    <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 14a8 8 0 0116 0v9H7z" />
      <path d="M10 6.5l-2-3M20 6.5l2-3" />
      <circle cx="11.5" cy="11.5" r="0.8" fill="currentColor" />
      <circle cx="18.5" cy="11.5" r="0.8" fill="currentColor" />
    </svg>
  ),
  ios: (
    <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="3" width="14" height="24" rx="3" />
      <path d="M13 23h4" />
    </svg>
  ),
};

export function Tile({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="tile">
      {icon}
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/** Net's three areas as coloured cards. Decorative: not a screenshot of the site. */
export function AreasArt({
  full = false,
  labels,
}: {
  full?: boolean;
  labels: { fanmade: [string, string]; official: [string, string]; players: [string, string] };
}) {
  const areas = [
    ["fanmade", icons.charts],
    ["official", icons.library],
    ["players", icons.player],
  ] as const;
  return (
    <div className={full ? "areas-art full" : "areas-art"} aria-hidden="true">
      {areas.map(([id, icon]) => (
        <div className={`area ${id}`} key={id}>
          {icon}
          <span>{labels[id][0]}</span>
          <strong>{labels[id][1]}</strong>
        </div>
      ))}
    </div>
  );
}

/** Which desktop system the visitor is on, to put that download first. */
export function desktopPlatform(): "mac" | "windows" | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|Android/.test(ua)) return null;
  if (/Mac/.test(ua)) return "mac";
  if (/Windows/.test(ua)) return "windows";
  return null;
}

/** The labels of the three areas in the current language. */
export function useAreaLabels() {
  const { t } = useLanguage();
  return {
    fanmade: [t("area.fanmade.kicker"), t("area.fanmade")] as [string, string],
    official: [t("area.official.kicker"), t("area.official")] as [string, string],
    players: [t("area.players.kicker"), t("area.players")] as [string, string],
  };
}
