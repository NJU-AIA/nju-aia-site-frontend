<!-- AstRenderer.vue -->

<script setup lang="ts">
import { ref, watch, onMounted, inject, type Ref } from 'vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { codeToHtml } from 'shiki';
import mermaid from 'mermaid';

const props = defineProps<{ node: any; }>();
const highlightedCode = ref<string>('');
const pseudoTitle = ref<string>('');
const pseudoLines = ref<string[]>([]);

const isDark = inject('isDark', ref(true));
const currentArticleId = inject<Ref<string>>('currentArticleId', ref(''));
const assetBaseUrl = inject<string>('assetBaseUrl', '');

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// 伪代码关键字高亮与缩进格式化
const formatPseudoLine = (line: string) => {
  const indentMatched = line.match(/^(\s+)/);
  const indent = indentMatched ? '&nbsp;'.repeat(indentMatched[1].length * 2) : '';
  const content = escapeHtml(line.trimStart());

  const keywords = ['if', 'else', 'while', 'for', 'return', 'function', 'procedure', 'end', 'do', 'then', 'break', 'continue', 'true', 'false'];
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  return `${indent}${content.replace(regex, '<strong class="ast-pseudo-keyword">$1</strong>')}`;
};

const renderBlock = async () => {
  if (props.node.type === 'code') {
    const lang = props.node.lang || 'text';

    if (lang === 'mermaid') {
      try {
        mermaid.initialize({ startOnLoad: false, theme: isDark.value ? 'dark' : 'default', fontFamily: 'inherit' });
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, props.node.value);
        highlightedCode.value = svg;
      } catch (error) {
        highlightedCode.value = `<div class="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg text-sm border border-amber-200 dark:border-amber-800">Mermaid 语法错误: ${error}</div>`;
      }
      return;
    }

    if (lang === 'pseudo' || lang === 'algorithm') {
      const lines = props.node.value.split('\n');
      pseudoTitle.value = lines[0].startsWith('//') ? lines[0].replace(/^\/\/\s*/, '') : 'Algorithm';
      pseudoLines.value = lines[0].startsWith('//') ? lines.slice(1) : lines;
      return;
    }

    try {
      highlightedCode.value = await codeToHtml(props.node.value, {
        lang,
        theme: isDark.value ? 'tokyo-night' : 'github-light'
      });
    } catch (error) {
      highlightedCode.value = `<pre class="shiki-fallback text-sm font-mono p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200">${props.node.value}</pre>`;
    }
  }
};

onMounted(renderBlock);
watch(isDark, renderBlock);

const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);
const isPureMedia = (node: any) => {
  if (node.type !== 'paragraph') return false;
  const validChildren = node.children.filter((c: any) => c.type !== 'text' || c.value.trim() !== '');
  return validChildren.length > 0 && validChildren.every((c: any) => c.type === 'image');
};
const getMediaChildren = (node: any) => node.children.filter((c: any) => c.type === 'image');
const getGridCols = (count: number) => {
  if (count === 2 || count === 4) return 2;
  if (count >= 3) return 3;
  return 1;
};

