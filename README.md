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

- **OurTaiko Fanmade**：谱面平台入口；通过 shadcn Tabs 切换前端与后端介绍；分别提供两端的源码入口。
- **OurTaikoPlayer**：功能介绍、GitHub Releases 下载与源码入口。
- **HachiCats 八猫杯**：赛事网站入口与对阵示意。示意不代表实际赛事或比分。
- **关于我们**：社区理念、GitHub 和账号中心入口。
- **节奏互动**：点击咚／咔按钮或按 D/F、J/K；Web Audio 在用户操作后合成音效，支持静音。快捷键仅在鼓面可见时生效，不拦截输入框、弹窗或组合键。
- **手机导航**：shadcn Sheet，支持焦点管理、Escape 关闭与锚点跳转。

## 代码位置

| 文件 | 用途 |
| --- | --- |
| `src/App.tsx` | 首页文案、产品与页脚 |
| `src/components/Header.tsx` | 桌面及手机导航 |
| `src/components/Rhythm.tsx` | 节奏互动、音频与键盘操作 |
| `src/components/FanmadePreview.tsx` | Fanmade 前后端切换展示 |
| `src/components/ui/` | shadcn/ui 组件源码 |
| `src/styles.css` | Tailwind 主题、组件样式、响应式与减弱动态效果 |
| `index.html` | SEO、canonical、Open Graph 与 favicon 引用 |
| `public/` | 原始静态图标、robots、sitemap 与 manifest |

favicon、Apple touch icon 和各尺寸 PNG **直接复制自 Fanmade 前端的 `public/`，未重新绘制**。全部资源保存在本项目中，部署时不依赖相邻目录或外部字体/CDN。更新品牌图标时，将 Fanmade 生成的新文件同步到这里。

## 静态部署

1. 执行 `pnpm install --frozen-lockfile && pnpm build`。
2. 将 `dist/` 的内容发布到站点根目录，或将静态托管服务的输出目录设置为 `dist`。
3. 在托管平台绑定 `www.ourtaiko.org` 与 `ourtaiko.org`，为两个域名配置 DNS 与 HTTPS。
4. 默认以 `https://www.ourtaiko.org/` 为 canonical。建议将裸域名重定向到 www，保留原始路径与查询参数；若选择裸域名为主域名，同步修改 `index.html`、`public/robots.txt` 和 `public/sitemap.xml`。
5. `index.html` 应允许重新验证；Vite 生成的带哈希 JS/CSS 可以长期缓存。图标文件名固定，更新时不要配置永久缓存。

本项目只有 `/` 页面，产品与关于区块使用锚点导航，不需要 API 代理或 SPA 路由回退。生产服务器只提供构建产物，不要把源码目录作为公开根目录。`pnpm preview` 仅用于本地检查。

## Vercel

源码仓库为私有的 [OurTaiko/OurTaiko](https://github.com/OurTaiko/OurTaiko)。
Vercel 使用 `vercel.json` 中的 Vite 配置，固定 pnpm 12.3.4，输出目录为 `dist`。
在 Vercel 关联此仓库后，生产分支使用 `main`；分支部署用于预览。

Vercel 的默认域名可用于查看效果。`ourtaiko.org` 与 `www.ourtaiko.org` 的自定义域名绑定和 DNS 切换需单独进行；HTML 中的 canonical 不会配置 DNS。

## 已验证

- TypeScript 检查与 Vite 生产构建。
- Chrome 下 320、390、768、1024、1440px 布局无横向溢出。
- Fanmade 点击／方向键切换、鼓音点击／快捷键／静音。
- 手机菜单开关、Escape、焦点返回及锚点导航。
- 减弱动态效果、200% 文本缩放、图标与图片加载。
- 无浏览器运行错误；外链具备 `noopener noreferrer`。

音效、动画与交互使用浏览器能力；未在所有真实移动设备上验证。页面不请求产品业务接口，也不读取或保存用户账号信息。
