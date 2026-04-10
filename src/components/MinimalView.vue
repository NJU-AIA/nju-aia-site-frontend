<script setup lang="ts">
import type { SlideNode } from '../core/parser';
import AstRenderer from './AstRenderer.vue';

const props = defineProps<{
  slides: SlideNode[];
  title?: string;
  subtitle?: string;
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
  <div class="minimal-root min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
    
    <article class="minimal-article max-w-3xl mx-auto px-6 py-20 sm:px-8 lg:px-12">
      
      <!-- 封面 -->
      <header v-if="slides.length > 0 && slides[0].type === 'cover'" class="cover-minimal mb-24">
        <div class="mb-3 text-xs tracking-widest uppercase text-neutral-400">
          {{ displayDate }}
        </div>
        
        <h1 class="text-5xl sm:text-6xl font-light tracking-tight text-neutral-950 dark:text-neutral-50 mb-4 leading-tight">
          {{ slides[0].title }}
        </h1>
        
        <div v-if="subtitle" class="text-xl text-neutral-500 dark:text-neutral-400 font-light mb-12">
          {{ subtitle }}
        </div>

        <div v-if="slides[0].elements.length > 0" class="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800">
          <div class="prose-minimal">
            <AstRenderer v-for="(el, idx) in slides[0].elements" :key="idx" :node="el" />
          </div>
        </div>
      </header>

      <!-- 主体内容 -->
      <main class="main-content space-y-20">
        <template v-for="(slide, index) in contentSlides" :key="index">
          <section class="content-minimal">
            
            <!-- 标题部分 -->
            <div v-if="!slide.isContinuation" class="mb-12">
              <h2 class="text-3xl font-light text-neutral-950 dark:text-neutral-50 mb-8 tracking-tight">
                {{ slide.title }}
              </h2>
              
              <div class="prose-minimal">
                <AstRenderer v-for="(el, idx) in slide.elements" :key="'q'+idx" :node="el" />
              </div>
            </div>

            <!-- 继续内容 -->
            <div v-else class="continuation-minimal mt-12 pt-12 border-t border-neutral-100 dark:border-neutral-900">
              <div class="prose-minimal">
                <AstRenderer v-for="(el, idx) in slide.elements" :key="'a'+idx" :node="el" />
              </div>
            </div>

          </section>

          <!-- 章节分隔 -->
          <div v-if="index < contentSlides.length - 1" class="section-divider flex items-center justify-center my-20">
            <div class="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
          </div>
        </template>
      </main>

      <!-- 页脚 -->
      <footer class="footer-minimal mt-32 pt-12 border-t border-neutral-100 dark:border-neutral-900">
        <div class="text-center text-xs tracking-wider text-neutral-400 uppercase">
          End
        </div>
      </footer>

    </article>
  </div>
</template>

<style scoped>
/* 精心挑选的字体栈 - 优雅且现代 */
.minimal-root {
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Text", "Segoe UI", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-feature-settings: "kern", "liga", "calt";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.011em;
}

/* 内容排版 - 关注可读性 */
.prose-minimal {
  line-height: 1.75;
  color: #404040;
}

.dark .minimal-root .prose-minimal {
  color: #d4d4d4;
}

/* 段落间距 */
:deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.75;
  font-size: 1.0625rem;
  color: #404040;
}

.dark .minimal-root :deep(p) {
  color: #d4d4d4;
}

/* 标题 - 简约但有层次 */
:deep(h3) {
  font-size: 1.5rem;
  font-weight: 400;
  color: #171717;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.dark .minimal-root :deep(h3) {
  color: #fafafa;
}

:deep(h4) {
  font-size: 1.25rem;
  font-weight: 500;
  color: #262626;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.dark .minimal-root :deep(h4) {
  color: #f5f5f5;
}

/* 列表 - 极简风格 */
:deep(ul) {
  margin: 1.5rem 0;
  padding-left: 0;
  list-style: none;
}

:deep(ul li) {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.75;
}