const resolveUrl = (url: string) => {
  if (!url) return '';

  // 1. 外链直接返回
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  const base = assetBaseUrl.replace(/\/$/, '');
  const articleId = (currentArticleId?.value || '').trim();

  // 2. / 开头：直接拼前缀
  if (url.startsWith('/')) {
    return base ? `${base}${url}` : url;
  }

  // 3. 不以 / 开头：视为文件名，拼 前缀 + 文章id + 文件名
  const filename = url.replace(/^\.\//, '');

  if (articleId) {
    return base ? `${base}/${articleId}/${filename}` : `/${articleId}/${filename}`;
  }

  // 兜底：没有 articleId 时至少拼前缀
  return base ? `${base}/${filename}` : `/${filename}`;
};
</script>

<template>
  <template v-if="node.type === 'text'">{{ node.value }}</template>

  <span v-else-if="node.type === 'inlineMath'" class="ast-inline-math"
    v-html="katex.renderToString(node.value, { throwOnError: false })"></span>

  <div v-else-if="node.type === 'math'"
    class="ast-math"
    v-html="katex.renderToString(node.value, { displayMode: true, throwOnError: false })"></div>

  <strong v-else-if="node.type === 'strong'" class="ast-strong">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </strong>

  <em v-else-if="node.type === 'emphasis'" class="ast-emphasis">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </em>

  <code v-else-if="node.type === 'inlineCode'"
    class="ast-inline-code">{{
      node.value }}</code>

  <a v-else-if="node.type === 'link'" :href="node.url"
    class="ast-link"
    target="_blank">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </a>

  <component v-else-if="node.type === 'heading' && node.depth >= 3" :is="`h${node.depth}`" :class="[
    'ast-heading',
    `ast-heading-${node.depth}`
  ]">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </component>

  <template v-else-if="node.type === 'paragraph'">
    <div v-if="isPureMedia(node)" class="ast-media-gallery"
      :style="{ gridTemplateColumns: `repeat(${getGridCols(getMediaChildren(node).length)}, minmax(0, 1fr))` }">
      <AstRenderer v-for="(child, idx) in getMediaChildren(node)" :key="idx" :node="child" />
    </div>
    <p v-else class="ast-paragraph">
      <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
    </p>
  </template>

  <video v-else-if="node.type === 'image' && isVideo(node.url)" :src="resolveUrl(node.url)" controls
    class="ast-media ast-video"></video>

  <img v-else-if="node.type === 'image' && !isVideo(node.url)" :src="resolveUrl(node.url)" :alt="node.alt"
    class="ast-media ast-image" />

  <blockquote v-else-if="node.type === 'blockquote'"
    class="ast-blockquote">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </blockquote>

  <div v-else-if="node.type === 'table'"
    class="ast-table-wrapper">
    <table class="ast-table">
      <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
    </table>
  </div>

  <tr v-else-if="node.type === 'tableRow'" class="ast-table-row">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </tr>

  <td v-else-if="node.type === 'tableCell'" class="ast-table-cell">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </td>

  <component :is="node.ordered ? 'ol' : 'ul'" v-else-if="node.type === 'list'" :class="[
    'ast-list',
    node.ordered ? 'ast-list-ordered' : 'ast-list-unordered'
  ]">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </component>

  <li v-else-if="node.type === 'listItem'"
    class="ast-list-item">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </li>

  <div v-else-if="node.type === 'code'" class="ast-code-block">

    <div v-if="node.lang === 'mermaid'" class="ast-mermaid" v-html="highlightedCode"></div>

    <div v-else-if="node.lang === 'pseudo' || node.lang === 'algorithm'"
      class="ast-pseudo">
      <div
        class="ast-pseudo-header">
        <span>Algorithm</span>
        <span class="ast-pseudo-title">{{ pseudoTitle }}</span>
      </div>
      <ol class="ast-pseudo-lines">
        <li v-for="(line, idx) in pseudoLines" :key="idx" class="ast-pseudo-line">
          <span v-html="formatPseudoLine(line)"></span>
        </li>
      </ol>
    </div>

    <div v-else
      class="ast-code-frame">
      <!-- 代码块头部 -->
      <div
        class="ast-code-meta">
        <span v-if="node.lang"
          class="ast-code-lang">{{ node.lang
          }}</span>
      </div>
      <!-- 代码块内容 -->
      <div
        class="ast-code-content"
        v-html="highlightedCode"></div>
    </div>

  </div>
</template>

<style scoped>
li>p {
  margin-bottom: 0;
}

.media-gallery>img,
.media-gallery>video {
  width: 100% !important;
  height: 100% !important;
  max-height: 40vh !important;
  object-fit: cover !important;
  aspect-ratio: 16 / 9;
  margin: 0 !important;
}

.media-gallery:has(> :only-child)>img,
.media-gallery:has(> :only-child)>video {
  object-fit: contain !important;
  max-height: 70vh !important;
  aspect-ratio: auto;
}

/* 表格样式 */
table tr:first-child {
  font-weight: 600;
  background: linear-gradient(to right, rgb(241, 245, 250), rgb(240, 249, 245));
}

:global(.dark) table tr:first-child {
  background: linear-gradient(to right, rgb(30, 41, 59), rgb(20, 42, 40));
}

/* 数学公式优化 */
.math-display {
  font-size: clamp(0.95rem, 1.1vw, 1.15rem);
  overflow-x: auto;
  overflow-y: hidden;
}

@media print {
  .page-break-inside-avoid {
    page-break-inside: avoid;
  }

  .math-display {
    overflow-x: visible !important;
    white-space: normal !important;
    page-break-inside: avoid;
  }

  .math-display :deep(.katex-display) {
    max-width: 100%;
    overflow-wrap: break-word;
    display: inline-block;
  }
}
.ast-inline-math {
  display: inline-block;
  vertical-align: middle;
}

