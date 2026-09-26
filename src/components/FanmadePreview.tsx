import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, MusicNotesIcon } from "@phosphor-icons/react";

const measures = [
  ["don", "ka", "don", "don", "ka"],
  ["ka", "don", "ka", "ka", "don"],
  ["don", "don", "ka", "don", "ka"],
];

export function FanmadePreview() {
  return (
    <div className="fanmade-visual">
      <div className="visual-toolbar">
        <div className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>Fanmade</span>
        <span aria-hidden="true">↗</span>
      </div>
      <Tabs defaultValue="frontend" className="gap-5 px-5 pt-5 pb-6 sm:px-7">
        <TabsList
          aria-label="Fanmade 产品组成"
          className="h-10! w-full rounded-xl"
        >
          <TabsTrigger value="frontend" className="rounded-lg">
            前端体验
          </TabsTrigger>
          <TabsTrigger value="backend" className="rounded-lg">
            后端服务
          </TabsTrigger>
        </TabsList>
        <TabsContent value="frontend" className="feature-panel">
          <div className="preview-title">
            <div className="preview-icon">
              <MusicNotesIcon size={28} aria-hidden="true" />
            </div>
            <div>
              <strong>让每个音符，各就各位。</strong>
              <span>TJA 谱面预览</span>
            </div>
          </div>
          <div className="chart-preview" aria-label="节奏谱面示意">
            {measures.map((notes, i) => (
              <div key={i} aria-hidden="true">
                <span>0{i + 1}</span>
                {notes.map((note, j) => (
                  <i key={j} className={note} />
                ))}
              </div>
            ))}
          </div>
          <div className="preview-footer">
            <span>预览与试听</span>
            <span>作品分享</span>
            <span>社区排行榜</span>
          </div>
        </TabsContent>
        <TabsContent value="backend" className="feature-panel">
          <div className="preview-title">
            <div className="preview-icon">
              <CodeIcon size={28} aria-hidden="true" />
            </div>
            <div>
              <strong>创作背后，可靠的连接。</strong>
              <span>Go + PostgreSQL</span>
            </div>
          </div>
          <div className="service-list">
            <div>
              <span>谱面与音频</span>
              <span>校验 · 存储 · 分发</span>
            </div>
            <div>
              <span>OurTaiko 账号</span>
              <span>统一身份 · 安全会话</span>
            </div>
            <div>
              <span>游戏成绩</span>
              <span>记录提交 · 排行榜</span>
            </div>
          </div>
          <div className="preview-footer">
            <span>开放 API</span>
            <span>前后端分离</span>
            <span>连接网站与玩家</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