:deep(ul li::marker) {
  content: '';
}

:deep(ul li::before) {
  content: "–";
  position: absolute;
  left: 0;
  color: #a3a3a3;
  font-weight: 300;
}

:deep(ol) {
  margin: 1.5rem 0;
  padding-left: 1.5rem;
  list-style: decimal;
  color: #737373;
}

:deep(ol li) {
  padding-left: 0.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.75;
}

/* 引用 - 纯净的边框 */
:deep(blockquote) {
  margin: 2rem 0;
  padding-left: 1.5rem;
  border-left: 2px solid #e5e5e5;
  color: #737373;
  font-style: italic;
}

.dark .minimal-root :deep(blockquote) {
  border-left-color: #404040;
  color: #a3a3a3;
}

/* 代码 - 低调但清晰 */
:deep(code) {
  font-family: "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", "Consolas", monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 3px;
  color: #262626;
  font-weight: 400;
}

.dark .minimal-root :deep(code) {
  background: #171717;
  border-color: #262626;
  color: #e5e5e5;
}

/* 代码块 - 克制的样式 */
:deep(.shiki) {
  margin: 2rem 0 !important;
  padding: 1.5rem !important;
  border-radius: 2px !important;
  border: 1px solid #e5e5e5 !important;
  background: #fafafa !important;
  font-size: 0.9rem !important;
  line-height: 1.7 !important;
  box-shadow: none !important;
}

.dark .minimal-root :deep(.shiki) {
  border-color: #262626 !important;
  background: #0a0a0a !important;
}

/* 表格 - 简洁的线条 */
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
  font-size: 0.95rem;
}

:deep(thead) {
  border-bottom: 2px solid #e5e5e5;
}

.dark .minimal-root :deep(thead) {
  border-bottom-color: #404040;
}

:deep(th) {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #171717;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.dark .minimal-root :deep(th) {
  color: #fafafa;
}

:deep(td) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f5f5f5;
  color: #404040;
}

.dark .minimal-root :deep(td) {
  border-bottom-color: #262626;
  color: #d4d4d4;
}

/* 链接 - 优雅的下划线 */
:deep(a) {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: #d4d4d4;
  text-underline-offset: 3px;
  transition: text-decoration-color 0.2s ease;
}

:deep(a:hover) {
  text-decoration-color: #737373;
}

.dark .minimal-root :deep(a) {
  text-decoration-color: #404040;
}

.dark .minimal-root :deep(a:hover) {
  text-decoration-color: #737373;
}

/* 强调 */
:deep(strong) {
  font-weight: 600;
  color: #171717;
}

.dark .minimal-root :deep(strong) {
  color: #fafafa;
}

:deep(em) {
  font-style: italic;
  color: #525252;
}

.dark .minimal-root :deep(em) {
  color: #a3a3a3;
}

/* 水平线 */
:deep(hr) {
  margin: 3rem 0;
  border: none;
  border-top: 1px solid #e5e5e5;
}

.dark .minimal-root :deep(hr) {
  border-top-color: #262626;
}

/* 图片 */
:deep(img) {
  max-width: 100%;
  height: auto;
  margin: 2rem 0;
  border-radius: 2px;
}

/* 打印优化 */
@media print {
  .minimal-root {
    background: white;
  }
  
  .minimal-article {
    padding: 0;
    max-width: 100%;
  }
  
  .content-minimal {
    page-break-inside: avoid;
  }
  
  :deep(code),
  :deep(.shiki) {
    border: 1px solid #e5e5e5 !important;
    background: white !important;
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .cover-minimal h1 {
    font-size: 2.5rem;
  }
  
  .content-minimal h2 {
    font-size: 1.875rem;
  }
  
  :deep(p) {
    font-size: 1rem;
  }
}

/* 选中文本的颜色 */
::selection {
  background: #e5e5e5;
  color: #171717;
}

.dark .minimal-root ::selection {
  background: #404040;
  color: #fafafa;
}
</style>