.ast-math {
  margin: 1.5rem 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.ast-strong {
  font-weight: 600;
}

.ast-emphasis {
  font-style: italic;
}

.ast-inline-code {
  display: inline-block;
  margin: 0 0.15rem;
  padding: 0.1rem 0.4rem;
  border-radius: 0.375rem;
  background: rgba(15, 23, 42, 0.06);
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 0.92em;
}

:global(.dark) .ast-inline-code {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.ast-link {
  text-decoration: underline;
  text-underline-offset: 0.16em;
}

.ast-heading {
  margin: 1.75rem 0 0.85rem;
  font-weight: 600;
  line-height: 1.35;
}

.ast-heading-3 {
  font-size: 1.4rem;
}

.ast-heading-4 {
  font-size: 1.18rem;
}

.ast-heading-5,
.ast-heading-6 {
  font-size: 1rem;
}

.ast-paragraph {
  margin-bottom: 1rem;
}

.ast-media-gallery {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
  align-items: center;
}

.ast-media {
  display: block;
  width: 100%;
  max-width: 100%;
  max-height: 60vh;
  margin: 0 auto;
  object-fit: contain;
}

.ast-media-gallery > .ast-media {
  height: 100%;
  max-height: 40vh;
  object-fit: cover;
  aspect-ratio: 16 / 9;
}

.ast-media-gallery:has(> :only-child) > .ast-media {
  max-height: 70vh;
  object-fit: contain;
  aspect-ratio: auto;
}

.ast-blockquote {
  margin: 1.5rem 0;
  padding-left: 1rem;
  border-left: 2px solid #d4d4d8;
}

:global(.dark) .ast-blockquote {
  border-left-color: #52525b;
  color: #d4d4d8;
}

.ast-table-wrapper {
  width: 100%;
  margin: 1.75rem 0;
  overflow-x: auto;
}

.ast-table {
  width: 100%;
  border-collapse: collapse;
}

.ast-table-row {
  border-bottom: 1px solid #e4e4e7;
}

:global(.dark) .ast-table-row {
  border-bottom-color: #3f3f46;
}

.ast-table-row:first-child {
  background: transparent;
}

.ast-table-cell {
  padding: 0.8rem 1rem;
  vertical-align: top;
}

:global(.dark) .ast-table-cell {
  color: #e4e4e7;
}

.ast-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.ast-list-ordered {
  list-style: decimal;
}

.ast-list-unordered {
  list-style: disc;
}

.ast-list-item {
  margin: 0.35rem 0;
}

.ast-list-item > :deep(p) {
  margin-bottom: 0;
}

.ast-code-block {
  width: 100%;
  margin: 1.5rem 0;
}

.ast-code-frame,
.ast-pseudo {
  overflow: hidden;
  border: 1px solid #e4e4e7;
  border-radius: 0.9rem;
}

:global(.dark) .ast-code-frame,
:global(.dark) .ast-pseudo {
  border-color: #3f3f46;
}

.ast-code-meta,
.ast-pseudo-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #e4e4e7;
  background: rgba(15, 23, 42, 0.035);
  font-size: 0.78rem;
}

:global(.dark) .ast-code-meta,
:global(.dark) .ast-pseudo-header {
  border-bottom-color: #3f3f46;
  background: rgba(148, 163, 184, 0.08);
  color: #d4d4d8;
}

.ast-code-lang,
.ast-pseudo-header {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ast-pseudo-title {
  font-style: italic;
  text-transform: none;
  letter-spacing: normal;
}

.ast-pseudo-lines {
  margin: 0;
  padding: 1rem 1rem 1rem 2.8rem;
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
}

:global(.dark) .ast-pseudo-lines {
  color: #e4e4e7;
}

.ast-pseudo-line {
  padding-left: 0.4rem;
  white-space: pre-wrap;
}

.ast-pseudo-keyword {
  font-weight: 600;
}

.ast-code-content {
  padding: 0;
}

.ast-code-content :deep(pre),
.ast-code-fallback {
  margin: 0;
  padding: 1rem 1.1rem;
  overflow-x: auto;
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 0.92rem;
  line-height: 1.7;
}

.ast-code-content :deep(pre) {
  background: transparent !important;
}

.ast-mermaid {
  overflow-x: auto;
}
</style>
