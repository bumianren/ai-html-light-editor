# AI-HTML Light Editor

一个本地打开即可使用的 AI 生成 HTML 微调工具。

它适合处理 AI 生成的海报、学习卡片、HTML 风格 PPT、培训项目汇报页、数据看板截图页。AI 先生成 80%-90%，你再用这个工具快速改错字、调字号、调颜色、切换页面状态、导出图片。

## 在线使用

如果仓库开启了 GitHub Pages，可以直接访问：

```text
https://<your-github-name>.github.io/ai-html-light-editor/
```

在线版适合快速体验。涉及本地图片、字体或相对资源时，推荐下载本地版。

## 本地使用

1. 下载 Release 里的 `AI-HTML-Light-Editor.zip`
2. 解压后双击打开 `index.html`
3. 点击「打开 HTML」，选择 AI 生成的 `.html` 文件
4. 点页面里的文字直接修改
5. 选中文字块后，调整字号、行高、颜色、字重
6. 需要点击页面里的 Tab、按钮或链接时，点击「切到交互」，完成后再「切回编辑」
7. 点击「导出 HTML」保存修改版
8. 点击「保存当前图」或「保存全部图」导出 PNG

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

## 给 AI 生成 HTML 的建议

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
