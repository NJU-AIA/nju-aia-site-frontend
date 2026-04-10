<script setup lang="ts">
import type { SlideNode } from '../core/parser';
import AstRenderer from './AstRenderer.vue';

const props = defineProps<{
  slides: SlideNode[];
  title?: string;
  author?: string;
  date?: string;
}>();

const displayDate = props.date || new Date().toLocaleDateString('zh-CN', { 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit' 
});

// 内容幻灯片
const contentSlides = props.slides.filter(s => s.type === 'content');
</script>

<template>
  <div class="line-root min-h-screen bg-stone-50 dark:bg-stone-950 py-16 px-4">
    
    <article class="line-paper max-w-4xl mx-auto bg-white dark:bg-stone-900 relative">
      
      <!-- 四角装饰线 -->
      <div class="corner-lines">
        <div class="corner-line top-left"></div>
        <div class="corner-line top-right"></div>
        <div class="corner-line bottom-left"></div>
        <div class="corner-line bottom-right"></div>
      </div>

      <!-- 主边框 -->
      <div class="main-border absolute inset-4 border-2 border-stone-900 dark:border-stone-100 pointer-events-none"></div>
      
      <div class="content-wrapper relative z-10 p-12 sm:p-16 lg:p-20">
        
        <!-- 封面 -->
        <header v-if="slides.length > 0 && slides[0].type === 'cover'" class="cover-section mb-20">
          
          <!-- 顶部装饰线 -->
          <div class="header-lines mb-12">
            <div class="h-px bg-stone-900 dark:bg-stone-100 mb-2"></div>
            <div class="h-0.5 bg-stone-900 dark:bg-stone-100 w-32"></div>
          </div>

          <div class="flex items-start gap-8 mb-8">
            <div class="flex-shrink-0 w-1 bg-stone-900 dark:bg-stone-100 h-24"></div>
            <div class="flex-1">
              <h1 class="text-4xl sm:text-5xl font-light tracking-tight text-stone-950 dark:text-stone-50 leading-tight border-b-4 border-stone-900 dark:border-stone-100 pb-4 inline-block">
                {{ slides[0].title }}
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-6 ml-9 text-sm text-stone-600 dark:text-stone-400 mb-12">
            <div class="flex items-center gap-2">
              <div class="w-6 h-px bg-stone-400"></div>
              <span class="uppercase tracking-widest">{{ author || '作者' }}</span>
            </div>
            <div class="w-px h-4 bg-stone-300 dark:bg-stone-700"></div>
            <div class="flex items-center gap-2">
              <div class="w-6 h-px bg-stone-400"></div>
              <span class="uppercase tracking-widest">{{ displayDate }}</span>
            </div>
          </div>

          <div v-if="slides[0].elements.length > 0" class="ml-9 pl-6 border-l-2 border-stone-200 dark:border-stone-800">
            <div class="prose-line">
              <AstRenderer v-for="(el, idx) in slides[0].elements" :key="idx" :node="el" />
            </div>
          </div>

          <!-- 底部装饰线 -->
          <div class="header-lines mt-12">
            <div class="h-0.5 bg-stone-900 dark:bg-stone-100 w-32 ml-auto"></div>
            <div class="h-px bg-stone-900 dark:bg-stone-100 mt-2"></div>
          </div>
        </header>

        <!-- 主内容 -->
        <main class="main-content space-y-16">
          <template v-for="(slide, index) in contentSlides" :key="index">
            <section class="content-section relative">
              
              <!-- 章节内容 -->
              <div v-if="!slide.isContinuation" class="question-wrapper">
                
                <!-- 标题框 -->
                <div class="title-frame relative mb-8">
                  <div class="absolute -left-4 top-0 bottom-0 w-1 bg-stone-900 dark:bg-stone-100"></div>
                  <div class="absolute -left-4 top-0 w-12 h-px bg-stone-900 dark:bg-stone-100"></div>
                  <div class="absolute -left-4 bottom-0 w-12 h-px bg-stone-900 dark:bg-stone-100"></div>
                  
                  <div class="flex items-baseline gap-4">
                    <div class="flex-shrink-0 w-12 h-12 border-2 border-stone-900 dark:border-stone-100 flex items-center justify-center font-bold text-lg text-stone-900 dark:text-stone-100">
                      {{ index + 1 }}
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-light text-stone-950 dark:text-stone-50">
                      {{ slide.title }}
                    </h2>
                  </div>
                </div>

                <!-- 章节内容框 -->
                <div class="question-box relative ml-16 p-6 border-2 border-stone-900 dark:border-stone-100">
                  <!-- 左上角装饰 -->
                  <div class="absolute -top-2 -left-2 w-4 h-4 bg-white dark:bg-stone-900 border-t-2 border-l-2 border-stone-900 dark:border-stone-100"></div>
                  <!-- 右下角装饰 -->
                  <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-white dark:bg-stone-900 border-b-2 border-r-2 border-stone-900 dark:border-stone-100"></div>
                  
                  <div class="prose-line">
                    <AstRenderer v-for="(el, idx) in slide.elements" :key="'q'+idx" :node="el" />
                  </div>
                </div>
              </div>

              <!-- 续写内容 -->
              <div v-else class="solution-wrapper ml-16 mt-10">
                
                <!-- 续写标签 -->
                <div class="solution-label flex items-center gap-3 mb-6">
                  <div class="w-8 h-8 border-2 border-stone-600 dark:border-stone-400 flex items-center justify-center">
                    <div class="w-4 h-px bg-stone-600 dark:bg-stone-400"></div>
                  </div>
                  <span class="text-xs uppercase tracking-widest text-stone-600 dark:text-stone-400 font-medium">Continuation</span>
                  <div class="flex-1 h-px bg-stone-300 dark:bg-stone-700"></div>
                </div>

                <!-- 续写正文 -->
                <div class="solution-content pl-11 border-l border-stone-300 dark:border-stone-700">
                  <div class="prose-line">
                    <AstRenderer v-for="(el, idx) in slide.elements" :key="'a'+idx" :node="el" />
                  </div>

                  <!-- 证毕标记 -->
                  <div class="flex justify-end mt-8">
                    <div class="flex flex-col items-end gap-1">
                      <div class="w-8 h-px bg-stone-400 dark:bg-stone-600"></div>
                      <div class="w-6 h-6 border-2 border-stone-400 dark:border-stone-600"></div>
                    </div>
                  </div>
                </div>
              </div>

            </section>

            <!-- 章节分隔线 -->
            <div v-if="index < contentSlides.length - 1" class="section-divider my-16">
              <div class="flex items-center gap-4">
                <div class="flex-1 flex flex-col gap-1">
                  <div class="h-px bg-stone-900 dark:bg-stone-100"></div>
                  <div class="h-px bg-stone-300 dark:bg-stone-700"></div>
                </div>
                <div class="w-2 h-2 border border-stone-400 dark:border-stone-600 rotate-45"></div>
                <div class="flex-1 flex flex-col gap-1">
                  <div class="h-px bg-stone-900 dark:bg-stone-100"></div>
                  <div class="h-px bg-stone-300 dark:bg-stone-700"></div>
                </div>
              </div>
            </div>
          </template>
        </main>

        <!-- 页脚 -->
        <footer class="footer-section mt-24 pt-8 border-t-2 border-stone-900 dark:border-stone-100">
          <div class="flex justify-between items-center text-xs uppercase tracking-widest text-stone-500">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 border border-stone-400"></div>
              <span>Line View</span>
            </div>
            <div class="flex items-center gap-2">
              <span>{{ new Date().getFullYear() }}</span>
              <div class="w-3 h-3 border border-stone-400"></div>
            </div>
          </div>
        </footer>

      </div>
    </article>
  </div>
