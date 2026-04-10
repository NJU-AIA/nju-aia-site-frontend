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
</script>

<template>
  <div class="soft-root min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-16 px-4">
    
    <article class="soft-paper max-w-3xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl shadow-xl shadow-stone-200/50 dark:shadow-black/50 overflow-hidden">
      
      <div class="paper-inner p-10 sm:p-16">
        
        <!-- 封面 -->
        <header v-if="slides.length > 0 && slides[0].type === 'cover'" class="cover-soft mb-16 pb-12 border-b border-stone-200/60 dark:border-slate-700/60">
          
          <div class="mb-4 flex items-center gap-3">
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200/60 to-transparent dark:via-amber-800/40"></div>
            <span class="text-xs tracking-widest text-stone-400 dark:text-slate-500 uppercase">{{ displayDate }}</span>
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200/60 to-transparent dark:via-amber-800/40"></div>
          </div>

          <h1 class="text-4xl sm:text-5xl font-light text-center text-stone-800 dark:text-slate-100 mb-8 leading-relaxed tracking-wide">
            {{ slides[0].title }}
          </h1>

          <div v-if="author" class="text-center mb-10">
            <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/20 dark:to-rose-950/20">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-rose-200 dark:from-amber-800 dark:to-rose-800 flex items-center justify-center text-stone-700 dark:text-stone-200 font-medium text-sm">
                {{ author[0] }}
              </div>
              <span class="text-stone-600 dark:text-slate-400">{{ author }}</span>
            </div>
          </div>

          <div v-if="slides[0].elements.length > 0" class="prose-soft text-center">
            <AstRenderer v-for="(el, idx) in slides[0].elements" :key="idx" :node="el" />
          </div>
        </header>

        <!-- 主内容 -->
        <main class="main-soft space-y-12">
          <template v-for="(slide, index) in contentSlides" :key="index">
            <section class="content-section">
              
              <!-- 章节内容 -->
              <div v-if="!slide.isContinuation" class="question-soft mb-8">
                
                <div class="flex items-start gap-4 mb-6">
                  <div class="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-900/40 dark:to-rose-900/40 flex items-center justify-center text-stone-700 dark:text-stone-300 font-medium shadow-sm">
                    {{ index + 1 }}
                  </div>
                  <h2 class="flex-1 text-2xl font-light text-stone-800 dark:text-slate-100 pt-1">
                    {{ slide.title }}
                  </h2>
                </div>

                <div class="question-content ml-14 p-6 rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/30 dark:from-amber-950/10 dark:to-rose-950/10 border border-stone-200/40 dark:border-slate-700/40">
                  <div class="prose-soft">
                    <AstRenderer v-for="(el, idx) in slide.elements" :key="'q'+idx" :node="el" />
                  </div>
                </div>
              </div>

              <!-- 续写内容 -->
              <div v-else class="solution-soft ml-14 mt-6">
                
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                <span class="text-sm text-stone-500 dark:text-slate-400 tracking-wide">Continuation</span>
                  <div class="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent dark:from-slate-700"></div>
                </div>

                <div class="prose-soft pl-9">
                  <AstRenderer v-for="(el, idx) in slide.elements" :key="'a'+idx" :node="el" />
                </div>

                <!-- 结束标记 -->
                <div class="flex justify-end mt-6 pl-9">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-slate-600"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-slate-500"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-slate-600"></div>
                  </div>
                </div>
              </div>

            </section>

            <!-- 章节分隔 -->
            <div v-if="index < contentSlides.length - 1" class="section-divider my-12">
              <div class="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent dark:via-slate-700"></div>
            </div>
          </template>
        </main>

        <!-- 页脚 -->
        <footer class="footer-soft mt-16 pt-8">
          <div class="h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent dark:via-amber-800/40 mb-6"></div>
          <div class="text-center text-xs tracking-wider text-stone-400 dark:text-slate-500 uppercase">
            素雅视图
          </div>
        </footer>

      </div>
    </article>
  </div>
</template>

<style scoped>
/* 温润的字体系统 */
.soft-paper {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "kern";
}

/* 内容排版 */
.prose-soft {
  line-height: 1.9;
  color: #57534e;
}

.dark .soft-root .prose-soft {
  color: #d6d3d1;
}

:deep(p) {
  margin-bottom: 1.25rem;
  font-size: 1.0625rem;
  line-height: 1.9;
  color: #57534e;
}

.dark .soft-root :deep(p) {
  color: #d6d3d1;
}

/* 标题 */
:deep(h3) {
  font-size: 1.375rem;
  font-weight: 400;
  margin-top: 2rem;
  margin-bottom: 0.875rem;
  color: #44403c;
}

.dark .soft-root :deep(h3) {
  color: #e7e5e4;
}

:deep(h4) {
  font-size: 1.125rem;
  font-weight: 500;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #57534e;
}

.dark .soft-root :deep(h4) {
  color: #d6d3d1;
}

/* 列表 - 柔和的标记 */
:deep(ul) {
  list-style: none;
  padding-left: 0;
  margin: 1.5rem 0;
}

:deep(ul li) {
  position: relative;
  padding-left: 1.75rem;
  margin-bottom: 0.75rem;
}

