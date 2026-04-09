<script setup lang="ts">
import { computed } from 'vue';
import type { SlideNode } from '../core/parser';
import AstRenderer from './AstRenderer.vue';

const props = defineProps<{
  slides: SlideNode[];
  title?: string;
  author?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}>();

const contentSlides = computed(() =>
  props.slides
    .map((slide, index) => ({ ...slide, sectionId: `section-${index}` }))
    .filter((slide) => slide.type === 'content')
);

// 难度标签颜色
const difficultyConfig = computed(() => {
  const configs = {
    beginner: { label: '入门', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400' },
    intermediate: { label: '进阶', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400' },
    advanced: { label: '高级', color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400' },
  };
  return configs[props.difficulty || 'beginner'];
});

</script>

<template>
  <div class="tech-doc-container min-h-screen bg-slate-50 dark:bg-slate-950">
    <main class="overflow-y-auto">
      <div class="max-w-4xl mx-auto px-6 py-12 lg:px-12">
        
        <!-- 文档头部 -->
        <header v-if="slides.length > 0 && slides[0].type === 'cover'" class="mb-16">
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <span 
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
              :class="difficultyConfig.bg + ' ' + difficultyConfig.text"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              {{ difficultyConfig.label }}
            </span>
            <span class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
              教程
            </span>
          </div>

          <h1 class="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight tracking-tight">
            {{ slides[0].title }}
          </h1>

          <div v-if="author" class="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-8">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              {{ author[0] }}
            </div>
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ author }}</div>
              <div class="text-xs text-slate-500">技术作者</div>
            </div>
          </div>

          <div v-if="slides[0].elements.length > 0" class="prose prose-slate dark:prose-invert prose-lg max-w-none intro-section p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900/50">
            <AstRenderer v-for="(el, idx) in slides[0].elements" :key="idx" :node="el" />
          </div>
        </header>

        <!-- 内容章节 -->
        <div class="space-y-16">
          <template v-for="(slide, index) in contentSlides" :key="slide.sectionId">
            <section 
              :id="slide.sectionId"
              class="content-section scroll-mt-8"
            >
              
              <!-- 章节标题 -->
              <div v-if="!slide.isContinuation" class="section-header mb-8">
                <div class="flex items-center gap-4 mb-4">
                  <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white font-mono text-sm font-bold shadow-lg">
                    {{ index + 1 }}
                  </div>
                  <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 flex-1">
                    {{ slide.title }}
                  </h2>
                </div>
                <div class="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              </div>

              <!-- 继续标记 -->
              <div v-else class="flex items-center gap-3 mb-6 text-slate-500 dark:text-slate-400">
                <div class="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                <span class="text-xs font-mono uppercase tracking-wider">继续</span>
                <div class="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              </div>

              <!-- 内容区域 -->
              <div class="content-body prose prose-slate dark:prose-invert max-w-none prose-lg">
                <AstRenderer v-for="(el, idx) in slide.elements" :key="idx" :node="el" />
              </div>

            </section>
          </template>
        </div>

        <!-- 页脚 -->
        <footer class="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>技术文档</span>
            </div>
            <div>Created with Local Studio</div>
          </div>
        </footer>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* 专业技术文档字体 */
.tech-doc-container {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-feature-settings: "ss01", "cv11";
}

/* 代码块增强 */
:deep(.shiki) {
  border-radius: 0.75rem !important;
  padding: 1.5rem !important;
  border: 1px solid rgba(100, 120, 140, 0.1) !important;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08) !important;
  font-size: 0.9em !important;
  line-height: 1.7 !important;
  margin: 1.5rem 0 !important;
}

:deep(code) {
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", "Consolas", monospace;
  font-feature-settings: "liga", "calt";
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background: rgba(100, 120, 140, 0.1);
  border-radius: 0.375rem;
  font-weight: 500;
}

/* 提示框和警告框 */
:deep(blockquote) {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  border-radius: 0 0.5rem 0.5rem 0;
}

/* 标题锚点 */
.content-section:hover .section-header h2::before {
  content: "#";
  position: absolute;
  left: -1.5rem;
  color: #cbd5e1;
  font-weight: 400;
  opacity: 0;
  transition: opacity 0.2s;
}

.content-section:hover .section-header h2:hover::before {
  opacity: 1;
}

.section-header h2 {
  position: relative;
  scroll-margin-top: 2rem;
}

/* 列表样式 */
:deep(ul) {
  list-style: none;
  padding-left: 0;
}

:deep(ul li) {
  position: relative;
  padding-left: 1.75rem;
  margin-bottom: 0.75rem;
}

:deep(ul li::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  border-radius: 50%;
}

:deep(ol) {
  counter-reset: item;
  list-style: none;
  padding-left: 0;
}

:deep(ol li) {
  position: relative;
  padding-left: 2.5rem;
  margin-bottom: 1rem;
  counter-increment: item;
}

:deep(ol li::before) {
  content: counter(item);
  position: absolute;
  left: 0;
  top: 0.1em;
  width: 1.75rem;
  height: 1.75rem;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: "JetBrains Mono", monospace;
}

/* 表格样式 */
:deep(table) {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 1.5rem 0;
}

:deep(thead) {
  background: linear-gradient(to right, #1e293b, #334155);
  color: white;
}

:deep(th) {
  padding: 1rem 1.25rem;
  font-weight: 600;
  text-align: left;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(td) {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
}

:global(.dark) :deep(td) {
  border-top-color: #334155;
}

:global(.dark) :deep(code) {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

:global(.dark) :deep(blockquote) {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.14), transparent);
}

:deep(tbody tr:hover) {
  background: rgba(59, 130, 246, 0.05);
}

/* 打印样式 */
@media print {
  .tech-doc-container {
    background: white;
  }
  
  .content-section {
    page-break-inside: avoid;
  }
  
  :deep(.shiki) {
    box-shadow: none !important;
    border: 1px solid #e2e8f0 !important;
  }
}
</style>
