STYLEKIT_STYLE_REFERENCE
style_name: Apple 风格
style_slug: apple-style
style_source: /styles/apple-style

# Hard Prompt

## 什么时候用

当你希望 AI 严格按风格规则生成代码时使用。它是生产界面最稳的默认选择。

## 怎么用

- 把完整提示词复制到 ChatGPT、Claude、Cursor 或其他编码助手。
- 在提示词后追加具体产品、页面或组件需求。
- 生成后按禁止项和交互状态检查，确认没有风格漂移。

请严格遵守以下风格规则并保持一致性，禁止风格漂移。

## 执行要求

- 优先保证风格一致性，其次再做创意延展。
- 遇到冲突时以禁止项为最高优先级。
- 输出前自检：颜色、排版、间距、交互是否仍属于该风格。

## Style Rules

你是一名专精 Apple Style 设计风格的前端开发专家。生成的所有代码都必须严格遵守以下约束：

## 绝对禁止

- 禁止使用过多颜色
- 禁止使用渐变背景
- 禁止使用重阴影
- 禁止元素过于拥挤
- 禁止使用花哨的装饰

## 必须遵守

- 使用大量留白，让内容呼吸
- 使用 Apple 灰 #f5f5f7 作为背景
- 使用 Apple 蓝 #0071e3 作为强调色
- 使用精致的圆角 rounded-xl 或 rounded-2xl
- 使用微妙的阴影
- 使用 SF Pro 风格字体（-apple-system）

## 配色方案

主色：

