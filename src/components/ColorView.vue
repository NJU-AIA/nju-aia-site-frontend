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
  month: 'long', 
  day: 'numeric' 
});

// 内容幻灯片
const contentSlides = props.slides.filter(s => s.type === 'content');

// 为每个章节分配颜色
const colorSchemes = [
  { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-400', accent: 'bg-rose-400', text: 'text-rose-700 dark:text-rose-400' },
  { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-400', accent: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-400' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-400', accent: 'bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-400' },
  { bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-400', accent: 'bg-sky-400', text: 'text-sky-700 dark:text-sky-400' },
  { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-400', accent: 'bg-purple-400', text: 'text-purple-700 dark:text-purple-400' },
  { bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-400', accent: 'bg-pink-400', text: 'text-pink-700 dark:text-pink-400' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/20', border: 'border-cyan-400', accent: 'bg-cyan-400', text: 'text-cyan-700 dark:text-cyan-400' },
  { bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-400', accent: 'bg-indigo-400', text: 'text-indigo-700 dark:text-indigo-400' },
];

const getColorScheme = (index: number) => {
  return colorSchemes[index % colorSchemes.length];
};
</script>

<template>
  <div class="color-container min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4">
    
    <!-- 装饰性彩色圆点 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
      <div class="absolute top-20 left-[10%] w-32 h-32 bg-rose-300 dark:bg-rose-600/30 rounded-full blur-2xl"></div>
      <div class="absolute top-40 right-[15%] w-40 h-40 bg-amber-300 dark:bg-amber-600/30 rounded-full blur-2xl"></div>
      <div class="absolute top-[60%] left-[20%] w-36 h-36 bg-emerald-300 dark:bg-emerald-600/30 rounded-full blur-2xl"></div>
      <div class="absolute bottom-32 right-[25%] w-44 h-44 bg-sky-300 dark:bg-sky-600/30 rounded-full blur-2xl"></div>
    </div>

    <article class="color-paper relative max-w-4xl mx-auto">
      
      <!-- 封面 -->
      <header v-if="slides.length > 0 && slides[0].type === 'cover'" class="cover-colorful relative mb-16">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-16 shadow-xl overflow-hidden">
          
          <!-- 彩色条纹装饰 -->
          <div class="absolute top-0 left-0 right-0 h-2 flex">
            <div class="flex-1 bg-rose-400"></div>
            <div class="flex-1 bg-amber-400"></div>
            <div class="flex-1 bg-emerald-400"></div>
            <div class="flex-1 bg-sky-400"></div>
            <div class="flex-1 bg-purple-400"></div>
            <div class="flex-1 bg-pink-400"></div>
          </div>

          <div class="relative z-10">
            <div class="inline-flex items-center gap-2 mb-6">
              <div class="flex gap-1.5">
                <div class="w-3 h-3 rounded-full bg-rose-400"></div>
                <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <span class="text-sm text-slate-500 dark:text-slate-400 tracking-wide">{{ displayDate }}</span>
            </div>

            <h1 class="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-8 leading-tight">
              {{ slides[0].title }}
            </h1>

            <div v-if="author" class="flex items-center gap-3 mb-10">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 via-amber-400 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {{ author[0] }}
              </div>
              <span class="text-lg text-slate-700 dark:text-slate-300 font-medium">{{ author }}</span>
            </div>

            <div v-if="slides[0].elements.length > 0" class="prose-color">
              <AstRenderer v-for="(el, idx) in slides[0].elements" :key="idx" :node="el" />
            </div>
          </div>
        </div>
      </header>

      <!-- 主内容 -->
      <main class="main-content space-y-8">
        <template v-for="(slide, index) in contentSlides" :key="index">
          <section class="content-card">
            
            <!-- 章节卡片 -->
            <div v-if="!slide.isContinuation" :class="getColorScheme(index).bg" class="rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              
              <!-- 标题区 -->
              <div class="flex items-start gap-4 mb-6">
                <div 
                  :class="getColorScheme(index).accent" 
                  class="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span :class="getColorScheme(index).text" class="text-xs font-bold uppercase tracking-wider">Section</span>
                    <div :class="getColorScheme(index).accent" class="w-12 h-0.5 rounded-full"></div>
                  </div>
                  <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {{ slide.title }}
                  </h2>
                </div>
              </div>

              <!-- 章节内容 -->
              <div class="pl-18 prose-color">
                <AstRenderer v-for="(el, idx) in slide.elements" :key="'q'+idx" :node="el" />
              </div>
            </div>

            <!-- 续写卡片 -->
            <div v-else class="bg-white dark:bg-slate-900 rounded-3xl p-8 ml-0 sm:ml-10 mt-6 shadow-lg border-l-4" :class="getColorScheme(Math.floor(index / 2)).border">
              
              <div class="flex items-center gap-3 mb-6">
                <div class="flex gap-1">
                  <div :class="getColorScheme(Math.floor(index / 2)).accent" class="w-1.5 h-6 rounded-full"></div>
                  <div :class="getColorScheme(Math.floor(index / 2)).accent" class="w-1.5 h-6 rounded-full opacity-60"></div>
                  <div :class="getColorScheme(Math.floor(index / 2)).accent" class="w-1.5 h-6 rounded-full opacity-30"></div>
                </div>
                <span :class="getColorScheme(Math.floor(index / 2)).text" class="text-sm font-bold uppercase tracking-wider">Continuation</span>
              </div>

              <div class="prose-color">
                <AstRenderer v-for="(el, idx) in slide.elements" :key="'a'+idx" :node="el" />
              </div>

              <!-- 完成标记 -->
              <div class="flex justify-end mt-6">
                <div class="flex items-center gap-2">
                  <div :class="getColorScheme(Math.floor(index / 2)).accent" class="w-2 h-2 rounded-full"></div>
                  <div :class="getColorScheme(Math.floor(index / 2)).accent" class="w-2 h-2 rounded-full"></div>
                  <div :class="getColorScheme(Math.floor(index / 2)).accent" class="w-3 h-3 rounded-full"></div>
                </div>
              </div>
            </div>

          </section>
        </template>
      </main>

      <!-- 页脚 -->
      <footer class="footer-colorful mt-16 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div class="absolute bottom-0 left-0 right-0 h-2 flex">
          <div class="flex-1 bg-purple-400"></div>
          <div class="flex-1 bg-pink-400"></div>
          <div class="flex-1 bg-sky-400"></div>
          <div class="flex-1 bg-emerald-400"></div>
          <div class="flex-1 bg-amber-400"></div>
          <div class="flex-1 bg-rose-400"></div>
        </div>
        
        <div class="relative z-10 flex justify-center items-center gap-3">
          <div class="flex gap-1.5">
            <div class="w-2 h-2 rounded-full bg-rose-400"></div>
            <div class="w-2 h-2 rounded-full bg-amber-400"></div>
            <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
          </div>
          <span class="text-sm text-slate-500 dark:text-slate-400">Created with Color View</span>
          <div class="flex gap-1.5">
            <div class="w-2 h-2 rounded-full bg-sky-400"></div>
            <div class="w-2 h-2 rounded-full bg-purple-400"></div>
            <div class="w-2 h-2 rounded-full bg-pink-400"></div>
          </div>
        </div>
      </footer>

    </article>
  </div>
</template>

<style scoped>
/* 字体系统 */
.color-container {
  font-family: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", sans-serif;
}

/* 内容排版 */
.prose-color {
  line-height: 1.75;
  color: #334155;
  --ast-paragraph-color: #334155;
  --ast-heading-color: #1e293b;
  --ast-link-color: #0f766e;
  --ast-table-cell-color: #334155;
  --ast-blockquote-color: #475569;
  --ast-inline-code-color: #0f172a;
  --ast-pseudo-color: #334155;
  --ast-code-meta-color: #475569;
}

.dark .prose-color {
  color: #cbd5e1;
  --ast-paragraph-color-dark: #cbd5e1;
  --ast-heading-color: #f1f5f9;
  --ast-link-color: #5eead4;
  --ast-table-cell-color-dark: #cbd5e1;
  --ast-blockquote-color-dark: #cbd5e1;
  --ast-inline-code-bg-dark: rgba(148, 163, 184, 0.2);
  --ast-inline-code-color-dark: #e2e8f0;
  --ast-blockquote-bg-dark: transparent;
  --ast-pseudo-color-dark: #cbd5e1;
  --ast-code-meta-color-dark: #cbd5e1;
}

:deep(p),
:deep(.ast-paragraph) {
  margin-bottom: 1.25rem;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: #334155;
}

.dark .prose-color :deep(p),
.dark .prose-color :deep(.ast-paragraph) {
  color: #cbd5e1;
}

:deep(h3),
:deep(.ast-heading),
:deep(.ast-heading-3),
:deep(.ast-heading-4),
:deep(.ast-heading-5),
:deep(.ast-heading-6) {
  color: #1e293b;
}

.dark .prose-color :deep(h3),
.dark .prose-color :deep(.ast-heading),
.dark .prose-color :deep(.ast-heading-3),
.dark .prose-color :deep(.ast-heading-4),
.dark .prose-color :deep(.ast-heading-5),
.dark .prose-color :deep(.ast-heading-6) {
  color: #f1f5f9;
}

:deep(a),
:deep(.ast-link) {
  color: #0f766e;
}

.dark .prose-color :deep(a),
.dark .prose-color :deep(.ast-link) {
  color: #5eead4;
}

:deep(blockquote),
:deep(.ast-blockquote) {
  color: #475569;
}

.dark .prose-color :deep(blockquote),
.dark .prose-color :deep(.ast-blockquote) {
  color: #cbd5e1;
}

:deep(code),
:deep(.ast-inline-code) {
  color: #0f172a;
}

.dark .prose-color :deep(code),
.dark .prose-color :deep(.ast-inline-code) {
  color: #e2e8f0;
}

:deep(th) {
  color: #ffffff;
}

.dark .prose-color :deep(td),
.dark .prose-color :deep(.ast-table-cell) {
  color: #cbd5e1;
}

:deep(td),
:deep(.ast-table-cell) {
  color: #334155;
}

:deep(p) {
  margin-bottom: 1.25rem;
  font-size: 1.0625rem;
  line-height: 1.75;
}

:deep(h3) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #1e293b;
}

.dark .prose-color :deep(h3) {
  color: #f1f5f9;
}

/* 列表样式 - 彩色标记 */
:deep(ul) {
  list-style: none;
  padding-left: 0;
  margin: 1.5rem 0;
}

:deep(ul li) {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 0.75rem;
  list-style: none;
}

:deep(ul li::marker) {
  content: '';
}

:deep(ul li:nth-child(6n+1)::before) {
  background: linear-gradient(135deg, #fb7185, #f43f5e);
}

:deep(ul li:nth-child(6n+2)::before) {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

:deep(ul li:nth-child(6n+3)::before) {
  background: linear-gradient(135deg, #34d399, #10b981);
}

:deep(ul li:nth-child(6n+4)::before) {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
}

:deep(ul li:nth-child(6n+5)::before) {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
}

:deep(ul li:nth-child(6n+6)::before) {
  background: linear-gradient(135deg, #f472b6, #ec4899);
}

:deep(ul li::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 有序列表 - 彩色数字 */
:deep(ol) {
  list-style: none;
  padding-left: 0;
  margin: 1.5rem 0;
  counter-reset: color-counter;
}

:deep(ol li) {
  position: relative;
  padding-left: 3rem;
  margin-bottom: 1rem;
  counter-increment: color-counter;
  list-style: none;
}

:deep(ol li::marker) {
  content: '';
}

:deep(ol li::before) {
  content: counter(color-counter);
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
}

:deep(ol li:nth-child(6n+1)::before) {
  background: linear-gradient(135deg, #fb7185, #f43f5e);
}

:deep(ol li:nth-child(6n+2)::before) {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

:deep(ol li:nth-child(6n+3)::before) {
  background: linear-gradient(135deg, #34d399, #10b981);
}

:deep(ol li:nth-child(6n+4)::before) {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
}

:deep(ol li:nth-child(6n+5)::before) {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
}

:deep(ol li:nth-child(6n+6)::before) {
  background: linear-gradient(135deg, #f472b6, #ec4899);
}

/* 代码块 */
:deep(code) {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.9em;
  padding: 0.2em 0.5em;
  background: rgba(100, 100, 100, 0.1);
  border-radius: 0.375rem;
}

:deep(.shiki) {
  margin: 1.5rem 0 !important;
  padding: 1.5rem !important;
  border-radius: 1rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  border: none !important;
}

/* 引用块 - 彩色边框 */
:deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid;
  border-image: linear-gradient(to bottom, #fb7185, #fbbf24, #34d399, #38bdf8, #a78bfa) 1;
  background: linear-gradient(to right, rgba(251, 113, 133, 0.05), transparent);
  border-radius: 0 0.5rem 0.5rem 0;
}

/* 表格 */
:deep(table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.5rem 0;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(thead) {
  background: linear-gradient(to right, #fb7185, #fbbf24, #34d399, #38bdf8, #a78bfa);
}

:deep(th) {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
}

:deep(td) {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark .prose-color :deep(td) {
  border-bottom-color: #334155;
}

:deep(tbody tr:nth-child(6n+1)) {
  background: rgba(251, 113, 133, 0.05);
}

:deep(tbody tr:nth-child(6n+2)) {
  background: rgba(251, 191, 36, 0.05);
}

:deep(tbody tr:nth-child(6n+3)) {
  background: rgba(52, 211, 153, 0.05);
}

:deep(tbody tr:nth-child(6n+4)) {
  background: rgba(56, 189, 248, 0.05);
}

:deep(tbody tr:nth-child(6n+5)) {
  background: rgba(167, 139, 250, 0.05);
}

:deep(tbody tr:nth-child(6n+6)) {
  background: rgba(244, 114, 182, 0.05);
}

/* 动画 */
.content-card {
  animation: fade-slide-up 0.5s ease-out;
}

@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 640px) {
  .cover-colorful .bg-white {
    padding: 2rem !important;
  }

  .content-card > div {
    padding: 1.5rem !important;
  }

  .pl-18 {
    padding-left: 0 !important;
  }
}

/* 打印 */
@media print {
  .color-container {
    background: white;
  }

  .fixed {
    display: none;
  }

  .content-card {
    page-break-inside: avoid;
  }
}
</style>
