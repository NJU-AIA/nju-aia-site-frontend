<script setup lang="ts">
import { inject, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import { codeToHtml } from 'shiki';
import type { MarkdownNode } from '@/core/parser';

const props = defineProps<{ node: MarkdownNode }>();

const isDark = inject<Readonly<Ref<boolean>>>('isDark', ref(false));
const currentArticleId = inject<Readonly<Ref<string>>>('currentArticleId', ref(''));
const assetBaseUrl = inject<string>('assetBaseUrl', '');

const renderedMarkup = ref('');
const renderError = ref('');
const fallbackCode = ref('');
const pseudoTitle = ref('');
const pseudoLines = ref<string[]>([]);
const isRendering = ref(props.node.type === 'code');
let generation = 0;

const PSEUDO_KEYWORDS = new Set([
  'if', 'else', 'while', 'for', 'return', 'function', 'procedure',
  'end', 'do', 'then', 'break', 'continue', 'true', 'false',
  'repeat', 'until', 'input', 'output',
]);
const PSEUDO_PATTERN = new RegExp(`\\b(${[...PSEUDO_KEYWORDS].join('|')})\\b`, 'gi');
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_DATA_IMAGE = /^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i;

function renderMath(value: unknown, displayMode = false) {
  return katex.renderToString(String(value ?? ''), {
    displayMode,
    throwOnError: false,
    strict: 'warn',
    trust: false,
  });
}

function pseudoTokens(line: string) {
  return line.split(PSEUDO_PATTERN).map((text, index) => ({
    text,
    keyword: index % 2 === 1 && PSEUDO_KEYWORDS.has(text.toLowerCase()),
  }));
}

async function renderCode() {
  const currentGeneration = ++generation;
  renderedMarkup.value = '';
  renderError.value = '';
  fallbackCode.value = '';
  pseudoTitle.value = '';
  pseudoLines.value = [];

  if (props.node.type !== 'code') {
    isRendering.value = false;
    return;
  }

  isRendering.value = true;
  const language = String(props.node.lang || 'text').toLowerCase();
  const value = String(props.node.value || '');

  try {
    if (language === 'mermaid') {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: isDark.value ? 'dark' : 'default',
        fontFamily: 'inherit',
        flowchart: { htmlLabels: false },
        themeVariables: {
          primaryColor: isDark.value ? '#241622' : '#f8f3f7',
          primaryTextColor: isDark.value ? '#f5edf4' : '#222222',
          primaryBorderColor: '#6f145f',
          lineColor: '#6f145f',
          secondaryColor: isDark.value ? '#171217' : '#ffffff',
          tertiaryColor: isDark.value ? '#2a1c28' : '#f8f3f7',
        },
      });
      const id = `mermaid-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      const { svg } = await mermaid.render(id, value);
      if (currentGeneration === generation) renderedMarkup.value = svg;
      return;
    }

    if (language === 'pseudo' || language === 'algorithm') {
      const lines = value.split('\n');
      const hasTitle = lines[0]?.startsWith('//') ?? false;
      pseudoTitle.value = hasTitle ? lines[0].replace(/^\/\/\s*/, '') : 'Algorithm';
      pseudoLines.value = hasTitle ? lines.slice(1) : lines;
      return;
    }

    try {
      const html = await codeToHtml(value, {
        lang: language,
        theme: isDark.value ? 'tokyo-night' : 'github-light',
      });
      if (currentGeneration === generation) renderedMarkup.value = html;
    } catch {
      fallbackCode.value = value;
    }
  } catch (error) {
    if (currentGeneration === generation) {
      renderError.value = error instanceof Error ? error.message : '渲染失败';
      fallbackCode.value = value;
    }
  } finally {
    if (currentGeneration === generation) isRendering.value = false;
  }
}

watch(
  () => [props.node.type, props.node.lang, props.node.value, isDark.value],
  renderCode,
  { immediate: true },
);

onBeforeUnmount(() => {
  generation++;
});

function isVideo(url: unknown) {
  return /\.(?:mp4|webm|ogg)(?:[?#]|$)/i.test(String(url ?? ''));
}

function mediaChildren(node: MarkdownNode) {
  return node.children?.filter((child) => child.type === 'image') ?? [];
}

function isPureMedia(node: MarkdownNode) {
  if (node.type !== 'paragraph') return false;
  const children = node.children?.filter(
    (child) => child.type !== 'text' || String(child.value ?? '').trim(),
  ) ?? [];
  return children.length > 0 && children.every((child) => child.type === 'image');
}

function gridColumns(count: number) {
  if (count === 2 || count === 4) return 2;
  return count >= 3 ? 3 : 1;
}

function safeLinkHref(rawUrl: unknown) {
  const value = String(rawUrl ?? '').trim();
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return '';
  if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../') || value.startsWith('#')) {
    return value;
  }

  try {
    const parsed = new URL(value, window.location.href);
    return SAFE_LINK_PROTOCOLS.has(parsed.protocol) ? value : '';
  } catch {
    return '';
  }
}

function resolveMediaUrl(rawUrl: unknown) {
  const value = String(rawUrl ?? '').trim();
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return '';
  if (SAFE_DATA_IMAGE.test(value)) return value;

  if (/^https?:\/\//i.test(value) || value.startsWith('//')) {
    try {
      return new URL(value, window.location.href).href;
    } catch {
      return '';
    }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return '';

  const base = assetBaseUrl.replace(/\/$/, '');
  const relative = value.replace(/^\.\//, '').replace(/^\//, '');
  const articleId = currentArticleId.value.trim();

  if (value.startsWith('/')) return base ? `${base}/${relative}` : `/${relative}`;
  if (articleId) return base ? `${base}/${articleId}/${relative}` : `/${articleId}/${relative}`;
  return base ? `${base}/${relative}` : `/${relative}`;
}

function headingTag(depth: unknown) {
  return `h${Math.min(6, Math.max(1, Number(depth) || 3))}`;
}
</script>

<template>
  <template v-if="node.type === 'text'">{{ node.value }}</template>
  <br v-else-if="node.type === 'break'" />
  <hr v-else-if="node.type === 'thematicBreak'" class="ast-divider" />

  <span
    v-else-if="node.type === 'inlineMath'"
    class="ast-inline-math"
    v-html="renderMath(node.value)"
  />

  <div
    v-else-if="node.type === 'math'"
    class="ast-math"
    v-html="renderMath(node.value, true)"
  />

  <strong v-else-if="node.type === 'strong'" class="ast-strong">
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </strong>

  <em v-else-if="node.type === 'emphasis'" class="ast-emphasis">
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </em>

  <del v-else-if="node.type === 'delete'" class="ast-delete">
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </del>

  <code v-else-if="node.type === 'inlineCode'" class="ast-inline-code">{{ node.value }}</code>

  <a
    v-else-if="node.type === 'link' && safeLinkHref(node.url)"
    :href="safeLinkHref(node.url)"
    class="ast-link"
    target="_blank"
    rel="noopener noreferrer"
  >
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </a>

  <span v-else-if="node.type === 'link'" class="ast-invalid-link">
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </span>

  <component
    :is="headingTag(node.depth)"
    v-else-if="node.type === 'heading'"
    :class="['ast-heading', `ast-heading-${node.depth}`]"
  >
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </component>

  <template v-else-if="node.type === 'paragraph'">
    <div
      v-if="isPureMedia(node)"
      class="ast-media-gallery"
      :style="{ gridTemplateColumns: `repeat(${gridColumns(mediaChildren(node).length)}, minmax(0, 1fr))` }"
    >
      <AstRenderer
        v-for="(child, index) in mediaChildren(node)"
        :key="index"
        :node="child"
      />
    </div>
    <p v-else class="ast-paragraph">
      <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
    </p>
  </template>

  <video
    v-else-if="node.type === 'image' && isVideo(node.url) && resolveMediaUrl(node.url)"
    :src="resolveMediaUrl(node.url)"
    controls
    preload="metadata"
    referrerpolicy="no-referrer"
    class="ast-media ast-video"
  />

  <img
    v-else-if="node.type === 'image' && resolveMediaUrl(node.url)"
    :src="resolveMediaUrl(node.url)"
    :alt="String(node.alt ?? '')"
    decoding="async"
    referrerpolicy="no-referrer"
    class="ast-media ast-image"
  />

  <span v-else-if="node.type === 'image'" class="ast-media-error">[无法加载的媒体资源]</span>

  <blockquote v-else-if="node.type === 'blockquote'" class="ast-blockquote">
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </blockquote>

  <div v-else-if="node.type === 'table'" class="ast-table-wrapper">
    <table class="ast-table">
      <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
    </table>
  </div>

  <tr v-else-if="node.type === 'tableRow'" class="ast-table-row">
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </tr>

  <td v-else-if="node.type === 'tableCell'" class="ast-table-cell">
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </td>

  <component
    :is="node.ordered ? 'ol' : 'ul'"
    v-else-if="node.type === 'list'"
    :class="['ast-list', node.ordered ? 'ast-list-ordered' : 'ast-list-unordered']"
  >
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </component>

  <li v-else-if="node.type === 'listItem'" class="ast-list-item">
    <AstRenderer v-for="(child, index) in node.children" :key="index" :node="child" />
  </li>

  <div
    v-else-if="node.type === 'code'"
    class="ast-code-block"
    :data-render-state="isRendering ? 'pending' : 'ready'"
  >
    <div v-if="renderError" class="ast-render-error">
      渲染失败：{{ renderError }}
    </div>

    <div
      v-else-if="node.lang === 'mermaid'"
      class="ast-mermaid"
      v-html="renderedMarkup"
    />

    <div v-else-if="node.lang === 'pseudo' || node.lang === 'algorithm'" class="ast-pseudo">
      <div class="ast-code-meta">
        <span class="ast-code-dot" />
        <span class="ast-code-lang">Algorithm</span>
        <span class="ast-pseudo-title">{{ pseudoTitle }}</span>
      </div>
      <ol class="ast-pseudo-lines">
        <li v-for="(line, index) in pseudoLines" :key="index" class="ast-pseudo-line">
          <template v-for="(token, tokenIndex) in pseudoTokens(line)" :key="tokenIndex">
            <strong v-if="token.keyword" class="ast-pseudo-keyword">{{ token.text }}</strong>
            <template v-else>{{ token.text }}</template>
          </template>
        </li>
      </ol>
    </div>

    <div v-else class="ast-code-frame">
      <div v-if="node.lang" class="ast-code-meta">
        <span class="ast-code-dot" />
        <span class="ast-code-lang">{{ node.lang }}</span>
      </div>
      <pre v-if="fallbackCode" class="ast-code-fallback"><code>{{ fallbackCode }}</code></pre>
      <div v-else class="ast-code-content" v-html="renderedMarkup" />
    </div>
  </div>
</template>

<style scoped>
.ast-inline-math {
  display: inline-block;
  margin: 0 0.12em;
  vertical-align: middle;
  color: #6f145f;
}

.ast-math {
  margin: 1.5em 0;
  overflow-x: auto;
  border: 1px solid #e4d2e1;
  border-radius: 0.65em;
  background: #faf6f9;
  padding: 1.1em;
  color: #272227;
}

.ast-strong { font-weight: 650; color: #171217; }
.ast-emphasis { font-style: italic; }
.ast-delete { color: #777077; }
.ast-invalid-link { color: #777077; }

.ast-inline-code {
  margin: 0 0.12em;
  border: 1px solid #e3d2e0;
  border-radius: 0.3em;
  background: #faf6f9;
  padding: 0.08em 0.38em;
  color: #6f145f;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.9em;
}

.ast-link {
  color: #6f145f;
  font-weight: 550;
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.2em;
}

.ast-heading {
  color: #201b20;
  font-weight: 650;
  line-height: 1.3;
}
.ast-heading-1 { margin: 2.2rem 0 1rem; font-size: 2.35em; }
.ast-heading-2 { margin: 2rem 0 0.9rem; font-size: 1.75em; }
.ast-heading-3 { margin: 1.65rem 0 0.75rem; font-size: 1.35em; }
.ast-heading-4 { margin: 1.4rem 0 0.65rem; font-size: 1.15em; }
.ast-heading-5,
.ast-heading-6 { margin: 1.2rem 0 0.55rem; font-size: 1em; }

.ast-paragraph {
  margin: 0 0 1em;
  line-height: inherit;
}

.ast-divider {
  margin: 2rem 0;
  border: 0;
  border-top: 1px solid #eaddea;
}

.ast-media-gallery {
  display: grid;
  align-items: center;
  gap: 1rem;
  margin: 1.4rem 0;
}

.ast-media {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 68vh;
  margin: 1.2rem auto;
  border-radius: 0.55rem;
  object-fit: contain;
}

.ast-media-gallery > .ast-media {
  width: 100%;
  height: 100%;
  max-height: 40vh;
  margin: 0;
  object-fit: cover;
  aspect-ratio: 16 / 9;
}

.ast-media-gallery:has(> :only-child) > .ast-media {
  width: auto;
  max-height: 68vh;
  object-fit: contain;
  aspect-ratio: auto;
}

.ast-media-error { color: #a33b4c; font-size: 0.9em; }

.ast-blockquote {
  margin: 1.4rem 0;
  border-left: 4px solid #6f145f;
  border-radius: 0 0.55rem 0.55rem 0;
  background: #faf6f9;
  padding: 0.85rem 1.1rem;
  color: #4a4149;
}

.ast-blockquote :deep(.ast-paragraph:last-child) { margin-bottom: 0; }

.ast-table-wrapper {
  width: 100%;
  margin: 1.5rem 0;
  overflow-x: auto;
  border: 1px solid #dfcedc;
  border-radius: 0.6rem;
}

.ast-table { width: 100%; border-collapse: collapse; }
.ast-table-row { border-bottom: 1px solid #eaddea; }
.ast-table-row:last-child { border-bottom: 0; }
.ast-table-row:first-child { background: #6f145f; font-weight: 650; }
.ast-table-row:first-child .ast-table-cell { color: white; }
.ast-table-cell { padding: 0.72rem 0.9rem; vertical-align: top; }

.ast-list { margin: 0.85rem 0 1.1rem; padding-left: 1.5rem; }
.ast-list-unordered { list-style: disc; }
.ast-list-ordered { list-style: decimal; }
.ast-list-item { margin: 0.3rem 0; padding-left: 0.2rem; }
.ast-list-item::marker { color: #6f145f; font-weight: 650; }
.ast-list-item > :deep(.ast-paragraph) { margin-bottom: 0; }

.ast-code-block { width: 100%; margin: 1.4rem 0; }
.ast-code-frame,
.ast-pseudo {
  overflow: hidden;
  border: 1px solid #d8c1d4;
  border-radius: 0.6rem;
  background: white;
  box-shadow: 0 3px 14px rgb(69 24 62 / 6%);
}

.ast-code-meta {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border-bottom: 1px solid #eaddea;
  background: #f8f3f7;
  padding: 0.55rem 0.85rem;
}
.ast-code-dot { width: 0.42rem; height: 0.42rem; border-radius: 50%; background: #6f145f; }
.ast-code-lang {
  color: #6f145f;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.ast-pseudo-title { color: #766c75; font-size: 0.78rem; font-style: italic; }
.ast-pseudo-lines {
  margin: 0;
  padding: 0.85rem 1rem 0.85rem 2.8rem;
  background: #faf8fa;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.86em;
  line-height: 1.65;
}
.ast-pseudo-line { padding-left: 0.35rem; white-space: pre-wrap; }
.ast-pseudo-keyword { color: #6f145f; font-weight: 650; }
.ast-code-fallback {
  margin: 0;
  overflow-x: auto;
  background: #faf8fa;
  padding: 0.9rem 1rem;
  color: #24292f;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.86em;
  line-height: 1.65;
  white-space: pre;
}
.ast-code-content { overflow-x: auto; background: #faf8fa; padding: 0.9rem 1rem; }
.ast-code-content :deep(pre),
.ast-code-content :deep(.shiki) { margin: 0; padding: 0; background: transparent !important; }
.ast-code-content :deep(code) {
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 0.86em;
  line-height: 1.65;
}
.ast-mermaid {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  border: 1px solid #e1d4df;
  border-radius: 0.6rem;
  background: white;
  padding: 1rem;
}
.ast-mermaid :deep(svg) { max-width: 100%; height: auto; }
.ast-render-error {
  border: 1px solid #e5c5cb;
  border-radius: 0.5rem;
  background: #fff6f7;
  padding: 0.75rem 0.9rem;
  color: #9b3044;
  font-size: 0.86em;
}

:global(.dark) .ast-strong,
:global(.dark) .ast-heading { color: #f4edf3; }
:global(.dark) .ast-paragraph { color: #d9d0d8; }
:global(.dark) .ast-inline-code,
:global(.dark) .ast-math,
:global(.dark) .ast-blockquote { border-color: #513549; background: #241b22; color: #eadfe8; }
:global(.dark) .ast-code-frame,
:global(.dark) .ast-pseudo,
:global(.dark) .ast-mermaid { border-color: #513549; background: #171217; }
:global(.dark) .ast-code-meta { border-color: #513549; background: #2a1e27; }
:global(.dark) .ast-code-content,
:global(.dark) .ast-code-fallback,
:global(.dark) .ast-pseudo-lines { background: #171217; color: #eee6ed; }
:global(.dark) .ast-table-wrapper,
:global(.dark) .ast-table-row { border-color: #513549; }
</style>