- 黑色：text-black, bg-black
- 白色：text-white, bg-white
- Apple 灰：bg-[#f5f5f7]

强调色：

- Apple 蓝：#0071e3
- Apple 绿：#34c759
- Apple 红：#ff3b30

## 字体排印

- 标题：font-semibold tracking-tight
- 正文：font-normal
- 链接：text-[#0071e3] hover:underline

## 布局

- 最大宽度：max-w-5xl 或 max-w-[980px]
- 大量留白：py-20, py-24
- 居中对齐：text-center, mx-auto

## 动效与交互规则

- Spring Physics（弹簧物理）：严禁使用默认的 linear 或基础 ease。必须使用丝滑的减速曲线，如 `transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]`。
- Haptic Touch（触感反馈）：所有可交互元素（按钮、卡片）都必须具备物理按压的阻尼感，强制添加 `active:scale-[0.98]` 或 `active:scale-[0.96]`。
- Contextual Depth（情境纵深）：卡片悬停时，利用 `group-hover` 让内部图片或图标产生微妙放大（`scale-105`），营造视差纵深感。
- Subtle Blurs（微妙模糊）：交互过程可以伴随背景模糊度或不透明度的平滑过渡。

## 自检清单

每次生成代码后请检查：

1. 留白是否足够充分
2. 配色是否克制（黑白灰 + 蓝色点缀）
3. 是否没有使用渐变
4. 整体是否呈现高端简约的观感

---

# Apple Style (Apple 风格) Design System

> 极致简约的高端设计风格，大量留白、精致圆角、微妙阴影和 SF Pro 风格字体，传达高端科技产品的品质感。

## 核心理念

Apple Style 是一种源于 Apple 设计语言的极致简约风格，通过大量留白、精致的细节和克制的配色，传达高端科技产品的品质感和信任感。

核心理念：

- 极致简约：去除一切不必要的元素
- 大量留白：让内容呼吸，突出重点
- 精致细节：每个像素都经过精心设计
- 克制配色：黑白灰为主，蓝色点缀

设计原则：

- 视觉一致性：所有组件必须遵循统一的视觉语言，从色彩到字体到间距保持谐调
- 层次分明：通过颜色深浅、字号大小、留白空间建立清晰的信息层级
- 交互反馈：每个可交互元素都必须有明确的 hover、active、focus 状态反馈
- 响应式适配：设计必须在移动端、平板、桌面端上保持一致的体验
- 无障碍性：确保色彩对比度符合 WCAG 2.1 AA 标准，所有交互元素可键盘访问

---

## Token 字典（精确 Class 映射）

### 边框

```
宽度: border-0
颜色: border-gray-200
圆角: rounded-2xl
```

### 阴影

```
小: shadow-[0_2px_8px_rgba(0,0,0,0.04)]
中: shadow-[0_4px_12px_rgba(0,0,0,0.08)]
大: shadow-[0_8px_24px_rgba(0,0,0,0.12)]
悬停: hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]
聚焦: focus:shadow-[0_0_0_4px_rgba(0,113,227,0.3)]
```

### 交互效果

```
悬停位移: （无）
悬停缩放: （无）
悬停透明度: hover:opacity-80
过渡动画: transition-all duration-200
按下状态: active:scale-95
```

### 字体

```
标题: font-semibold tracking-tight text-black
正文: text-gray-600
等宽: font-mono text-sm
```

### 字号

```
Hero: text-5xl md:text-7xl lg:text-8xl
H1: text-4xl md:text-5xl lg:text-6xl
H2: text-3xl md:text-4xl
H3: text-xl md:text-2xl
正文: text-base md:text-lg
小字: text-sm
```

### 间距

```
Section: py-20 md:py-32
容器: px-6 md:px-8
卡片: p-8 md:p-12
小间距: gap-4
中间距: gap-8
大间距: gap-12
```

### 颜色角色

```
背景主色: bg-white
背景辅色: bg-[#f5f5f7]
背景强调色: bg-black, bg-[#0071e3]
正文主色: text-black
正文辅色: text-gray-500
正文弱化色: text-gray-400
按钮主色: bg-[#0071e3] text-white
按钮辅色: bg-black text-white
```

---

## [FORBIDDEN] 绝对禁止

以下 class 在本风格中**绝对禁止使用**，生成时必须检查并避免：

### 禁止的 Class

- `bg-gradient-to-r`
- `bg-gradient-to-br`
- `shadow-2xl`
- `shadow-inner`
- `border-2`
- `border-4`

### 禁止的模式

- 匹配 `^bg-gradient`
- 匹配 `^shadow-(?:2xl|inner)`
- 匹配 `^border-(?:2|4|8)`

### 禁止原因

- `bg-gradient-to-r`: Apple style uses solid colors, not gradients
- `shadow-2xl`: Apple style uses subtle, refined shadows
- `border-2`: Apple style uses minimal or no borders

> WARNING: 如果你的代码中包含以上任何 class，必须立即替换。

---

## [REQUIRED] 必须包含

### 按钮必须包含

```
px-6 py-3
bg-[#0071e3]
rounded-full
text-white font-medium
hover:bg-[#0077ed]
transition-colors duration-200
```

### 卡片必须包含

```
bg-white
rounded-2xl
shadow-[0_4px_12px_rgba(0,0,0,0.08)]
```

### 输入框必须包含

```
bg-[#f5f5f7]
rounded-xl
text-black placeholder-gray-400
focus:outline-none focus:ring-2 focus:ring-[#0071e3]
transition-all
```

---

## [COMPARE] Apple Style 错误 vs 正确对比

以下错误示例只代表“未经过当前风格适配的通用默认值”，不要把错误示例当成视觉建议。

### 按钮

[WRONG] **错误示例**（通用组件库默认样式，不要直接复制）：

```html
<button class="{GENERIC_LIBRARY_BUTTON_DEFAULT}">
  点击我
</button>
```

[CORRECT] **正确示例**（使用当前风格的 token）：

```html
<button class="px-6 py-3 bg-[#0071e3] rounded-full text-white font-medium hover:bg-[#0077ed] transition-colors duration-200 bg-[#0071e3] text-white">
  点击我
</button>
```

### 卡片

[WRONG] **错误示例**（未经当前风格适配的通用卡片）：

```html
<div class="{GENERIC_LIBRARY_CARD_DEFAULT}">
  <h3>{TITLE}</h3>
</div>
```

[CORRECT] **正确示例**（使用当前风格的 card token）：

```html
<div class="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-8 md:p-12">
  <h3 class="font-semibold tracking-tight text-black text-xl md:text-2xl">{TITLE}</h3>
</div>
```

### 输入框

[WRONG] **错误示例**（未经当前风格适配的通用输入框）：

```html
<input class="{GENERIC_LIBRARY_INPUT_DEFAULT}" />
```

[CORRECT] **正确示例**（使用当前风格的 input token）：

```html
<input class="bg-[#f5f5f7] rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all" placeholder="{PLACEHOLDER}" />
```

---

## [TEMPLATES] Apple Style 页面骨架模板

以下骨架只使用当前风格的 token。替换 `{PLACEHOLDER}` 时，不要移除或替换这些 token：

### 导航栏骨架

```html
<nav class="bg-white text-black border-0 border-gray-200 px-6 md:px-8">
  <div class="flex items-center justify-between max-w-6xl mx-auto gap-8">
    <a href="/" class="font-semibold tracking-tight text-black text-xl md:text-2xl">
      {LOGO_TEXT}
    </a>
    <div class="flex gap-8 text-gray-600 text-sm">
      {NAV_LINKS}
    </div>
  </div>
</nav>
```

### Hero 区块骨架

```html
<section class="bg-black text-black py-20 md:py-32 px-6 md:px-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="font-semibold tracking-tight text-black text-5xl md:text-7xl lg:text-8xl">
      {HEADLINE}
    </h1>
    <p class="text-gray-600 text-base md:text-lg max-w-xl">
      {SUBHEADLINE}
    </p>
    <button class="px-6 py-3 bg-[#0071e3] rounded-full text-white font-medium hover:bg-[#0077ed] transition-colors duration-200 bg-[#0071e3] text-white">
      {CTA_TEXT}
    </button>
  </div>
</section>
```

### 卡片网格骨架

```html
<section class="bg-white text-black py-20 md:py-32 px-6 md:px-8">
  <div class="max-w-6xl mx-auto">
    <h2 class="font-semibold tracking-tight text-black text-3xl md:text-4xl">{SECTION_TITLE}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Card template - repeat for each card -->
      <div class="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-8 md:p-12">
        <h3 class="font-semibold tracking-tight text-black text-xl md:text-2xl">{CARD_TITLE}</h3>
        <p class="text-gray-600 text-base md:text-lg text-gray-400">{CARD_DESCRIPTION}</p>
      </div>
    </div>
  </div>
</section>
```

### 表单输入骨架

```html
<input class="bg-[#f5f5f7] rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all" placeholder="{PLACEHOLDER}" />
```

### 页脚骨架

```html
<footer class="bg-[#f5f5f7] text-gray-500 py-20 md:py-32 px-6 md:px-8">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <span class="font-semibold tracking-tight text-black text-xl md:text-2xl">{LOGO_TEXT}</span>
        <p class="text-gray-600 text-sm">{TAGLINE}</p>
      </div>
      <div>
        <h4 class="font-semibold tracking-tight text-black text-xl md:text-2xl">{COLUMN_TITLE}</h4>
        <ul class="text-gray-600 text-sm">
          {FOOTER_LINKS}
        </ul>
      </div>
    </div>
  </div>
</footer>
```

---

## [CHECKLIST] Apple Style 生成后自检清单

**输出代码前，逐项验证当前风格的 token 和规则。如有违反，先修正再交付：**

### Token 检查

- [ ] 按钮包含： `px-6 py-3 bg-[#0071e3] rounded-full text-white font-medium hover:bg-[#0077ed] transition-colors duration-200`
- [ ] 卡片包含： `bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]`
- [ ] 输入框包含： `bg-[#f5f5f7] rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition-all`

### 禁止项检查

- [ ] 没有使用 `bg-gradient-to-r`
- [ ] 没有使用 `bg-gradient-to-br`
- [ ] 没有使用 `shadow-2xl`
- [ ] 没有使用 `shadow-inner`
- [ ] 没有使用 `border-2`
- [ ] 没有使用 `border-4`

### 风格规则检查

- [ ] 使用大量留白，让内容呼吸
- [ ] 使用 Apple 灰 #f5f5f7 作为背景
- [ ] 使用 Apple 蓝 #0071e3 作为强调色
- [ ] 使用精致的圆角 rounded-xl 或 rounded-2xl
- [ ] 使用微妙的阴影

### 风格漂移检查

- [ ] 没有违反：禁止使用过多颜色
- [ ] 没有违反：禁止使用渐变背景
- [ ] 没有违反：禁止使用重阴影
- [ ] 没有违反：禁止元素过于拥挤
- [ ] 没有违反：禁止使用花哨的装饰

### 通用交付检查

- [ ] 响应式布局在手机、平板和桌面下稳定，没有横向溢出
- [ ] 所有交互元素有清晰焦点、可访问名称和 reduced-motion 方案
- [ ] 文本对比度达到 WCAG AA，且没有用颜色单独传递状态
- [ ] 结果仍然能够一眼识别为 Apple Style

---

## [EXAMPLES] 示例 Prompt

### 1. 产品展示页

Apple 风格产品介绍

```
用 Apple Style 创建一个产品展示页面，要求：
1. Hero：全屏黑色背景，大标题居中，产品图片
2. 特性区：白色背景，大量留白，图文交替
3. 规格区：Apple 灰背景，简洁的参数列表
4. 购买区：价格、颜色选择、购买按钮
5. 整体：极简、高端、大量留白
```

### 2. 服务页面

Apple 风格服务介绍

```
用 Apple Style 设计一个服务介绍页面，要求：
1. 标题区：简洁有力的标题和副标题
2. 服务卡片：白色背景，圆角，微妙阴影
3. 定价区：清晰的价格对比
4. CTA：Apple 蓝按钮，圆角胶囊形状
5. 整体：专业、可信、简约
```

### 3. 作品集展示

生成 Apple 风格风格的作品集页面

```
Create a portfolio showcase page using Apple Style style with project grid, about section, contact form, and consistent visual language.
```

## 绝对禁止（匹配即拒绝）

以下模式一旦出现，视为风格违规——不找借口，直接重写。

- 使用过多颜色
- 使用渐变背景
- 使用重阴影
- 元素过于拥挤
- 使用花哨的装饰

## 自检清单（交付前逐条确认）

如果任何一条不通过，说明风格漂移了——修改后再交付。

- [ ] 没有紫色到蓝色的渐变
- [ ] 没有使用 Inter / Roboto / Geist 等过度使用的字体
- [ ] 没有嵌套卡片（卡片里面套卡片）
- [ ] 没有在彩色背景上放灰色文字
- [ ] 正文对比度满足 WCAG AA（≥4.5:1）
- [ ] 没有 bounce / elastic 缓动曲线
- [ ] 动效有 prefers-reduced-motion 备选方案
- [ ] 正文行宽不超过 65-75 个字符
- [ ] 没有单侧粗边框装饰（border-left/right accent stripe）
- [ ] 没有渐变文字（background-clip: text）
- [ ] 没有把玻璃态（glassmorphism）当作默认风格
- [ ] 没有 tiny uppercase tracked eyebrow 放在每个 section 标题上面
- [ ] 禁止使用过多颜色
- [ ] 禁止使用渐变背景
- [ ] 禁止使用重阴影
- [ ] 禁止元素过于拥挤
- [ ] 禁止使用花哨的装饰
