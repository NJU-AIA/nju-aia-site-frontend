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
const currentDir = inject<Ref<string>>('currentDir', ref(''));

// 伪代码关键字高亮与缩进格式化
const formatPseudoLine = (line: string) => {
  const indentMatched = line.match(/^(\s+)/);
  const indent = indentMatched ? '&nbsp;'.repeat(indentMatched[1].length * 2) : '';
  let content = line.trimStart();
  
  const keywords = ['if', 'else', 'while', 'for', 'return', 'function', 'procedure', 'end', 'do', 'then', 'break', 'continue', 'true', 'false'];
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  content = content.replace(regex, '<strong class="font-semibold text-teal-700 dark:text-teal-400">$1</strong>');
  
  return `${indent}${content}`;
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

const assetBaseUrl = inject<string>('assetBaseUrl', '');
const resolveUrl = (url: string) => {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  const base = assetBaseUrl.replace(/\/$/, '');
  
  let cleanUrl = url;
  if (currentDir.value && !url.startsWith('/')) {
    const tmp = url.replace(/^\.\//, '');
    cleanUrl = `${currentDir.value}/${tmp}`;
  } else {
    cleanUrl = url.replace(/^\.?\//, '');
  }

  return base ? `${base}/${cleanUrl}` : `/${cleanUrl}`;
};
</script>

<template>
  <template v-if="node.type === 'text'">{{ node.value }}</template>

  <span v-else-if="node.type === 'inlineMath'" class="mx-1 text-teal-700 dark:text-teal-400" v-html="katex.renderToString(node.value, { throwOnError: false })"></span>
  
  <div v-else-if="node.type === 'math'" class="math-display my-6 flex justify-center py-5 px-4 w-full rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700" v-html="katex.renderToString(node.value, { displayMode: true, throwOnError: false })"></div>
  
  <strong v-else-if="node.type === 'strong'" class="font-semibold text-slate-900 dark:text-slate-100">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </strong>
  
  <em v-else-if="node.type === 'emphasis'" class="italic text-slate-700 dark:text-slate-300">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </em>
  
  <code v-else-if="node.type === 'inlineCode'" class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded text-sm font-mono mx-1 border border-slate-300 dark:border-slate-700">{{ node.value }}</code>
  
  <a v-else-if="node.type === 'link'" :href="node.url" class="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium underline underline-offset-2 transition-colors duration-150" target="_blank">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </a>

  <component 
    v-else-if="node.type === 'heading' && node.depth >= 3" 
    :is="`h${node.depth}`"
    :class="[
      'font-semibold mt-8 mb-4 pl-4 border-l-4 text-slate-800 dark:text-slate-200',
      node.depth === 3 
        ? 'border-teal-400 dark:border-teal-600 text-xl'
        : node.depth === 4
        ? 'border-teal-300 dark:border-teal-700 text-lg'
        : node.depth === 5
        ? 'border-slate-400 dark:border-slate-600 text-base'
        : 'border-slate-400 dark:border-slate-600 text-base'
    ]"
  >
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </component>

  <template v-else-if="node.type === 'paragraph'">
    <div v-if="isPureMedia(node)" class="media-gallery w-full my-6 grid gap-6 place-items-center" :style="{ gridTemplateColumns: `repeat(${getGridCols(getMediaChildren(node).length)}, minmax(0, 1fr))` }">
      <AstRenderer v-for="(child, idx) in getMediaChildren(node)" :key="idx" :node="child" />
    </div>
    <p v-else class="mb-6 text-slate-700 dark:text-slate-300 text-base leading-8">
      <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
    </p>
  </template>

  <video v-else-if="node.type === 'image' && isVideo(node.url)" :src="resolveUrl(node.url)" controls class="max-h-[60vh] mx-auto block rounded-lg shadow-sm border border-slate-300 dark:border-slate-700"></video>
  
  <img v-else-if="node.type === 'image' && !isVideo(node.url)" :src="resolveUrl(node.url)" :alt="node.alt" class="max-h-[60vh] w-auto max-w-full object-contain mx-auto block rounded-lg shadow-sm border border-slate-300 dark:border-slate-700" />

  <blockquote v-else-if="node.type === 'blockquote'" class="border-l-4 border-teal-400 pl-4 py-2 my-6 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 rounded-r-lg text-base leading-7 font-normal">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </blockquote>

  <div v-else-if="node.type === 'table'" class="w-full overflow-x-auto my-8 rounded-lg shadow-sm border border-slate-300 dark:border-slate-700">
    <table class="w-full text-left text-sm border-collapse bg-white dark:bg-slate-900">
      <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
    </table>
  </div>
  
  <tr v-else-if="node.type === 'tableRow'" class="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </tr>
  
  <td v-else-if="node.type === 'tableCell'" class="px-4 py-3 text-slate-700 dark:text-slate-300 font-normal">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </td>
  
  <component 
    :is="node.ordered ? 'ol' : 'ul'" 
    v-else-if="node.type === 'list'" 
    :class="[
      'mb-6 pl-6 text-slate-700 dark:text-slate-300 text-base space-y-2 leading-7',
      node.ordered ? 'list-decimal' : 'list-disc'
    ]"
  >
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </component>
  
  <li v-else-if="node.type === 'listItem'" class="pl-1 marker:text-teal-600 dark:marker:text-teal-400 marker:font-semibold">
    <AstRenderer v-for="(child, idx) in node.children" :key="idx" :node="child" />
  </li>

  <div v-else-if="node.type === 'code'" class="w-full">
    
    <div v-if="node.lang === 'mermaid'" class="flex justify-center my-8" v-html="highlightedCode"></div>

    <div v-else-if="node.lang === 'pseudo' || node.lang === 'algorithm'" class="my-8 rounded-lg overflow-hidden border border-teal-300 dark:border-teal-700 bg-slate-50 dark:bg-slate-800/30 shadow-sm">
      <div class="border-b border-teal-300 dark:border-teal-700 bg-slate-100 dark:bg-slate-800/60 px-5 py-3 flex items-baseline gap-3 font-semibold text-sm text-teal-900 dark:text-teal-300 uppercase tracking-wide">
        <span>Algorithm</span>
        <span class="italic font-normal text-teal-700 dark:text-teal-400">{{ pseudoTitle }}</span>
      </div>
      <ol class="list-decimal list-outside pl-8 pr-5 py-4 space-y-1 text-sm leading-7 marker:font-semibold marker:text-teal-600 dark:marker:text-teal-400 text-slate-700 dark:text-slate-300 font-mono">
        <li v-for="(line, idx) in pseudoLines" :key="idx" class="pl-2">
          <span class="whitespace-pre text-xs leading-6" v-html="formatPseudoLine(line)"></span>
        </li>
      </ol>
    </div>

    <div v-else class="my-6 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-900">
      <!-- 代码块头部 -->
      <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-5 py-2 border-b border-slate-300 dark:border-slate-700">
        <span v-if="node.lang" class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{{ node.lang }}</span>
      </div>
      <!-- 代码块内容 -->
      <div class="shiki-container text-sm font-mono leading-7 p-4 [&>pre]:overflow-x-auto [&>pre]:bg-transparent [&>pre]:p-0 text-slate-800 dark:text-slate-200" v-html="highlightedCode"></div>
    </div>

  </div>
</template>

<style scoped>
li > p { margin-bottom: 0; }

.media-gallery > img, .media-gallery > video {
  width: 100% !important; 
  height: 100% !important; 
  max-height: 40vh !important;
  object-fit: cover !important; 
  aspect-ratio: 16 / 9; 
  margin: 0 !important;
}

.media-gallery:has(> :only-child) > img, .media-gallery:has(> :only-child) > video {
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
</style>