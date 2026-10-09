# OurTaiko 组织官网

服务于 `https://www.ourtaiko.org/` 与 `https://ourtaiko.org/` 的静态网站。React 19、TypeScript、Vite 与 Tailwind CSS 4；视觉沿用 OurTaikoPlay 官网的太鼓风格，规范见 `UIDESIGN.md`。

## 本地运行

使用 Node.js 22.12+、pnpm 12.3.4（生产构建使用 Node.js 24）：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

开发和预览均使用 `http://127.0.0.1:5196`，不要同时运行。输出目录为 `dist/`；网站无业务 API、数据库或服务端环境变量。语言测试需要 Node.js 22.18+，推荐与生产一致使用 Node.js 24。

## 产品与入口

| 产品                | 入口                                                              |
| ------------------- | ----------------------------------------------------------------- |
| OurTaikoPlay        | https://play.ourtaiko.org/                                        |
| OurTaikoView_Web    | 在 https://fanmade.ourtaiko.org/ 的谱面页面体验；另有公开源码入口 |
| OurTaikoFanmade     | https://fanmade.ourtaiko.org/                                     |
| OurTaikoTournaments | https://tournaments.ourtaiko.org/                                 |

产品顺序和名称在首页、首屏快捷入口以及禁用 JavaScript 时的备用内容中保持一致。产品卡片插图为装饰，不是实际游戏截图。

## 国际化与交互

支持简体中文、英语、日语、韩语。优先读取用户保存的选择，否则按 `navigator.languages` 顺序匹配；中文地区变体统一为简体，不支持的语言回退英语。语言选择仅保存在本站的 `ourtaiko.home.language` 中，跟随浏览器时移除覆盖；禁用存储不影响当前页切换。页面标题、描述和文档语言同步更新。

顶栏语言按钮支持方向键、Home、End、Escape，选择后返回焦点；手机导航与语言菜单互斥。支持键盘焦点、跳转主内容及减弱动态效果。静态 fallback 位于 `index.html`。

## 文件

- `src/App.tsx`：首页、产品资料、装饰插图与素材致谢。
- `src/components/Header.tsx`：桌面导航、手机导航和语言菜单。
- `src/i18n.tsx`、`src/language.ts`、`src/locales/`：翻译与语言检测。
- `src/styles.css`：风格、布局、响应式和交互状态。
- `tests/language.test.ts`：语言匹配、选择持久化、受限存储、文案完整性。
- `public/assets/donder/`、`NOTICE`：从 Play 官网同步的原始素材及来源记录。

favicon 与品牌图标沿用已有 OurTaiko 图标，素材本地托管，不依赖外部字体 CDN。

## 发布

源码仓库：[OurTaiko/OurTaiko](https://github.com/OurTaiko/OurTaiko)，当前为公开仓库。已有 Vercel 项目为 `vanillaaaa/ourtaiko`，本地 `.vercel/project.json` 指向该项目。保留当前 `vercel.json` 中的 pnpm 版本、构建命令和 `dist` 输出配置。

先运行测试与构建，提交并推送本次变更。若由 CLI 发布，在已登录 Vercel 的环境中使用：

```sh
npx vercel@59.26.0 deploy --prod --skip-domain --yes --scope vanillaaaa
# 验证返回的部署地址后，发布该构建：
npx vercel@59.26.0 promote <deployment-url> --yes --scope vanillaaaa
```

检查部署 Ready，并在正式域名核对版本和四个产品入口。主域名 canonical 仍为 `https://www.ourtaiko.org/`。无需改动 DNS 或域名绑定。`.vercel/`、`.env*`、依赖与构建目录不提交。