:deep(ul li::marker) {
  content: '';
}

:deep(ul li::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0.75em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f87171);
  opacity: 0.6;
}

:deep(ol) {
  list-style: none;
  padding-left: 0;
  margin: 1.5rem 0;
  counter-reset: soft-counter;
}

:deep(ol li) {
  position: relative;
  padding-left: 2.5rem;
  margin-bottom: 1rem;
  counter-increment: soft-counter;
  list-style: none;
}

:deep(ol li::marker) {
  content: '';
}

:deep(ol li::before) {
  content: counter(soft-counter);
  position: absolute;
  left: 0;
  top: 0.1em;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #fef3c7, #fecaca);
  color: #78716c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 500;
}

.dark .soft-root :deep(ol li::before) {
  background: linear-gradient(135deg, #78350f, #7f1d1d);
  color: #d6d3d1;
}

/* 引用 - 温柔的强调 */
:deep(blockquote) {
  margin: 1.75rem 0;
  padding: 1rem 1.5rem;
  border-left: 3px solid #fbbf24;
  background: linear-gradient(to right, rgba(251, 191, 36, 0.05), transparent);
  border-radius: 0 1rem 1rem 0;
  color: #78716c;
}

.dark .soft-root :deep(blockquote) {
  border-left-color: #78350f;
  background: linear-gradient(to right, rgba(120, 53, 15, 0.1), transparent);
  color: #a8a29e;
}

/* 代码 - 柔和的背景 */
:deep(code) {
  font-family: "SF Mono", "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  padding: 0.2em 0.5em;
  background: linear-gradient(to right, #fef3c7, #fecaca);
  border-radius: 0.375rem;
  color: #78716c;
}

.dark .soft-root :deep(code) {
  background: linear-gradient(to right, #78350f, #7f1d1d);
  color: #d6d3d1;
}

/* 代码块 */
:deep(.shiki) {
  margin: 1.75rem 0 !important;
  padding: 1.5rem !important;
  border-radius: 1rem !important;
  border: 1px solid #e7e5e4 !important;
  background: #fafaf9 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.dark .soft-root :deep(.shiki) {
  border-color: #44403c !important;
  background: #1c1917 !important;
}

/* 表格 - 圆润柔和 */
:deep(table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.75rem 0;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(thead) {
  background: linear-gradient(to right, #fef3c7, #fecaca);
}

.dark .soft-root :deep(thead) {
  background: linear-gradient(to right, #78350f, #7f1d1d);
}

:deep(th) {
  padding: 0.875rem 1.25rem;
  text-align: left;
  font-weight: 500;
  color: #78716c;
  font-size: 0.9375rem;
}

.dark .soft-root :deep(th) {
  color: #e7e5e4;
}

:deep(td) {
  padding: 0.875rem 1.25rem;
  border-top: 1px solid #f5f5f4;
  color: #57534e;
}

.dark .soft-root :deep(td) {
  border-top-color: #292524;
  color: #d6d3d1;
}

:deep(tbody tr:hover) {
  background: rgba(251, 191, 36, 0.03);
}

/* 链接 - 温和的下划线 */
:deep(a) {
  color: #d97706;
  text-decoration: none;
  border-bottom: 1px dotted #fbbf24;
  transition: border-bottom-color 0.2s ease;
}

:deep(a:hover) {
  border-bottom-color: #d97706;
}

.dark .soft-root :deep(a) {
  color: #fbbf24;
  border-bottom-color: #78350f;
}

.dark .soft-root :deep(a:hover) {
  border-bottom-color: #fbbf24;
}

/* 强调 */
:deep(strong) {
  font-weight: 600;
  color: #44403c;
}

.dark .soft-root :deep(strong) {
  color: #fafaf9;
}

:deep(em) {
  font-style: italic;
  color: #78716c;
}

.dark .soft-root :deep(em) {
  color: #a8a29e;
}

/* 水平线 */
:deep(hr) {
  margin: 2.5rem 0;
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #e7e5e4, transparent);
}

.dark .soft-root :deep(hr) {
  background: linear-gradient(to right, transparent, #44403c, transparent);
}

/* 图片 */
:deep(img) {
  max-width: 100%;
  height: auto;
  margin: 2rem 0;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 柔和的动画 */
.content-section {
  animation: soft-fade-in 0.6s ease-out;
}

@keyframes soft-fade-in {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 打印 */
@media print {
  .soft-root {
    background: white;
    padding: 0;
  }

  .soft-paper {
    box-shadow: none;
    border-radius: 0;
    background: white !important;
  }

  .content-section {
    page-break-inside: avoid;
  }

  .soft-fade-in {
    animation: none;
  }
}

/* 响应式 */
@media (max-width: 640px) {
  .paper-inner {
    padding: 2rem !important;
  }

  .question-content,
  .solution-soft {
    margin-left: 0 !important;
  }

  h1 {
    font-size: 2rem !important;
  }

  h2 {
    font-size: 1.5rem !important;
  }
}

/* 选中文本 */
::selection {
  background: rgba(251, 191, 36, 0.2);
  color: #78716c;
}

.dark .soft-root ::selection {
  background: rgba(120, 53, 15, 0.3);
  color: #fafaf9;
}
</style>
