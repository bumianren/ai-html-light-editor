# AI-HTML Light Editor

一个本地打开即可使用的 AI 生成 HTML 微调工具。
它适合处理 AI 生成的海报、学习卡片、HTML 风格 PPT、培训项目汇报页、数据看板截图页。AI 先生成 80%-90%，你再用这个工具快速改错字、调字号、调颜色、切换页面状态、导出图片。

我平时特别喜欢用Html来实现PPT的功能，但是，PPT生成html有几个问题
1. 样式一般很好，但内容总是抓不住重点，差一点点就好了，有时候就需要自己动手，但普通人不懂那html代码
2. 有一些文案不好，颜色差一点意思，这时候用提示词去让AI修改，AI总是听不明白，改半天也改不对
3. 生成html要发给别人比较麻烦，就需要截图，但截图清晰度、截图的位置找不准
4. 利用Skill生成小红书等封面HTML，生成的样式没问题，但要变成图片还是略显麻烦。用这个能一键下载全部页面截图

因此，做了这么个微调工具，基本上能满足“我快速上手改一下”的需求，不用指挥半天AI，它又听不明白你干瞪眼还浪费token，我自己使用过程感觉能满足90%的场景需求。

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a00fb773-5c30-45af-b637-d0b30aac6029" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6e31103e-88bf-4333-8d32-4f5b48ddb9d3" />


## 本地使用

1. 打开并下载 dist 文件夹里的 `AI-HTML-Light-Editor.zip` 
3. 解压后，双击打开 `index.html`
4. 点击左上角的「打开 HTML」，选择 AI 生成的 `.html` 文件
5. 点页面里的文字直接修改
6. 选中文字块后，调整字号、行高、颜色、字重
7. 需要点击页面里的 Tab、按钮或链接时，点击「切到交互」，完成后再「切回编辑」
8. 点击「导出 HTML」保存修改版
9. 点击「保存当前图」或「保存全部图」导出 PNG

## 核心能力

- 本地打开，不需要安装软件
- 打开任意本地 HTML
- 自动识别 `.poster` 页面
- 点击可见文字直接编辑
- 支持按钮、链接、表格、标签、代码块、文件名列表等文本结构
- 编辑模式 / 页面交互模式切换，方便处理 Tab、按钮、链接等可点击页面
- 调整字号、行高、字体颜色、字重
- 常用色块一键改色，也支持输入 `#111111`、`rgb(...)`、`var(--accent)`
- 本地草稿保存
- 导出修改版 HTML
- 隐藏 / 显示编辑边框
- 按清晰度导出 PNG
- 批量导出全部页面 PNG

## 给 AI 生成 HTML 的 Skill 加上下面示词，出来的html适配度更高

为了让编辑器稳定识别页面，建议生成 HTML 时遵守：
- 每一页 / 每一张图 / 每一张卡片，用一个 `.poster` 容器包起来
- `.poster` 设置固定宽高，比如 `1080 × 1440`、`1920 × 1080`
- 每个 `.poster` 可以加 `data-export-name="page-01.png"` 作为导出文件名
- 样式尽量写在 HTML 内部，方便文件独立传给同事
- 图片尽量用相对路径、绝对路径或 base64，避免依赖远程资源
- 如果某个复杂模块需要强制整体编辑，可以在元素上加 `data-editable`

最小结构：

```html
<section class="poster" data-export-name="page-01.png">
  <h1 class="title">学习项目照样搞，AI 化交付在哪里？</h1>
  <p class="lead">这是一张可以被编辑器识别和修改的卡片。</p>
</section>
```

## 文件说明

- `index.html`：独立编辑器，直接打开使用
- `ai-html-editor.css`：可嵌入编辑器的公共样式
- `ai-html-editor.js`：可嵌入到单个 HTML 的编辑器脚本
- `html2canvas.min.js`：截图导出依赖
- `examples/learning-card-template.html`：AI 生成 HTML 示例

## 两种使用方式

### 方式一：独立编辑器

直接打开 `index.html`，再选择一个 HTML 文件。这是最适合同事使用的方式。

### 方式二：嵌入到单个 HTML

如果你希望某个 HTML 自带编辑能力，可以引入：

```html
<link rel="stylesheet" href="./ai-html-editor.css">
<script>
  window.AIHtmlEditorConfig = {
    posterSelector: ".poster",
    exportHtmlName: "编辑后.html",
    html2canvasPath: "./html2canvas.min.js"
  };
</script>
<script src="./ai-html-editor.js"></script>
```

## 注意

浏览器出于安全限制，编辑器无法直接覆盖原 HTML 文件。修改完成后请用「导出 HTML」得到一个新文件。

草稿只保存在当前浏览器里。换电脑、换浏览器或清理缓存后，草稿不会自动带过去。
