import type { ReactNode } from "react";
import { Header } from "./components/Header";
import { useLanguage } from "./i18n";
import type { MessageKey } from "./i18n";

function ExternalLink({
  href,
  children,
  className = "text-link",
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
      <span aria-hidden="true">↗</span>
      <span className="sr-only">{t("newTab")}</span>
    </a>
  );
}

const products: {
  id: string;
  name: string;
  kind: MessageKey;
  description: MessageKey;
  tags: MessageKey[];
  action: MessageKey;
  href: string;
  source?: string;
  number: string;
}[] = [
  {
    id: "play",
    name: "OurTaikoPlay",
    kind: "play.kind",
    description: "play.description",
    tags: ["play.tag1", "play.tag2", "play.tag3"],
    action: "play.action",
    href: "https://play.ourtaiko.org/",
    source: "https://github.com/OurTaiko/OurTaikoPlay",
    number: "01",
  },
  {
    id: "view",
    name: "OurTaikoView_Web",
    kind: "view.kind",
    description: "view.description",
    tags: ["view.tag1", "view.tag2", "view.tag3"],
    action: "view.action",
    href: "https://fanmade.ourtaiko.org/",
    source: "https://github.com/OurTaiko/OurTaikoView_Web",
    number: "02",
  },
  {
    id: "fanmade",
    name: "OurTaikoFanmade",
    kind: "fanmade.kind",
    description: "fanmade.description",
    tags: ["fanmade.tag1", "fanmade.tag2", "fanmade.tag3"],
    action: "fanmade.action",
    href: "https://fanmade.ourtaiko.org/",
    source: "https://github.com/OurTaiko/Fanmade_Frontend",
    number: "03",
  },
  {
    id: "tournaments",
    name: "OurTaikoTournaments",
    kind: "tournaments.kind",
    description: "tournaments.description",
    tags: ["tournaments.tag1", "tournaments.tag2", "tournaments.tag3"],
    action: "tournaments.action",
    href: "https://tournaments.ourtaiko.org/",
    number: "04",
  },
];

