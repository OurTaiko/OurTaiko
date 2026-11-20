# OurTaiko 组织官网

服务于 `https://www.ourtaiko.org/` 与 `https://ourtaiko.org/` 的静态网站：首页与三个产品页 `/play`、`/net`、`/edit`。React 19、TypeScript 与 Vite（多页面），样式是普通 CSS；视觉沿用 RhythmHub 官网的苹果风格，规范见 `UIDESIGN.md`。

## 本地运行

使用 Node.js 22.12+、pnpm 12.3.4（生产构建使用 Node.js 24）：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

开发和预览均使用 `http://127.0.0.1:5196`，不要同时运行；`/play`、`/net`、`/edit` 在两者中都由 `vite.config.ts` 的中间件指到各自的 `index.html`，生产环境由 `vercel.json` 的 rewrites 做同样的事。输出目录为 `dist/`；网站无业务 API、数据库或服务端环境变量。语言测试需要 Node.js 22.18+，推荐与生产一致使用 Node.js 24。

## 页面与产品

| 页面    | 内容                                                                                                                    | 产品入口                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/`     | 三个产品的大卡片，TJAParser、OurTaikoView_Web、otanim 三个开源项目，社区链接                                            | —                                                                            |
| `/play` | 由 `OurTaiko/OurTaikoPlay_Website` 移入：功能、按键、下载（正式版、Nightly、TestFlight、RhythmHub）、上手指南、社区、友链 | GitHub Releases `latest` 与 `nightly`、iOS TestFlight                        |
| `/net`  | 功能、三个分区（`/fanmade`、`/official`、`/players`）、与游戏的联系、旧域名跳转说明                                     | https://net.ourtaiko.org/                                                    |
| `/edit` | 界面截图、功能、截图展示、下载（正式版、Nightly、RhythmHub）与首次打开说明                                              | GitHub Releases `latest` 与 `nightly`                                        |

下载按钮指向 GitHub 发布页而不是安装包直链（文件名带构建号，会变）。Windows 与 macOS 的下载卡片会把访客当前系统排在前面。功能描述以各产品仓库的 README 为准。

## 国际化与交互

支持简体中文、英语、日语、韩语。优先读取用户保存的选择，否则按 `navigator.languages` 顺序匹配；中文地区变体统一为简体，不支持的语言回退英语。四个页面共用 `ourtaiko.home.language` 这一个选择，跟随浏览器时移除覆盖；禁用存储不影响当前页切换。页面标题、描述和文档语言同步更新。

右下角悬浮语言球展开五个选项（四种语言与跟随浏览器），支持方向键、Home、End、Escape 与点外部关闭，选择后焦点回到语言球；页脚也有语言按钮。支持键盘焦点、跳转主内容及减弱动态效果。每页的禁用 JavaScript 备用内容在各自的 `index.html`。

## 文件

- `index.html`、`play/index.html`、`net/index.html`、`edit/index.html`：各页的 meta、canonical 与备用内容。
- `src/pages/`：每页一个入口（`home.tsx`、`play.tsx`、`net.tsx`、`edit.tsx`），各自调用 `src/main.tsx` 的 `mount`。
- `src/components/Shell.tsx`：全局导航、产品页导航、语言球、页脚；`src/components/Art.tsx`：图标、装饰图、卡片。
- `src/i18n.tsx`、`src/language.ts`：翻译与语言检测；`src/locales/<页面>/<语言>.json`，`common` 是各页共用的文案。
- `src/styles.css`：全部样式。
- `tests/language.test.ts`：语言匹配、选择持久化、受限存储、各页四语文案完整性。
- `public/images/`：产品图标与 OurTaikoEdit 截图，来源见 `NOTICE`。

## 发布

源码仓库：[OurTaiko/OurTaiko](https://github.com/OurTaiko/OurTaiko)，当前为公开仓库。已有 Vercel 项目为 `vanillaaaa/ourtaiko`，本地 `.vercel/project.json` 指向该项目。保留当前 `vercel.json` 中的 pnpm 版本、构建命令和 `dist` 输出配置。

先运行测试与构建，提交并推送本次变更。若由 CLI 发布，在已登录 Vercel 的环境中使用：

```sh
npx vercel@59.26.0 deploy --prod --skip-domain --yes --scope vanillaaaa
# 验证返回的部署地址后，发布该构建：
npx vercel@59.26.0 promote <deployment-url> --yes --scope vanillaaaa
```

检查部署 Ready，并在正式域名核对首页与 `/play`、`/net`、`/edit` 三个产品页。主域名 canonical 仍为 `https://www.ourtaiko.org/`。无需改动 DNS 或域名绑定。`.vercel/`、`.env*`、依赖与构建目录不提交。
