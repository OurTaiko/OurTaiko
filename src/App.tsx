import { Header } from "@/components/Header";
import { Rhythm } from "@/components/Rhythm";
import { FanmadePreview } from "@/components/FanmadePreview";
import { Card } from "@/components/ui/card";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        跳转到主要内容
      </a>
      <Header />

      <main id="main">
        <section
          className="hero container"
          id="home"
          aria-labelledby="hero-title"
        >
          <p className="hero-kicker">属于我们的太鼓世界</p>
          <h1 id="hero-title">
            一起，
            <br />
            <span>把热爱敲响。</span>
          </h1>
          <p className="hero-description">
            从一张谱面，到一次演奏，再到一场相遇。
            <br />
            我们用代码连接创作，用节奏连接彼此。
          </p>
          <div className="hero-actions">
            <a className="button" href="#products">
              探索我们的产品 <span aria-hidden="true">↓</span>
            </a>
            <a
              className="text-link"
              href="https://github.com/OurTaiko"
              target="_blank"
              rel="noopener noreferrer"
            >
              一起创造 <span aria-hidden="true">↗</span>
              <span className="sr-only">（GitHub，在新标签页打开）</span>
            </a>
          </div>

          <Rhythm />
          <div className="hero-footnote">
            <span>为玩家而造</span>
            <span aria-hidden="true">·</span>
            <span>因热爱相聚</span>
            <span aria-hidden="true">·</span>
            <span>与社区共创</span>
          </div>
        </section>

        <section
          className="products section"
          id="products"
          aria-labelledby="products-title"
        >
          <div className="container">
            <div className="section-heading">
              <h2 id="products-title">让热爱，多一种可能。</h2>
              <p>创作、演奏、相聚。找到属于你的那一拍。</p>
            </div>
            <Card className="product-card fanmade-card group">
              <div className="product-copy">
                <span className="product-label">创作与分享</span>
                <h3>OurTaiko Fanmade</h3>
                <p className="product-tagline">好谱面，值得被听见。</p>
                <p className="product-description">
                  发现社区的原创谱面，预览、试听，或分享你的新作品。从灵感到下一次挑战，让创作在玩家之间流动。
                </p>
                <div className="product-actions">
                  <a
                    className="text-link"
                    href="https://fanmade.ourtaiko.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    探索 Fanmade <span aria-hidden="true">↗</span>
                    <span className="sr-only">（在新标签页打开）</span>
                  </a>
                </div>
                <div className="source-links">
                  <span>开放源码</span>
                  <a
                    href="https://github.com/OurTaiko/Fanmade_Frontend"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    前端 <span aria-hidden="true">↗</span>
                    <span className="sr-only">（在新标签页打开）</span>
                  </a>
                  <a
                    href="https://github.com/OurTaiko/Fanmade_Backend"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    后端 <span aria-hidden="true">↗</span>
                    <span className="sr-only">（在新标签页打开）</span>
                  </a>
                </div>
              </div>
              <FanmadePreview />
            </Card>

            <div className="product-grid">
              <Card className="product-card player-card group">
                <div className="product-copy">
                  <span className="product-label">专注每一次演奏</span>
                  <h3>OurTaikoPlayer</h3>
                  <p className="product-tagline">打开，就进入节奏。</p>
                  <p className="product-description">
                    你的 TJA
                    播放器与太鼓模拟器。练习喜欢的段落，挑战新的谱面，把每一拍都变成自己的节奏。
                  </p>
                  <div className="product-actions">
                    <a
                      className="text-link"
                      href="https://github.com/OurTaiko/OurTaikoPlayer/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      下载 Player <span aria-hidden="true">↗</span>
                      <span className="sr-only">
                        （GitHub Releases，在新标签页打开）
                      </span>
                    </a>
                    <a
                      className="secondary-link"
                      href="https://github.com/OurTaiko/OurTaikoPlayer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      查看源码 <span aria-hidden="true">↗</span>
                      <span className="sr-only">（在新标签页打开）</span>
                    </a>
                  </div>
                </div>
                <div
                  className="player-visual"
                  aria-label="Player 支持本地谱面、练习模式与双人演奏"
                >
                  <div className="player-display">
                    <span className="player-display-label">
                      OurTaiko<span>Player</span>
                    </span>
                    <span className="play-symbol" aria-hidden="true">
                      ▶
                    </span>
                  </div>
                  <div className="player-lane" aria-hidden="true">
                    <span className="player-target"></span>
                    <i className="note don"></i>
                    <i className="note ka"></i>
                    <i className="note don large"></i>
                    <i className="note ka"></i>
                  </div>
                  <div className="player-modes">
                    <span>本地谱面</span>
                    <span>练习模式</span>
                    <span>双人演奏</span>
                  </div>
                </div>
                <p className="platforms">
                  Windows · macOS · Linux · Android · iOS
                  <span>各平台安装方式见发布说明</span>
                </p>
              </Card>
              <Card className="product-card hachicats-card group">
                <div className="product-copy">
                  <span className="product-label">相聚，就有好戏</span>
                  <h3>
                    HachiCats<span className="hachi-name">八猫杯</span>
                  </h3>
                  <p className="product-tagline">让每场热爱，都有主场。</p>
                  <p className="product-description">
                    走进八猫杯的比赛现场。认识参赛选手，查看赛事对阵与比分，见证每一次全力以赴。
                  </p>
                  <div className="product-actions">
                    <a
                      className="text-link"
                      href="https://hachicats.ourtaiko.org"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      前往八猫杯 <span aria-hidden="true">↗</span>
                      <span className="sr-only">（在新标签页打开）</span>
                    </a>
                  </div>
                </div>
                <div
                  className="tournament-visual"
                  aria-label="赛事对阵示意，不代表实际赛事结果"
                >
                  <div className="tournament-heading">
                    <span className="hachi-badge">8</span>
                    <div>
                      <strong>每一次相遇，都是高光。</strong>
                      <span>HachiCats Tournament</span>
                    </div>
                  </div>
                  <div className="bracket">
                    <div className="bracket-round">
                      <span>半决赛</span>
                      <div>
                        选手 A <b>vs</b> 选手 B
                      </div>
                      <div>
                        选手 C <b>vs</b> 选手 D
                      </div>
                    </div>
                    <div className="bracket-connector" aria-hidden="true"></div>
                    <div className="bracket-final">
                      <span>决赛</span>
                      <div>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path d="M7 3h10v5a5 5 0 0 1-10 0V3Zm0 2H3v2a4 4 0 0 0 5 4m9-6h4v2a4 4 0 0 1-5 4m-4 2v5m-4 3h8m-6-3h4v3" />
                        </svg>
                        向下一轮出发
                      </div>
                    </div>
                  </div>
                  <span className="diagram-caption">赛事对阵示意</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section
          className="about section container"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-intro">
            <img
              src="/icons/icon-192.png"
              alt="OurTaiko 太鼓标志"
              width="104"
              height="104"
              loading="lazy"
            />
            <h2 id="about-title">
              由玩家出发。
              <br />
              <span>为热爱而做。</span>
            </h2>
            <p>
              OurTaiko 是一群太鼓爱好者共同创造的空间。
              <br className="desktop-break" />
              我们写代码、做工具、办比赛，也和你一样，
              <br className="desktop-break" />
              会为一张好谱、一场好比赛、一次突破而开心。
            </p>
          </div>
          <div className="values">
            <div>
              <span className="value-number">01</span>
              <h3>让创作被看见</h3>
              <p>给灵感一个出口，让好作品遇见同样热爱它的人。</p>
            </div>
            <div>
              <span className="value-number">02</span>
              <h3>把工具做好用</h3>
              <p>从找谱到演奏，认真打磨每个小细节，让热爱更简单。</p>
            </div>
            <div>
              <span className="value-number">03</span>
              <h3>和社区一起成长</h3>
              <p>一个建议，一次贡献，一场相聚，都能让这里变得更好。</p>
            </div>
          </div>
        </section>

        <section className="join-section" aria-labelledby="join-title">
          <div className="container join-content">
            <div>
              <h2 id="join-title">下一拍，和我们一起。</h2>
              <p>写一段代码，分享一个想法，或者从玩一首歌开始。</p>
            </div>
            <a
              className="button"
              href="https://github.com/OurTaiko"
              target="_blank"
              rel="noopener noreferrer"
            >
              在 GitHub 相遇 <span aria-hidden="true">↗</span>
              <span className="sr-only">（在新标签页打开）</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer container">
        <div className="footer-top">
          <a className="wordmark" href="#home">
            OurTaiko<span className="wordmark-dot">.</span>
          </a>
          <p>Our beat. Our world.</p>
          <a href="#home" className="back-top">
            回到顶部 <span aria-hidden="true">↑</span>
          </a>
        </div>
        <div className="footer-bottom">
          <p>
            © <span>{new Date().getFullYear()}</span> OurTaiko. Made with love
            for rhythm.
          </p>
          <div>
            <a
              href="https://github.com/OurTaiko"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub<span className="sr-only">（在新标签页打开）</span>
            </a>
            <a
              href="https://sso.ourtaiko.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              账号中心<span className="sr-only">（在新标签页打开）</span>
            </a>
            <span>热爱，始终同频。</span>
          </div>
        </div>
      </footer>
    </>
  );
}
