import {
  Shell,
  LocalNav,
  ExternalLink,
  Chevron,
  links,
} from "../components/Shell";
import { AreasArt, Tile, icons, useAreaLabels } from "../components/Art";
import { useLanguage } from "../i18n";
import { mount } from "../main";
import messages from "../locales/net";

type Key = keyof (typeof messages)["zh-Hans"];

const site = "https://net.ourtaiko.org";
const repo = "https://github.com/OurTaiko/OurTaikoNet";

function Net() {
  const { t } = useLanguage<Key>();
  const areas = useAreaLabels();
  const areaRows: { id: "fanmade" | "official" | "players"; text: Key; action: Key }[] = [
    { id: "fanmade", text: "areas.fanmadeText", action: "areas.fanmadeAction" },
    { id: "official", text: "areas.officialText", action: "areas.officialAction" },
    { id: "players", text: "areas.playersText", action: "areas.playersAction" },
  ];
  return (
    <Shell
      page="net"
      localNav={
        <LocalNav
          title="OurTaikoNet"
          sections={[
            { href: "#features", label: t("nav.features") },
            { href: "#areas", label: t("nav.areas") },
            { href: "#game", label: t("nav.game") },
          ]}
          action={
            <ExternalLink className="pill small" href={links.net}>
              {t("nav.open")}
            </ExternalLink>
          }
        />
      }
    >
      <header className="hero" id="top">
        <div className="wrap">
          <div className="app-icon net-icon" aria-hidden="true">
            {icons.globe}
          </div>
          <h1>OurTaikoNet</h1>
          <p className="tagline">{t("hero.tagline")}</p>
          <p className="lead">{t("hero.description")}</p>
          <div className="actions">
            <ExternalLink className="pill" href={links.net}>
              {t("hero.open")}
            </ExternalLink>
            <ExternalLink className="text-link" href={repo}>
              {t("source")}
              <Chevron />
            </ExternalLink>
          </div>
          <p className="note">net.ourtaiko.org</p>
        </div>
        <div className="wrap">
          <div className="shot">
            <AreasArt full labels={areas} />
          </div>
        </div>
      </header>

      <section className="band alt" id="features" aria-labelledby="features-title">
        <div className="wrap">
          <h2 id="features-title">{t("features.title")}</h2>
          <p className="sub">{t("features.sub")}</p>
          <div className="grid">
            <Tile icon={icons.charts} title={t("feature.upload")}>
              <p>{t("feature.uploadText")}</p>
            </Tile>
            <Tile icon={icons.play} title={t("feature.preview")}>
              <p>{t("feature.previewText")}</p>
            </Tile>
            <Tile icon={icons.modes} title={t("feature.collections")}>
              <p>{t("feature.collectionsText")}</p>
            </Tile>
            <Tile icon={icons.rooms} title={t("feature.social")}>
              <p>{t("feature.socialText")}</p>
            </Tile>
            <Tile icon={icons.player} title={t("feature.profile")}>
              <p>{t("feature.profileText")}</p>
            </Tile>
            <Tile icon={icons.account} title={t("feature.account")}>
              <p>{t("feature.accountText")}</p>
            </Tile>
          </div>
        </div>
      </section>

      <section className="band" id="areas" aria-labelledby="areas-title">
        <div className="wrap">
          <h2 id="areas-title">{t("areas.title")}</h2>
          <p className="sub">{t("areas.sub")}</p>
          <div className="more">
            {areaRows.map((row) => (
              <Tile
                key={row.id}
                icon={icons[row.id === "fanmade" ? "charts" : row.id === "official" ? "library" : "player"]}
                title={areas[row.id][1]}
              >
                <p>{t(row.text)}</p>
                <ExternalLink className="tile-link" href={`${site}/${row.id}`}>
                  {t(row.action)}
                  <Chevron />
                </ExternalLink>
              </Tile>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="game" aria-labelledby="game-title">
        <div className="wrap">
          <h2 id="game-title">{t("game.title")}</h2>
          <p className="sub">{t("game.sub")}</p>
          <div className="grid">
            <Tile icon={icons.library} title={t("game.library")}>
              <p>{t("game.libraryText")}</p>
            </Tile>
            <Tile icon={icons.rooms} title={t("game.rooms")}>
              <p>{t("game.roomsText")}</p>
            </Tile>
            <Tile icon={icons.account} title={t("game.signin")}>
              <p>{t("game.signinText")}</p>
            </Tile>
          </div>
          <div className="actions">
            <a className="pill ghost" href="/play">
              {t("game.action")}
            </a>
          </div>
        </div>
      </section>

      <section className="band cta" aria-labelledby="moved-title">
        <div className="wrap">
          <h2 id="moved-title">{t("moved.title")}</h2>
          <p className="sub">{t("moved.text")}</p>
          <div className="actions">
            <ExternalLink className="pill" href={links.net}>
              {t("hero.open")}
            </ExternalLink>
          </div>
        </div>
      </section>
    </Shell>
  );
}

mount(Net, messages);
