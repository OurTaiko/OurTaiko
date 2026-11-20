import { useState } from "react";
import type { ReactNode } from "react";
import {
  Shell,
  LocalNav,
  ExternalLink,
  Chevron,
  links,
} from "../components/Shell";
import { LaneArt, Tile, icons, osIcons, desktopPlatform } from "../components/Art";
import { useLanguage } from "../i18n";
import { mount } from "../main";
import messages from "../locales/play";

type Key = keyof (typeof messages)["zh-Hans"];

const repo = "https://github.com/OurTaiko/OurTaikoPlay";
const release = {
  stable: `${repo}/releases/latest`,
  nightly: `${repo}/releases/tag/nightly`,
  all: `${repo}/releases`,
  testflight: "https://testflight.apple.com/join/PGTVXtFq",
  rhythmhub: "https://github.com/sparkbarry/RhythmHub/releases/latest",
};

type PlatformId = "windows" | "mac" | "android" | "ios";

function Platform({
  id,
  name,
  recommended,
  children,
}: {
  id: PlatformId;
  name: string;
  recommended: boolean;
  children: ReactNode;
}) {
  const { t } = useLanguage<Key>();
  return (
    <div className={recommended ? "platform recommended" : "platform"}>
      <div className="os">
        {osIcons[id]}
        <h3>{name}</h3>
        <span className="badge">{t("download.current")}</span>
      </div>
      {children}
    </div>
  );
}

