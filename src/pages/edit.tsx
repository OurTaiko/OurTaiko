import { useState } from "react";
import {
  Shell,
  LocalNav,
  ExternalLink,
  Chevron,
} from "../components/Shell";
import { Tile, icons, osIcons, desktopPlatform } from "../components/Art";
import { useLanguage } from "../i18n";
import { mount } from "../main";
import messages from "../locales/edit";

type Key = keyof (typeof messages)["zh-Hans"];

const repo = "https://github.com/OurTaiko/OurTaikoEdit";
const release = {
  stable: `${repo}/releases/latest`,
  nightly: `${repo}/releases/tag/nightly`,
  all: `${repo}/releases`,
  rhythmhub: "https://github.com/sparkbarry/RhythmHub/releases/latest",
};

function Edit() {
  const { t, language } = useLanguage<Key>();
  const [desktop] = useState(desktopPlatform);
  const shot = language === "zh-Hans" ? "zh" : language === "ja" ? "ja" : "en";
  const cards: { id: "mac" | "windows"; name: string; spec: Key; run: Key }[] = [
    { id: "mac", name: "macOS", spec: "download.macSpec", run: "download.macRun" },
    { id: "windows", name: "Windows", spec: "download.windowsSpec", run: "download.windowsRun" },
  ];
  if (desktop === "windows") cards.reverse();

  return (
    <Shell
      page="edit"
      localNav={
        <LocalNav
          title="OurTaikoEdit"
          sections={[
            { href: "#features", label: t("nav.features") },
            { href: "#gallery", label: t("nav.gallery") },
          ]}
          action={
            <a className="pill small" href="#download">
              {t("nav.download")}
            </a>
          }
        />
      }
    >
      <header className="hero" id="top">
        <div className="wrap">
          <img
            className="app-icon"
            src="/images/edit/icon.webp"
            width="112"
            height="112"
            alt=""
          />
          <h1>OurTaikoEdit</h1>
          <p className="tagline">{t("hero.tagline")}</p>
          <p className="lead">{t("hero.description")}</p>
          <div className="actions">
            <a className="pill" href="#download">
              {t("hero.download")}
            </a>
            <ExternalLink className="text-link" href={repo}>
              {t("source")}
              <Chevron />
            </ExternalLink>
          </div>
          <p className="note">{t("hero.platforms")}</p>
        </div>
        <div className="wrap">
          <figure className="shot">
            <img
              src={`/images/edit/editor-${shot}.webp`}
              width="1440"
              height="876"
              alt={t("hero.shotAlt")}
            />
          </figure>
        </div>
      </header>

      <section className="band alt" id="features" aria-labelledby="features-title">
        <div className="wrap">
          <h2 id="features-title">{t("features.title")}</h2>
          <p className="sub">{t("features.sub")}</p>
          <div className="grid">
            <Tile icon={icons.timeline} title={t("feature.views")}>
              <p>{t("feature.viewsText")}</p>
            </Tile>
            <Tile icon={icons.code} title={t("feature.parser")}>
              <p>{t("feature.parserText")}</p>
            </Tile>
            <Tile icon={icons.check} title={t("feature.diagnostics")}>
              <p>{t("feature.diagnosticsText")}</p>
            </Tile>
            <Tile icon={icons.audio} title={t("feature.audio")}>
              <p>{t("feature.audioText")}</p>
            </Tile>
            <Tile icon={icons.play} title={t("feature.playtest")}>
              <p>{t("feature.playtestText")}</p>
            </Tile>
            <Tile icon={icons.branch} title={t("feature.branches")}>
              <p>{t("feature.branchesText")}</p>
            </Tile>
            <Tile icon={icons.text} title={t("feature.encoding")}>
              <p>{t("feature.encodingText")}</p>
            </Tile>
            <Tile icon={icons.translate} title={t("feature.languages")}>
              <p>{t("feature.languagesText")}</p>
            </Tile>
          </div>
        </div>
      </section>

      <section className="band" id="gallery" aria-labelledby="gallery-title">
        <div className="wrap">
          <h2 id="gallery-title">{t("gallery.title")}</h2>
          <p className="sub">{t("gallery.sub")}</p>
          <div className="duo">
            <figure>
              <img
                src="/images/edit/timeline-branch.webp"
                width="1440"
                height="876"
                loading="lazy"
                alt={t("gallery.branchAlt")}
              />
              <figcaption>{t("gallery.branch")}</figcaption>
            </figure>
            <figure>
              <img
                src="/images/edit/problems.webp"
                width="1440"
                height="876"
                loading="lazy"
                alt={t("gallery.problemsAlt")}
              />
              <figcaption>{t("gallery.problems")}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="band alt" id="download" aria-labelledby="download-title">
        <div className="wrap">
          <h2 id="download-title">{t("download.title")}</h2>
          <p className="sub">{t("download.sub")}</p>
          <div className="platforms">
            {cards.map((card) => (
              <div
                key={card.id}
                className={desktop === card.id ? "platform recommended" : "platform"}
              >
                <div className="os">
                  {osIcons[card.id]}
                  <h3>{card.name}</h3>
                  <span className="badge">{t("download.current")}</span>
                </div>
                <p className="req">{t(card.spec)}</p>
                <ExternalLink className="pill" href={release.stable}>
                  {t("download.stable")}
                </ExternalLink>
                <ul>
                  <li>
                    {t("download.nightlyLabel")}
                    <ExternalLink href={release.nightly}>Nightly</ExternalLink>
                  </li>
                  <li>
                    {t("download.runLabel")}
                    <span>{t(card.run)}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
          <div className="sources">
            <div className="source">
              <h3>{t("download.rhythmhub")}</h3>
              <p>{t("download.rhythmhubText")}</p>
              <div className="actions">
                <ExternalLink className="pill ghost" href={release.rhythmhub}>
                  {t("download.rhythmhubAction")}
                </ExternalLink>
              </div>
            </div>
            <div className="source">
              <h3>{t("download.firstRun")}</h3>
              <p>{t("download.firstRunMac")}</p>
              <p>{t("download.firstRunWindows")}</p>
              <div className="actions">
                <ExternalLink className="pill ghost" href={release.all}>
                  {t("download.allAction")}
                </ExternalLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}

mount(Edit, messages);
