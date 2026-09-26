# OurTaiko 组织首页

用于 `www.ourtaiko.org` 与 `ourtaiko.org` 的纯前端首页。采用 React 19、TypeScript、Vite、Tailwind CSS 4 和 shadcn/ui（Base UI / base-luma），遵循 `UIDESIGN.md` 的 Apple 风格。

## 本地运行

Node.js 22.12+，pnpm 12.3.4：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开 <http://127.0.0.1:5196>。

```sh
pnpm typecheck
pnpm build
pnpm preview
```

`dev` 与 `preview` 默认使用同一个端口，切换前先关闭已有服务。构建产物在 `dist/`，无需 Node.js 生产服务、数据库、API 密钥或环境变量。

## 页面内容

- **OurTaiko Fanmade**：谱面平台简介、网站及前后端仓库入口。
- **OurTaikoPlayer**：模拟器简介、支持平台、下载及源码入口。
- **HachiCats 八猫杯**：赛事网站简介与入口。
- **手机导航**：shadcn Sheet，支持焦点管理、Escape 关闭与项目锚点跳转。

## 代码位置

| 文件                        | 用途                                          |
| --------------------------- | --------------------------------------------- |
| `src/App.tsx`               | 首页文案、产品与页脚                          |
| `src/components/Header.tsx` | 桌面及手机导航                                |
| `src/components/ui/`        | shadcn/ui 组件源码                            |
| `src/styles.css`            | Tailwind 主题、组件样式、响应式与减弱动态效果 |
| `index.html`                | SEO、canonical、Open Graph 与 favicon 引用    |
| `public/`                   | 原始静态图标、robots、sitemap 与 manifest     |

favicon、Apple touch icon 和各尺寸 PNG **直接复制自 Fanmade 前端的 `public/`，未重新绘制**。全部资源保存在本项目中，部署时不依赖相邻目录或外部字体/CDN。更新品牌图标时，将 Fanmade 生成的新文件同步到这里。

## 静态部署

1. 执行 `pnpm install --frozen-lockfile && pnpm build`。
2. 将 `dist/` 的内容发布到站点根目录，或将静态托管服务的输出目录设置为 `dist`。
3. 在托管平台绑定 `www.ourtaiko.org` 与 `ourtaiko.org`，为两个域名配置 DNS 与 HTTPS。
4. 默认以 `https://www.ourtaiko.org/` 为 canonical。建议将裸域名重定向到 www，保留原始路径与查询参数；若选择裸域名为主域名，同步修改 `index.html`、`public/robots.txt` 和 `public/sitemap.xml`。
5. `index.html` 应允许重新验证；Vite 生成的带哈希 JS/CSS 可以长期缓存。图标文件名固定，更新时不要配置永久缓存。

本项目只有 `/` 页面，项目区块使用锚点导航，不需要 API 代理或 SPA 路由回退。生产服务器只提供构建产物，不要把源码目录作为公开根目录。`pnpm preview` 仅用于本地检查。

## Vercel

源码仓库为私有的 [OurTaiko/OurTaiko](https://github.com/OurTaiko/OurTaiko)。
Vercel 使用 `vercel.json` 中的 Vite 配置，固定 pnpm 12.3.4，输出目录为 `dist`。
Vercel 项目为 `vanillaaaa/ourtaiko`。当前 Hobby 套餐不支持连接组织名下的私有 GitHub 仓库，因此使用 CLI 直接部署，GitHub `main` 推送暂不自动触发部署。仓库保持私有。

在已经登录 Vercel 的环境中：

```sh
npx vercel@59.26.0 link --yes --project ourtaiko --scope vanillaaaa
npx vercel@59.26.0 deploy --prod --yes --scope vanillaaaa
```

发布前先完成 `pnpm build`，提交并推送 `main`，再运行上述部署命令。
部署后确认状态为 Ready 并验证返回的 Production URL。
`.vercel/`、`.env*` 及本地依赖均已排除在 Git 提交和部署上传之外。

Vercel 的默认域名可用于查看效果。`ourtaiko.org` 与 `www.ourtaiko.org` 的自定义域名绑定和 DNS 切换需单独进行；HTML 中的 canonical 不会配置 DNS。

## 已验证

- TypeScript 检查与 Vite 生产构建。
- Chrome 下 320、390、768、1024、1440px 布局无横向溢出。
- 手机菜单开关、Escape、焦点返回及锚点导航。
- 减弱动态效果、200% 文本缩放、图标与图片加载。
- 无浏览器运行错误；外链具备 `noopener noreferrer`。

未在所有真实移动设备上验证。页面不请求产品业务接口，也不读取或保存用户账号信息。
