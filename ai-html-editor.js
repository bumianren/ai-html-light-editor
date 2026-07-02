(function () {
  const defaults = {
    version: "v1",
    storageId: location.pathname,
    posterSelector: ".poster",
    editableSelector: [
      ".kicker",
      ".eyebrow",
      ".title",
      ".title-xl",
      ".title-xxl",
      ".lead",
      ".body",
      ".page-no",
      ".bottom-note > div",
      ".risk-row .txt",
      ".question .qtext",
      ".eq-item strong",
      ".flow-step .copy",
      ".split .box h3",
      ".split .box p",
      ".course-name",
      ".course-sub"
    ].join(","),
    exportHtmlName: "配图-修改版.html",
    screenshotScale: 2,
    html2canvasPath: "../_共用工具/AI-HTML轻量编辑器/html2canvas.min.js"
  };

  const config = Object.assign({}, defaults, window.AIHtmlEditorConfig || {});
  const storageKey = `ai-html-editor:${config.storageId}`;
  let posters = [];
  let selectedNode = null;
  let sourceSignature = "";
  let fontSizeInput;
  let lineHeightInput;
  let fontWeightInput;
  let textColorInput;
  let textColorValue;
  let clearTextColorButton;
  let colorSwatchButtons = [];
  let statusNode;
  let hideGuidesButton;
  let toggleEditModeButton;
  let editMode = true;
  const skippedEditableTags = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "META", "LINK", "TITLE", "HEAD",
    "HTML", "BODY", "SVG", "PATH", "IMG", "PICTURE", "VIDEO", "AUDIO", "CANVAS",
    "IFRAME", "INPUT", "TEXTAREA", "SELECT", "OPTION", "BR", "HR"
  ]);
  const preferredTextContainers = new Set([
    "A", "BUTTON", "LABEL", "SUMMARY", "TD", "TH", "CAPTION", "FIGCAPTION",
    "P", "LI", "DT", "DD", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE",
    "PRE", "CODE", "SPAN", "STRONG", "EM", "B", "I", "SMALL"
  ]);

  function setStatus(text) {
    if (statusNode) statusNode.textContent = text;
  }

  function hashString(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
    }
    return String(hash);
  }

  function buildToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "ai-html-editor-toolbar";
    toolbar.setAttribute("data-ai-editor", "true");
    toolbar.innerHTML = `
      <label>字号 <input id="aiEditorFontSize" type="number" min="12" max="220" step="1"></label>
      <label>行高 <input id="aiEditorLineHeight" type="number" min="0.8" max="2.4" step="0.02"></label>
      <label>颜色 <input id="aiEditorTextColor" type="color" value="#14161a"></label>
      <input class="color-value" id="aiEditorTextColorValue" type="text" placeholder="#14161a">
      <span class="color-swatches" aria-label="常用颜色">
        <button class="color-swatch" type="button" data-color="#14161a" style="background:#14161a" title="黑色"></button>
        <button class="color-swatch" type="button" data-color="#ffffff" style="background:#ffffff" title="白色"></button>
        <button class="color-swatch" type="button" data-color="#70736f" style="background:#70736f" title="灰色"></button>
        <button class="color-swatch" type="button" data-color="#d84f2a" style="background:#d84f2a" title="强调色"></button>
        <button class="color-swatch" type="button" data-color="#0057ff" style="background:#0057ff" title="蓝色"></button>
        <button class="color-swatch" type="button" data-color="#16a34a" style="background:#16a34a" title="绿色"></button>
        <button class="color-swatch" type="button" data-color="#f5c400" style="background:#f5c400" title="黄色"></button>
      </span>
      <button id="aiEditorClearTextColor" type="button">还原颜色</button>
      <label>字重
        <select id="aiEditorFontWeight">
          <option value="">默认</option>
          <option value="300">300</option>
          <option value="400">400</option>
          <option value="500">500</option>
          <option value="600">600</option>
          <option value="700">700</option>
          <option value="760">760</option>
          <option value="800">800</option>
          <option value="900">900</option>
        </select>
      </label>
      <div class="ai-html-editor-status" id="aiEditorStatus">点文字即可编辑。选中文字块后，可以调字号、行高和字重。</div>
      <button id="aiEditorSaveDraft" type="button">保存草稿</button>
      <button id="aiEditorResetDraft" type="button">重置草稿</button>
      <button id="aiEditorExportHtml" type="button">导出 HTML</button>
      <button id="aiEditorToggleEditMode" type="button">切到交互</button>
      <button id="aiEditorToggleGuides" type="button">隐藏边框</button>
      <button class="primary" id="aiEditorSaveAllPng" type="button">保存全部截图</button>
    `;
    document.body.prepend(toolbar);

    fontSizeInput = document.getElementById("aiEditorFontSize");
    lineHeightInput = document.getElementById("aiEditorLineHeight");
    fontWeightInput = document.getElementById("aiEditorFontWeight");
    textColorInput = document.getElementById("aiEditorTextColor");
    textColorValue = document.getElementById("aiEditorTextColorValue");
    clearTextColorButton = document.getElementById("aiEditorClearTextColor");
    colorSwatchButtons = Array.from(document.querySelectorAll(".color-swatch"));
    statusNode = document.getElementById("aiEditorStatus");
    hideGuidesButton = document.getElementById("aiEditorToggleGuides");
    toggleEditModeButton = document.getElementById("aiEditorToggleEditMode");
  }

  function colorToHex(color) {
    if (!color) return "#000000";
    const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      if (hex[1].length === 3) {
        return `#${hex[1].split("").map((char) => char + char).join("")}`.toLowerCase();
      }
      return color.trim().toLowerCase();
    }
    const rgb = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (!rgb) return "#000000";
    return `#${[rgb[1], rgb[2], rgb[3]].map((value) => {
      return Math.max(0, Math.min(255, Number(value))).toString(16).padStart(2, "0");
    }).join("")}`;
  }

  function isValidCssColor(value) {
    const color = value.trim();
    if (!color) return false;
    return window.CSS?.supports?.("color", color) ?? true;
  }

  function hasUsefulText(node) {
    return Boolean(node.textContent && node.textContent.replace(/\s+/g, "").length);
  }

  function hasDirectText(node) {
    return Array.from(node.childNodes).some((child) => {
      return child.nodeType === Node.TEXT_NODE && child.textContent.replace(/\s+/g, "").length;
    });
  }

  function isVisibleElement(node) {
    const style = getComputedStyle(node);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function isForcedEditable(node) {
    return node.matches("[data-editable], [data-ai-force-editable]");
  }

  function isSkippableEditableNode(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return true;
    if (skippedEditableTags.has(node.tagName)) return true;
    if (node.closest("[data-ai-editor='true'], .ai-html-editor-toolbar, .editor-toolbar, .export-panel")) return true;
    if (node.closest("svg")) return true;
    if (!hasUsefulText(node)) return true;
    return !isVisibleElement(node);
  }

  function shouldMarkAsEditable(node) {
    if (isSkippableEditableNode(node)) return false;
    if (isForcedEditable(node)) return true;
    if (preferredTextContainers.has(node.tagName)) return true;
    if (hasDirectText(node) && (node.children.length === 0 || node.matches(config.editableSelector))) return true;
    return node.matches(config.editableSelector) && node.children.length === 0;
  }

  function collectEditableCandidates(root) {
    const nodes = [root, ...Array.from(root.querySelectorAll("*"))];
    const candidates = nodes.filter((node) => shouldMarkAsEditable(node));
    const selected = [];

    candidates.forEach((node) => {
      const hasSelectedAncestor = selected.some((selectedNode) => selectedNode.contains(node));
      if (!hasSelectedAncestor) selected.push(node);
    });

    return selected;
  }

  function clearEditableMarks() {
    document.querySelectorAll("[data-ai-editable='true']").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("spellcheck");
      node.removeAttribute("data-ai-editable");
      node.removeAttribute("data-ai-edit-id");
      node.classList.remove("ai-editor-selected");
    });
    selectedNode = null;
  }

  function markEditableNodes() {
    clearEditableMarks();
    posters = Array.from(document.querySelectorAll(config.posterSelector));
    if (!posters.length) posters = [document.body];

    posters.forEach((poster, posterIndex) => {
      collectEditableCandidates(poster).forEach((node, index) => {
        node.setAttribute("contenteditable", "true");
        node.contentEditable = editMode ? "true" : "false";
        node.setAttribute("spellcheck", "false");
        node.setAttribute("data-ai-editable", "true");
        if (!node.dataset.aiEditId) {
          node.dataset.aiEditId = `${poster.id || `poster-${posterIndex + 1}`}-${index}`;
        }
      });
    });
  }

  function computeSourceSignature() {
    const base = Array.from(document.querySelectorAll("[data-ai-editable='true']"))
      .map((node) => `${node.dataset.aiEditId}:${node.textContent.trim()}:${node.getAttribute("style") || ""}`)
      .join("|");
    return hashString(`${config.version}|${base}`);
  }

  function selectNode(node) {
    if (!editMode) return;
    if (!node || !node.matches("[data-ai-editable='true']")) return;
    if (selectedNode) selectedNode.classList.remove("ai-editor-selected");
    selectedNode = node;
    selectedNode.classList.add("ai-editor-selected");
    const style = getComputedStyle(selectedNode);
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight);
    fontSizeInput.value = Math.round(fontSize);
    lineHeightInput.value = Number.isNaN(lineHeight / fontSize) ? "" : (lineHeight / fontSize).toFixed(2);
    fontWeightInput.value = selectedNode.style.fontWeight || "";
    textColorInput.value = colorToHex(style.color);
    textColorValue.value = selectedNode.style.color || textColorInput.value;
    setStatus(`正在编辑：${selectedNode.textContent.trim().slice(0, 36) || "空文本"}`);
  }

  function applyStyleToSelected() {
    if (!editMode || !selectedNode) return;
    if (fontSizeInput.value) selectedNode.style.fontSize = `${fontSizeInput.value}px`;
    if (lineHeightInput.value) selectedNode.style.lineHeight = lineHeightInput.value;
    selectedNode.style.fontWeight = fontWeightInput.value || "";
    saveDraft(false);
  }

  function applyTextColor(value) {
    if (!editMode || !selectedNode) {
      setStatus("先点选一段文字");
      return;
    }
    const color = value.trim();
    if (!isValidCssColor(color)) {
      setStatus("颜色值无效，可输入 #111111、rgb(...) 或 var(--accent)");
      selectNode(selectedNode);
      return;
    }
    selectedNode.style.color = color;
    selectNode(selectedNode);
    saveDraft(false);
    setStatus("颜色已更新");
  }

  function clearTextColor() {
    if (!selectedNode) {
      setStatus("先点选一段文字");
      return;
    }
    selectedNode.style.color = "";
    selectNode(selectedNode);
    saveDraft(false);
    setStatus("已还原当前文字颜色");
  }

  function collectDraft() {
    const items = {};
    document.querySelectorAll("[data-ai-editable='true']").forEach((node) => {
      items[node.dataset.aiEditId] = {
        html: node.innerHTML,
        style: node.getAttribute("style") || ""
      };
    });
    return items;
  }

  function saveDraft(showStatus = true) {
    localStorage.setItem(storageKey, JSON.stringify({
      version: config.version,
      sourceSignature,
      savedAt: new Date().toISOString(),
      items: collectDraft()
    }));
    if (showStatus) setStatus("草稿已保存到当前浏览器");
  }

  function restoreDraft() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (!draft || draft.version !== config.version || draft.sourceSignature !== sourceSignature || !draft.items) {
        setStatus("已忽略旧版草稿，当前显示最新 HTML");
        return;
      }
      document.querySelectorAll("[data-ai-editable='true']").forEach((node) => {
        const item = draft.items[node.dataset.aiEditId];
        if (!item) return;
        node.innerHTML = item.html;
        if (item.style) node.setAttribute("style", item.style);
      });
      setStatus("已载入上次保存的草稿");
    } catch (error) {
      console.warn(error);
      setStatus("草稿读取失败，可以继续编辑当前版本");
    }
  }

  function resetDraft() {
    localStorage.removeItem(storageKey);
    setStatus("草稿已清空，正在恢复当前 HTML");
    window.location.reload();
  }

  function cleanDocumentClone() {
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll("[data-ai-editor='true']").forEach((node) => node.remove());
    clone.querySelectorAll("[contenteditable],[spellcheck],[data-ai-editable],[data-ai-edit-id]").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("spellcheck");
      node.removeAttribute("data-ai-editable");
      node.removeAttribute("data-ai-edit-id");
      node.classList.remove("ai-editor-selected");
    });
    return "<!doctype html>\n" + clone.outerHTML;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 600);
  }

  function exportHtml() {
    saveDraft(false);
    downloadBlob(new Blob([cleanDocumentClone()], { type: "text/html;charset=utf-8" }), config.exportHtmlName);
    setStatus("已导出修改版 HTML");
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function ensureHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = config.html2canvasPath;
      script.setAttribute("data-ai-editor", "true");
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function posterToCanvas(poster) {
    await ensureHtml2Canvas();
    document.body.classList.add("ai-editor-preview-mode");
    if (selectedNode) selectedNode.classList.remove("ai-editor-selected");
    await wait(80);
    const canvas = await window.html2canvas(poster, {
      backgroundColor: null,
      scale: config.screenshotScale,
      useCORS: true,
      logging: false,
      width: poster.offsetWidth,
      height: poster.offsetHeight
    });
    document.body.classList.remove("ai-editor-preview-mode");
    if (selectedNode) selectedNode.classList.add("ai-editor-selected");
    return canvas;
  }

  async function savePosterAsPng(poster) {
    const canvas = await posterToCanvas(poster);
    const filename = poster.dataset.exportName || `${poster.id || "poster"}.png`;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        downloadBlob(blob, filename);
        resolve();
      }, "image/png");
    });
  }

  async function saveAllPng() {
    setStatus("正在保存全部截图，请稍等");
    try {
      for (const poster of posters) {
        await savePosterAsPng(poster);
        await wait(160);
      }
      setStatus("全部截图已保存");
    } catch (error) {
      console.error(error);
      setStatus("截图失败，请刷新后再试");
    }
  }

  function toggleGuides() {
    document.body.classList.toggle("ai-editor-hide-guides");
    hideGuidesButton.textContent = document.body.classList.contains("ai-editor-hide-guides") ? "显示边框" : "隐藏边框";
  }

  function syncEditMode() {
    document.body.classList.toggle("ai-editor-interaction-mode", !editMode);
    document.querySelectorAll("[data-ai-editable='true']").forEach((node) => {
      node.contentEditable = editMode ? "true" : "false";
    });
    toggleEditModeButton.textContent = editMode ? "切到交互" : "切回编辑";
    if (!editMode && selectedNode) selectedNode.classList.remove("ai-editor-selected");
    setStatus(editMode ? "编辑模式：点文字修改内容和样式" : "页面交互模式：可以切换 Tab、点击按钮；按住 Option 点击也可临时放行");
  }

  function toggleEditMode() {
    editMode = !editMode;
    syncEditMode();
  }

  function wireEvents() {
    document.addEventListener("click", (event) => {
      if (!editMode || event.altKey) return;
      const editable = event.target.closest?.("[data-ai-editable='true']");
      if (!editable) return;
      event.preventDefault();
      event.stopPropagation();
      selectNode(editable);
    }, true);

    document.addEventListener("input", (event) => {
      if (editMode && event.target.matches("[data-ai-editable='true']")) saveDraft(false);
    });

    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveDraft();
      }
    });

    fontSizeInput.addEventListener("input", applyStyleToSelected);
    lineHeightInput.addEventListener("input", applyStyleToSelected);
    fontWeightInput.addEventListener("change", applyStyleToSelected);
    textColorInput.addEventListener("input", () => applyTextColor(textColorInput.value));
    textColorInput.addEventListener("change", () => applyTextColor(textColorInput.value));
    textColorValue.addEventListener("change", () => applyTextColor(textColorValue.value));
    textColorValue.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyTextColor(textColorValue.value);
      }
    });
    colorSwatchButtons.forEach((button) => {
      button.addEventListener("click", () => applyTextColor(button.dataset.color || ""));
    });
    clearTextColorButton.addEventListener("click", clearTextColor);
    document.getElementById("aiEditorSaveDraft").addEventListener("click", () => saveDraft());
    document.getElementById("aiEditorResetDraft").addEventListener("click", resetDraft);
    document.getElementById("aiEditorExportHtml").addEventListener("click", exportHtml);
    toggleEditModeButton.addEventListener("click", toggleEditMode);
    hideGuidesButton.addEventListener("click", toggleGuides);
    document.getElementById("aiEditorSaveAllPng").addEventListener("click", saveAllPng);
  }

  function init() {
    buildToolbar();
    markEditableNodes();
    syncEditMode();
    sourceSignature = computeSourceSignature();
    restoreDraft();
    wireEvents();
    selectNode(document.querySelector("[data-ai-editable='true']"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