function Play() {
  const { t } = useLanguage<Key>();
  const [desktop] = useState(desktopPlatform);
  const desktopCards: { id: "windows" | "mac"; name: string; spec: Key; run: Key }[] = [
    { id: "windows", name: "Windows", spec: "download.windowsSpec", run: "download.windowsRun" },
    { id: "mac", name: "macOS", spec: "download.macSpec", run: "download.macRun" },
  ];
  if (desktop === "mac") desktopCards.reverse();

  return (
    <Shell
      page="play"
      localNav={
        <LocalNav
          title="OurTaikoPlay"
          sections={[
            { href: "#features", label: t("nav.features") },
            { href: "#guide", label: t("nav.guide") },
            { href: "#friends", label: t("nav.friends") },
          ]}
          action={
            <a className="pill small" href="#download">
              {t("nav.download")}
            </a>
          }
        />
      }
      footer={<p>{t("footer.play")}</p>}
    >
      <header className="hero" id="top">
        <div className="wrap">
          <img
            className="app-icon"
            src="/images/play-icon.webp"
            width="112"
            height="112"
            alt=""
          />
          <h1>OurTaikoPlay</h1>
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
          <div className="shot">
            <LaneArt full />
          </div>
        </div>
      </header>

      <section className="band alt" id="features" aria-labelledby="features-title">
        <div className="wrap">
          <h2 id="features-title">{t("features.title")}</h2>
          <p className="sub">{t("features.sub")}</p>
          <div className="grid">
            <Tile icon={icons.play} title={t("feature.flow")}>
              <p>{t("feature.flowText")}</p>
            </Tile>
            <Tile icon={icons.modes} title={t("feature.modes")}>
              <p>{t("feature.modesText")}</p>
            </Tile>
            <Tile icon={icons.skin} title={t("feature.skin")}>
              <p>{t("feature.skinText")}</p>
            </Tile>
            <Tile icon={icons.input} title={t("feature.input")}>
              <p>{t("feature.inputText")}</p>
            </Tile>
            <Tile icon={icons.library} title={t("feature.library")}>
              <p>{t("feature.libraryText")}</p>
            </Tile>
            <Tile icon={icons.chara} title={t("feature.chara")}>
              <p>{t("feature.charaText")}</p>
            </Tile>
            <Tile icon={icons.audio} title={t("feature.audio")}>
              <p>{t("feature.audioText")}</p>
            </Tile>
            <Tile icon={icons.rooms} title={t("feature.rooms")}>
              <p>{t("feature.roomsText")}</p>
            </Tile>
            <Tile icon={icons.translate} title={t("feature.languages")}>
              <p>{t("feature.languagesText")}</p>
            </Tile>
          </div>
        </div>
      </section>

      <section className="band" id="controls" aria-labelledby="controls-title">
        <div className="wrap">
          <h2 id="controls-title">{t("controls.title")}</h2>
          <p className="sub">{t("controls.sub")}</p>
          <div className="keys">
            <div className="key-group">
              <div className="caps">
                <kbd className="ka">D</kbd>
                <kbd className="ka">K</kbd>
              </div>
              <span>{t("controls.ka")}</span>
            </div>
            <div className="key-group">
              <div className="caps">
                <kbd className="don">F</kbd>
                <kbd className="don">J</kbd>
              </div>
              <span>{t("controls.don")}</span>
            </div>
            <div className="key-group">
              <div className="caps">
                <kbd>Space</kbd>
              </div>
              <span>{t("controls.pause")}</span>
            </div>
            <div className="key-group">
              <div className="caps">
                <kbd>F1</kbd>
              </div>
              <span>{t("controls.restart")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band alt" id="download" aria-labelledby="download-title">
        <div className="wrap">
          <h2 id="download-title">{t("download.title")}</h2>
          <p className="sub">{t("download.sub")}</p>
          <div className="platforms">
            {desktopCards.map((card) => (
              <Platform
                key={card.id}
                id={card.id}
                name={card.name}
                recommended={desktop === card.id}
              >
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
              </Platform>
            ))}
            <Platform id="android" name="Android" recommended={false}>
              <p className="req">{t("download.androidSpec")}</p>
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
                  <span>{t("download.androidRun")}</span>
                </li>
              </ul>
            </Platform>
            <Platform id="ios" name="iOS" recommended={false}>
              <p className="req">{t("download.iosSpec")}</p>
              <ExternalLink className="pill" href={release.testflight}>
                {t("download.testflight")}
              </ExternalLink>
              <ul>
                <li>
                  {t("download.iosNoteLabel")}
                  <span>{t("download.iosNote")}</span>
                </li>
              </ul>
            </Platform>
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
              <h3>{t("download.all")}</h3>
              <p>{t("download.allText")}</p>
              <div className="actions">
                <ExternalLink className="pill ghost" href={release.all}>
                  {t("download.allAction")}
                </ExternalLink>
              </div>
            </div>
          </div>
          <p className="fineprint">{t("download.note")}</p>
        </div>
      </section>

      <section className="band" id="guide" aria-labelledby="guide-title">
        <div className="wrap">
          <h2 id="guide-title">{t("guide.title")}</h2>
          <p className="sub">{t("guide.sub")}</p>
          <ol className="steps">
            <li>
              <h3>{t("guide.install")}</h3>
              <p>{t("guide.installText")}</p>
            </li>
            <li>
              <h3>{t("guide.songs")}</h3>
              <p>{t("guide.songsText")}</p>
            </li>
            <li>
              <h3>{t("guide.play")}</h3>
              <p>{t("guide.playText")}</p>
            </li>
          </ol>
          <p className="fineprint">
            {t("guide.note")}{" "}
            <ExternalLink href={`${repo}#readme`}>{t("guide.docs")}</ExternalLink>
          </p>
        </div>
      </section>

      <section className="band alt cta" id="community" aria-labelledby="community-title">
        <div className="wrap">
          <h2 id="community-title">{t("community.title")}</h2>
          <p className="sub">{t("community.description")}</p>
          <div className="actions">
            <ExternalLink className="pill" href={links.qq}>
              {t("community.qq")}
            </ExternalLink>
            <ExternalLink className="text-link" href={`${repo}/issues`}>
              {t("community.issues")}
              <Chevron />
            </ExternalLink>
          </div>
        </div>
      </section>

      <section className="band" id="friends" aria-labelledby="friends-title">
        <div className="wrap">
          <h2 id="friends-title">{t("friends.title")}</h2>
          <p className="sub">{t("friends.sub")}</p>
          <div className="more">
            <Tile icon={icons.charts} title="OurTaikoNet">
              <p>{t("friends.net")}</p>
              <a className="tile-link" href="/net">
                {t("learnMore")}
                <Chevron />
              </a>
            </Tile>
            <Tile icon={icons.player} title="Sakura Taiko Viewer">
              <p>{t("friends.viewer")}</p>
              <ExternalLink className="tile-link" href="https://viewer.sakura-bot.cn/">
                viewer.sakura-bot.cn
                <Chevron />
              </ExternalLink>
            </Tile>
            <Tile icon={icons.globe} title="Majdata Net">
              <p>{t("friends.majdata")}</p>
              <ExternalLink className="tile-link" href="https://majdata.net/">
                majdata.net
                <Chevron />
              </ExternalLink>
            </Tile>
          </div>
        </div>
      </section>
    </Shell>
  );
}

mount(Play, messages);