</template>

<style scoped>
/* 字体系统 */
.line-root {
  font-family: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", sans-serif;
  -webkit-font-smoothing: antialiased;

  --line-ornament: #1c1917;
  --line-body-color: #292524;
  --line-h3-color: #1c1917;
  --line-h3-border: #e7e5e4;
  --line-ol-index-color: #1c1917;
  --line-ol-index-border: #57534e;
  --line-inline-code-bg: #fafaf9;
  --line-inline-code-border: #d6d3d1;
  --line-inline-code-color: #1c1917;
  --line-shiki-bg: #fafaf9;
  --line-shiki-border: #292524;
  --line-table-border: #292524;
  --line-table-cell-border: #d6d3d1;
  --line-th-bg: #292524;
  --line-th-color: #fafaf9;
  --line-quote-border-strong: #292524;
  --line-quote-border-soft: #e7e5e4;
  --line-quote-bg: #fafaf9;
}

:global(.dark) .line-root {
  --line-ornament: #fafaf9;
  --line-body-color: #e7e5e4;
  --line-h3-color: #fafaf9;
  --line-h3-border: #44403c;
  --line-ol-index-color: #fafaf9;
  --line-ol-index-border: #78716c;
  --line-inline-code-bg: #1c1917;
  --line-inline-code-border: #44403c;
  --line-inline-code-color: #fafaf9;
  --line-shiki-bg: #0c0a09;
  --line-shiki-border: #e7e5e4;
  --line-table-border: #e7e5e4;
  --line-table-cell-border: #44403c;
  --line-th-bg: #fafaf9;
  --line-th-color: #1c1917;
  --line-quote-border-strong: #fafaf9;
  --line-quote-border-soft: #44403c;
  --line-quote-bg: #1c1917;

  --ast-paragraph-color: var(--line-body-color);
  --ast-heading-color: var(--line-h3-color);
  --ast-table-cell-color-dark: var(--line-body-color);
  --ast-inline-code-bg-dark: var(--line-inline-code-bg);
  --ast-inline-code-color-dark: var(--line-inline-code-color);
  --ast-table-row-border-dark: var(--line-table-cell-border);
  --ast-blockquote-border-dark: var(--line-quote-border-strong);
  --ast-blockquote-color-dark: var(--line-body-color);
}

