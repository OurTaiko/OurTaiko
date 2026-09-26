import type { ReactNode } from "react";
import { MusicNotesIcon, PlayIcon, TrophyIcon } from "@phosphor-icons/react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";

function ProjectLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <a
      className={secondary ? "secondary-link" : "text-link"}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children} <span aria-hidden="true">↗</span>
      <span className="sr-only">（在新标签页打开）</span>
    </a>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        跳转到主要内容
      </a>
      <Header />
      <main id="main" className="container pb-16 sm:pb-20">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <h1 id="hero-title">OurTaiko</h1>
          <p>谱面平台、太鼓模拟器和赛事网站。</p>
        </section>

        <section id="products" aria-label="项目">
          <Card className="project-card fanmade-card">
            <div>
              <div className="project-icon" aria-hidden="true">
                <MusicNotesIcon size={28} />
              </div>
              <h2>OurTaiko Fanmade</h2>
              <p className="project-description">
                自制谱面分享平台，支持谱面上传、预览、试听和下载。
              </p>
              <div className="project-actions">
                <ProjectLink href="https://fanmade.ourtaiko.org">
                  访问网站
                </ProjectLink>
              </div>
            </div>
            <dl className="fanmade-details">
              <div>
                <dt>前端</dt>
                <dd>谱面浏览、上传与作品管理。</dd>
                <ProjectLink
                  href="https://github.com/OurTaiko/Fanmade_Frontend"
                  secondary
                >
                  前端仓库
                </ProjectLink>
              </div>
              <div>
                <dt>后端</dt>
                <dd>文件校验与存储、账号接入和成绩接口。</dd>
                <ProjectLink
                  href="https://github.com/OurTaiko/Fanmade_Backend"
                  secondary
                >
                  后端仓库
                </ProjectLink>
              </div>
            </dl>
          </Card>

          <div className="project-grid">
            <Card className="project-card">
              <div className="project-icon" aria-hidden="true">
                <PlayIcon size={28} />
              </div>
              <h2>OurTaikoPlayer</h2>
              <p className="project-description">
                跨平台太鼓模拟器，支持 TJA 谱面、练习模式和双人演奏。
              </p>
              <p className="platforms">
                Windows · macOS · Linux · Android · iOS
              </p>
              <div className="project-actions">
                <ProjectLink href="https://github.com/OurTaiko/OurTaikoPlayer/releases">
                  下载
                </ProjectLink>
                <ProjectLink
                  href="https://github.com/OurTaiko/OurTaikoPlayer"
                  secondary
                >
                  源码
                </ProjectLink>
              </div>
            </Card>
            <Card className="project-card">
              <div className="project-icon" aria-hidden="true">
                <TrophyIcon size={28} />
              </div>
              <h2>
                HachiCats<span className="hachi-name">八猫杯</span>
              </h2>
              <p className="project-description">
                八猫杯赛事网站，提供选手信息、赛事对阵和比分查询。
              </p>
              <div className="project-actions mt-auto!">
                <ProjectLink href="https://hachicats.ourtaiko.org">
                  访问网站
                </ProjectLink>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <footer className="site-footer container">
        <p>© {new Date().getFullYear()} OurTaiko</p>
        <ProjectLink href="https://github.com/OurTaiko" secondary>
          GitHub
        </ProjectLink>
      </footer>
    </>
  );
}
