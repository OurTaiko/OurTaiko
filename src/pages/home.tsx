import { Shell, ExternalLink, Chevron, links } from "../components/Shell";
import { LaneArt, AreasArt, Tile, icons, useAreaLabels } from "../components/Art";
import { useLanguage } from "../i18n";
import { mount } from "../main";
import messages from "../locales/home";

type Key = keyof (typeof messages)["zh-Hans"];

function Home() {
  const { t, language } = useLanguage<Key>();
  const areas = useAreaLabels();
  const editShot = language === "zh-Hans" ? "zh" : language === "ja" ? "ja" : "en";
  return (
    <Shell page="home">
      <header className="hero" id="top">
        <div className="wrap">
          <img
            className="app-icon"
            src="/images/play-icon.webp"
            width="112"
            height="112"
            alt=""
          />
          <h1>OurTaiko</h1>
          <p className="tagline">{t("hero.lead")}</p>
          <p className="lead">{t("hero.description")}</p>
          <div className="actions">
            <a className="pill" href="#products">
              {t("hero.explore")}
            </a>
            <ExternalLink className="text-link" href={links.github}>
              GitHub
              <Chevron />
            </ExternalLink>
          </div>
        </div>
      </header>

      <section
        className="products"
        id="products"
        aria-label={t("products.label")}
      >
        <article className="product wide" aria-labelledby="play-title">
          <img
            className="app-icon"
            src="/images/play-icon.webp"
            width="72"
            height="72"
            alt=""
          />
          <h3 id="play-title">OurTaikoPlay</h3>
          <p className="product-tagline">{t("play.tagline")}</p>
          <p className="product-description">{t("play.description")}</p>
          <div className="actions">
            <a className="pill" href="/play">
              {t("learnMore")}
            </a>
            <a className="text-link" href="/play#download">
              {t("download")}
              <Chevron />
            </a>
          </div>
          <p className="platforms-note">{t("play.note")}</p>
          <div className="product-art">
            <LaneArt />
          </div>
        </article>

        <article className="product" aria-labelledby="net-title">
          <div className="app-icon net-icon" aria-hidden="true">
            {icons.globe}
          </div>
          <h3 id="net-title">OurTaikoNet</h3>
          <p className="product-tagline">{t("net.tagline")}</p>
          <p className="product-description">{t("net.description")}</p>
          <div className="actions">
            <a className="pill" href="/net">
              {t("learnMore")}
            </a>
            <ExternalLink className="text-link" href={links.net}>
              {t("net.open")}
              <Chevron />
            </ExternalLink>
          </div>
          <p className="platforms-note">net.ourtaiko.org</p>
          <div className="product-art">
            <AreasArt labels={areas} />
          </div>
        </article>

        <article className="product dark" aria-labelledby="edit-title">
          <img
            className="app-icon"
            src="/images/edit/icon.webp"
            width="72"
            height="72"
            alt=""
          />
          <h3 id="edit-title">OurTaikoEdit</h3>
          <p className="product-tagline">{t("edit.tagline")}</p>
          <p className="product-description">{t("edit.description")}</p>
          <div className="actions">
            <a className="pill" href="/edit">
              {t("learnMore")}
            </a>
            <a className="text-link" href="/edit#download">
              {t("download")}
              <Chevron />
            </a>
          </div>
          <p className="platforms-note">{t("edit.note")}</p>
          <div className="product-art">
            <img
              className="edit-shot"
              src={`/images/edit/editor-${editShot}.webp`}
              width="1440"
              height="876"
              loading="lazy"
              alt={t("edit.shotAlt")}
            />
          </div>
        </article>
      </section>

      <section className="band" aria-labelledby="more-title">
        <div className="wrap">
          <h2 id="more-title">{t("more.title")}</h2>
          <p className="sub">{t("more.sub")}</p>
          <div className="more">
            <Tile icon={icons.code} title="TJAParser">
              <p>{t("more.parser")}</p>
              <ExternalLink
                className="tile-link"
                href="https://github.com/OurTaiko/TJAParser"
              >
                {t("source")}
                <Chevron />
              </ExternalLink>
            </Tile>
            <Tile icon={icons.play} title="OurTaikoView_Web">
              <p>{t("more.view")}</p>
              <ExternalLink
                className="tile-link"
                href="https://github.com/OurTaiko/OurTaikoView_Web"
              >
                {t("source")}
                <Chevron />
              </ExternalLink>
            </Tile>
            <Tile icon={icons.chara} title="otanim">
              <p>{t("more.otanim")}</p>
              <ExternalLink
                className="tile-link"
                href="https://github.com/OurTaiko/otanim"
              >
                {t("source")}
                <Chevron />
              </ExternalLink>
            </Tile>
          </div>
        </div>
      </section>

      <section className="band alt cta" aria-labelledby="community-title">
        <div className="wrap">
          <h2 id="community-title">{t("community.title")}</h2>
          <p className="sub">{t("community.description")}</p>
          <div className="actions">
            <ExternalLink className="pill" href={links.github}>
              {t("community.github")}
            </ExternalLink>
            <ExternalLink className="text-link" href={links.qq}>
              {t("footer.qq")}
              <Chevron />
            </ExternalLink>
            <ExternalLink className="text-link" href={links.bilibili}>
              {t("footer.bilibili")}
              <Chevron />
            </ExternalLink>
          </div>
        </div>
      </section>
    </Shell>
  );
}

mount(Home, messages);