.line-root {
  --ast-paragraph-color: var(--line-body-color);
  --ast-heading-color: var(--line-h3-color);
  --ast-link-color: inherit;
  --ast-table-cell-color: var(--line-body-color);
  --ast-inline-code-bg: var(--line-inline-code-bg);
  --ast-inline-code-color: var(--line-inline-code-color);
  --ast-table-row-border: var(--line-table-cell-border);
  --ast-blockquote-border: var(--line-quote-border-strong);
  --ast-blockquote-color: var(--line-body-color);
}

/* 四角装饰线 */
.corner-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.corner-line {
  position: absolute;
  width: 32px;
  height: 32px;
}

.corner-line::before,
.corner-line::after {
  content: '';
  position: absolute;
  background: var(--line-ornament);
}

.top-left {
  top: 0;
  left: 0;
}

.top-left::before {
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
}

.top-left::after {
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
}

.top-right {
  top: 0;
  right: 0;
}

.top-right::before {
  top: 0;
  right: 0;
  width: 100%;
  height: 2px;
}

.top-right::after {
  top: 0;
  right: 0;
  width: 2px;
  height: 100%;
}

.bottom-left {
  bottom: 0;
  left: 0;
}

.bottom-left::before {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
}

.bottom-left::after {
  bottom: 0;
  left: 0;
  width: 2px;
  height: 100%;
}

.bottom-right {
  bottom: 0;
  right: 0;
}

.bottom-right::before {
  bottom: 0;
  right: 0;
  width: 100%;
  height: 2px;
}

.bottom-right::after {
  bottom: 0;
  right: 0;
  width: 2px;
  height: 100%;
}

/* 内容排版 */
.prose-line {
  line-height: 1.8;
  color: var(--line-body-color);
}

:deep(p) {
  margin-bottom: 1.25rem;
  font-size: 1.0625rem;
  line-height: 1.8;
}

:deep(h3) {
  font-size: 1.5rem;
  font-weight: 400;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--line-h3-color);
  border-bottom: 1px solid var(--line-h3-border);
  padding-bottom: 0.5rem;
}

/* 列表样式 */
:deep(ul) {
  list-style: none;
  padding-left: 0;
  margin: 1.5rem 0;
}

:deep(ul li) {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 0.75rem;
}

:deep(ul li::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7em;
  width: 12px;
  height: 2px;
  background: #57534e;
}

:deep(ol) {
  list-style: none;
  padding-left: 0;
  margin: 1.5rem 0;
  counter-reset: line-counter;
}

:deep(ol li) {
  position: relative;
  padding-left: 3rem;
  margin-bottom: 1rem;
  counter-increment: line-counter;
}

:deep(ol li::before) {
  content: counter(line-counter);
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--line-ol-index-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--line-ol-index-color);
}

/* 代码样式 */
:deep(code) {
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", monospace;
  font-size: 0.9em;
  padding: 0.2em 0.5em;
  background: var(--line-inline-code-bg);
  border: 1px solid var(--line-inline-code-border);
  color: var(--line-inline-code-color);
}

:deep(.shiki) {
  margin: 1.5rem 0 !important;
  padding: 1.5rem !important;
  border: 2px solid var(--line-shiki-border) !important;
  border-radius: 0 !important;
  background: var(--line-shiki-bg) !important;
  box-shadow: none !important;
  position: relative;
}

/* 为代码块添加角装饰 */
:deep(.shiki::before),
:deep(.shiki::after) {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid var(--line-shiki-border);
}

:deep(.shiki::before) {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

:deep(.shiki::after) {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

/* 表格 */
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
  border: 2px solid var(--line-table-border);
}

:deep(th),
:deep(td) {
  padding: 0.75rem 1rem;
  border: 1px solid var(--line-table-cell-border);
  text-align: left;
}

:deep(th) {
  background: var(--line-th-bg);
  color: var(--line-th-color);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
}

/* 引用 */
:deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 3px solid var(--line-quote-border-strong);
  border-right: 1px solid var(--line-quote-border-soft);
  border-top: 1px solid var(--line-quote-border-soft);
  border-bottom: 1px solid var(--line-quote-border-soft);
  background: var(--line-quote-bg);
  position: relative;
}

/* 响应式 */
@media (max-width: 640px) {
  .content-wrapper {
    padding: 2rem !important;
  }

  .main-border {
    inset: 1rem;
  }

  .solution-wrapper,
  .question-box {
    margin-left: 0 !important;
  }

  .title-frame .absolute {
    display: none;
  }
}

/* 打印 */
@media print {
  .line-root {
    background: white;
    padding: 0;
  }

  .line-paper {
    box-shadow: none;
  }

  .content-section {
    page-break-inside: avoid;
  }
}
</style>