function ProductArt({ kind }: { kind: string }) {
  return (
    <div className={`product-art art-${kind}`} aria-hidden="true">
      {kind === "play" || kind === "view" ? (
        <>
          <div className="art-caption">
            {kind === "play" ? "DON · KA · DON!" : "YOUR NEXT FULL COMBO"}
          </div>
          <div className="note-lane">
            <span className="hit-ring" />
            <i className="note don" />
            <i className="note ka" />
            <i className="note don large" />
            <i className="note ka" />
            <i className="note don" />
          </div>
          {kind === "play" ? (
            <img
              className="art-don"
              src="/assets/donder/sticker_1.png"
              alt=""
              width="132"
              height="117"
            />
          ) : (
            <div className="timeline">
              <span>00:24</span>
              <div>
                <i />
              </div>
              <span>01:48</span>
            </div>
          )}
        </>
      ) : kind === "fanmade" ? (
        <>
          <div className="chart-stack">
            {[1, 2, 3].map((n) => (
              <div className={`chart-sheet sheet-${n}`} key={n}>
                <div className="sheet-disc">♪</div>
                <div className="sheet-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="sheet-stars">★ ★ ★ ★</div>
              </div>
            ))}
          </div>
          <span className="art-spark spark-one">✦</span>
          <span className="art-spark spark-two">✦</span>
        </>
      ) : (
        <>
          <svg className="bracket" viewBox="0 0 440 170" fill="none">
            <g stroke="currentColor" strokeWidth="2">
              <path d="M60 35h52v35h62m-114 65h52V100h62M380 35h-52v35h-62m114 65h-52V100h-62" />
              <rect x="22" y="22" width="60" height="26" rx="6" />
              <rect x="22" y="122" width="60" height="26" rx="6" />
              <rect x="358" y="22" width="60" height="26" rx="6" />
              <rect x="358" y="122" width="60" height="26" rx="6" />
            </g>
          </svg>
          <div className="trophy-medal">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 12h24v15c0 18-24 18-24 0V12ZM20 17H11v7c0 8 5 11 11 11m22-18h9v7c0 8-5 11-11 11M32 41v10m-10 4h20" />
              <path
                d="m32 19 2.5 5 5.5.8-4 4 .9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-4 5.5-.8Z"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const { t } = useLanguage();
  return (
    <>
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      <Header />
      <main id="main">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-inner">
            <p className="eyebrow hero-eyebrow">
              <i />
              {t("hero.eyebrow")}
              <i />
            </p>
            <div className="hero-wordmark">
              <img
                className="hero-sticker sticker-left"
                src="/assets/donder/sticker_1.png"
                width="132"
                height="117"
                alt=""
              />
              <h1 id="hero-title">
                Our<span>Taiko</span>
              </h1>
              <img
                className="hero-sticker sticker-right"
                src="/assets/donder/sticker_2.png"
                width="149"
                height="125"
                alt=""
              />
            </div>
            <p className="hero-tagline">
              {t("hero.title")}
              <span className="red">!</span>
            </p>
            <p className="hero-description">{t("hero.description")}</p>
            <div className="hero-actions">
              <a className="button button-red" href="#products">
                {t("hero.explore")}
                <span aria-hidden="true">↓</span>
              </a>
              <ExternalLink
                href="https://github.com/OurTaiko"
                className="button"
              >
                GitHub
              </ExternalLink>
            </div>
            <div className="hero-index" aria-label={t("products.label")}>
              {products.map((p) => (
                <a href={`#${p.id}`} key={p.id}>
                  <span>{p.number}</span>
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        </section>
        <section
          className="products section-wrap"
          id="products"
          aria-labelledby="products-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / {t("products.eyebrow")}</p>
              <h2 id="products-title">
                {t("products.title")}
                <span className="red">{t("products.accent")}</span>
              </h2>
            </div>
            <p>{t("products.intro")}</p>
          </div>
          <div className="product-grid">
            {products.map((p) => (
              <article
                className={`product-card product-${p.id}`}
                id={p.id}
                key={p.id}
                aria-labelledby={`${p.id}-title`}
              >
                <ProductArt kind={p.id} />
                <div className="product-body">
                  <div className="product-kicker">
                    <span>
                      {p.number} / {t(p.kind)}
                    </span>
                    <span className="product-dot" />
                  </div>
                  <h3 id={`${p.id}-title`}>{p.name}</h3>
                  <p className="product-description">{t(p.description)}</p>
                  <ul className="product-tags">
                    {p.tags.map((tag) => (
                      <li key={tag}>{t(tag)}</li>
                    ))}
                  </ul>
                  <div className="product-actions">
                    <ExternalLink
                      className="button product-button"
                      href={p.href}
                    >
                      {t(p.action)}
                    </ExternalLink>
                    {p.source ? (
                      <ExternalLink href={p.source}>{t("source")}</ExternalLink>
                    ) : (
                      <span className="product-note">
                        {t("tournaments.note")}
                      </span>
                    )}
                  </div>
                  {p.id === "view" ? (
                    <p className="integration-note">{t("view.note")}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="community section-wrap"
          id="community"
          aria-labelledby="community-title"
        >
          <div className="community-panel">
            <div>
              <p className="eyebrow">02 / {t("community.eyebrow")}</p>
              <h2 id="community-title">{t("community.title")}</h2>
              <p>{t("community.description")}</p>
              <div className="community-actions">
                <ExternalLink
                  href="https://github.com/OurTaiko"
                  className="button"
                >
                  {t("community.github")}
                </ExternalLink>
                <ExternalLink href="https://space.bilibili.com/485954888">
                  {t("community.bilibili")}
                </ExternalLink>
              </div>
            </div>
            <div className="community-decoration" aria-hidden="true">
              <img
                src="/assets/donder/sticker_1.png"
                alt=""
                width="132"
                height="117"
              />
              <img
                src="/assets/donder/sticker_2.png"
                alt=""
                width="149"
                height="125"
              />
              <span>DON! DON!</span>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer section-wrap">
        <div className="footer-top">
          <a className="brand" href="#home">
            <img src="/icons/icon-192.png" width="38" height="38" alt="" />
            <span>
              Our<span className="red">Taiko</span>
            </span>
          </a>
          <p>{t("footer.tagline")}</p>
          <ExternalLink href="https://github.com/OurTaiko">GitHub</ExternalLink>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} OurTaiko</span>
          <p>{t("footer.notice")}</p>
        </div>
        <details className="credits">
          <summary>{t("credits.title")}</summary>
          <p>
            {t("credits.text")}{" "}
            <ExternalLink href="https://github.com/luluxia/donder-tool">
              donder-tool
            </ExternalLink>{" "}
            ·{" "}
            <a href="/assets/donder/UPSTREAM-README.md">
              {t("credits.upstream")}
            </a>
          </p>
          <p>{t("credits.rights")}</p>
        </details>
      </footer>
    </>
  );
}
