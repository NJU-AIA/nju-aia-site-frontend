<script setup lang="ts">
import { computed } from 'vue';
import type { SlideNode } from '../core/parser';
import AstRenderer from './AstRenderer.vue';

const props = defineProps<{
  slides: SlideNode[];
  studentName?: string;
  courseName?: string;
  date?: string;
}>();

const displayDate = props.date || new Date().toLocaleDateString('zh-CN', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// 内容幻灯片（排除封面）
const contentSlides = computed(() => props.slides.filter((s) => s.type === 'content'));
</script>

<template>
  <div class="elegant-container min-h-screen bg-white dark:bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8">
    
    <!-- 装饰性背景元素 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
      <div class="absolute top-20 right-20 w-96 h-96 bg-neutral-200/50 dark:bg-neutral-800/30 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-96 h-96 bg-neutral-300/40 dark:bg-neutral-700/20 rounded-full blur-3xl"></div>
    </div>

    <article class="elegant-paper relative max-w-5xl mx-auto bg-white dark:bg-neutral-900 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
      
      <!-- 封面区域 -->
      <header v-if="slides.length > 0 && slides[0].type === 'cover'" class="cover-section relative bg-neutral-950 text-white p-16 md:p-24">
        <!-- 装饰线条 -->
        <div class="absolute top-0 left-0 w-full h-1 bg-neutral-200 dark:bg-neutral-700"></div>
        <div class="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-white/15 rounded-tr-2xl"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-white/15 rounded-bl-2xl"></div>
        
        <div class="relative z-10">
          <div class="inline-block px-4 py-1 mb-6 text-sm font-medium tracking-widest uppercase bg-white/10 backdrop-blur rounded-full border border-white/15">
            {{ courseName || 'Feature Article' }}
          </div>
          
          <h1 class="text-5xl md:text-6xl font-bold mb-8 leading-tight text-white">
            {{ slides[0].title }}
          </h1>
          
          <div class="flex flex-wrap items-center gap-6 text-lg text-neutral-300 mb-8">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-bold">
                {{ (studentName || 'S')[0] }}
              </div>
              <span>{{ studentName || 'Author' }}</span>
            </div>
            <span class="text-neutral-600">•</span>
            <span>{{ displayDate }}</span>
          </div>

          <div v-if="slides[0].elements.length > 0" class="mt-12 pt-8 border-t border-white/10 text-neutral-200 prose prose-invert prose-lg max-w-none">
            <AstRenderer v-for="(el, idx) in slides[0].elements" :key="idx" :node="el" />
          </div>
        </div>
      </header>

      <!-- 主内容区域 -->
      <main class="content-section p-8 md:p-16 space-y-12">
        <template v-for="(slide, index) in contentSlides" :key="index">
          <section class="content-block group">
            
            <!-- 章节内容 -->
            <div v-if="!slide.isContinuation" class="question-section mb-10 animate-fade-in">
              <div class="flex items-start gap-4 mb-6">
                <!-- 章节编号 -->
                <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 font-bold text-lg shadow-lg shadow-neutral-500/20">
                  {{ index + 1 }}
                </div>
                
                <div class="flex-1">
                  <div class="inline-flex items-center gap-2 mb-2">
                    <span class="text-xs font-bold tracking-widest uppercase text-neutral-600 dark:text-neutral-400">Section</span>
                    <div class="h-px flex-1 bg-gradient-to-r from-neutral-200 to-transparent dark:from-neutral-700 w-16"></div>
                  </div>
                  <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    {{ slide.title }}
                  </h2>
                </div>
              </div>
              
              <div class="question-content relative ml-16 p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rotate-45 bg-white dark:bg-neutral-900 border-l border-b border-neutral-200 dark:border-neutral-700"></div>
                <div class="prose prose-slate dark:prose-invert max-w-none prose-lg">
                  <AstRenderer v-for="(el, idx) in slide.elements" :key="'q'+idx" :node="el" />
                </div>
              </div>
            </div>

            <!-- 续写内容 -->
            <div v-else class="solution-section ml-16 animate-fade-in-delay">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 shadow-lg shadow-neutral-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span class="text-sm font-bold tracking-widest uppercase text-neutral-600 dark:text-neutral-400">Continuation</span>
                <div class="h-px flex-1 bg-gradient-to-r from-neutral-200 to-transparent dark:from-neutral-700"></div>
              </div>
              
              <div class="solution-content p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <div class="prose prose-slate dark:prose-invert max-w-none prose-lg">
                  <AstRenderer v-for="(el, idx) in slide.elements" :key="'a'+idx" :node="el" />
                </div>
                
                <!-- 证毕符号 -->
                <div class="flex justify-end mt-6">
                  <div class="w-5 h-5 border-2 border-neutral-400 dark:border-neutral-500"></div>
                </div>
              </div>
            </div>

          </section>

          <!-- 分隔线 -->
          <div v-if="index < contentSlides.length - 1" class="divider-elegant flex items-center gap-4 my-12">
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700"></div>
            <div class="flex gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
            </div>
            <div class="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700"></div>
          </div>
        </template>
      </main>

      <!-- 页脚 -->
      <footer class="footer-section relative p-8 text-center bg-white dark:bg-neutral-900">
        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700"></div>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Created with Local Studio · {{ new Date().getFullYear() }}
        </p>
      </footer>

    </article>
  </div>
</template>

<style scoped>
/* 优雅的字体栈 */
.elegant-paper {
  font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  letter-spacing: -0.01em;
}

/* 动画 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 0.6s ease-out 0.2s both;
}

/* 深层样式覆盖 */
:deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
  color: #334155;
}

:global(.dark) :deep(p) {
  color: #cbd5e1;
}

:deep(h3),
:deep(h4) {
  color: #171717;
}

:global(.dark) :deep(h3),
:global(.dark) :deep(h4) {
  color: #fafafa;
}

:deep(a) {
  color: #171717;
}

:global(.dark) :deep(a) {
  color: #fafafa;
}

:deep(blockquote) {
  color: #525252;
}

:global(.dark) :deep(blockquote) {
  color: #d4d4d4;
}

:deep(code) {
  font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 0.25rem;
}

:global(.dark) :deep(code) {
  background: rgba(255, 255, 255, 0.08);
  color: #f5f5f5;
}

:deep(.shiki) {
  border-radius: 0.75rem !important;
  padding: 1.25rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

:global(.dark) :deep(.shiki) {
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.55) !important;
}

/* 悬停效果 */
.content-block:hover .question-content {
  transform: translateX(2px);
  transition: transform 0.3s ease;
}

/* 打印样式 */
@media print {
  .elegant-container {
    padding: 0;
    background: white;
  }
  
  .elegant-paper {
    box-shadow: none;
    border-radius: 0;
    background: white !important;
  }
  
  .fixed {
    display: none;
  }
  
  .content-block {
    page-break-inside: avoid;
  }
  
  .animate-fade-in,
  .animate-fade-in-delay {
    animation: none;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .cover-section {
    padding: 2rem !important;
  }
  
  .content-section {
    padding: 1.5rem !important;
  }
  
  .solution-section,
  .question-content {
    margin-left: 0 !important;
  }
}
</style>
