<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue';
import { parseMarkdownToSlides, type SlideNode } from './core/parser';

import HomeworkView from './components/HomeworkView.vue';
import SlideView from './components/SlideView.vue';
import ArticleView from './components/ArticleView.vue'; 

const fileList = ref<string[]>([]);
const currentFilePath = ref<string>('');
const currentMarkdown = ref(''); 
const slides = ref<SlideNode[]>([]);

const showSidebar = ref(true); 
const isDark = ref(false); 

const viewModes = ['homework', 'slides', 'article'] as const;
type ViewMode = typeof viewModes[number];
const currentViewMode = ref<ViewMode>('homework');

// 幻灯片当前页码状态
const currentSlideIndex = ref(0);

// 用于控制“正在导出”的 Loading 界面
const isExporting = ref(false);

// 核心标志：是否处于 Puppeteer 的纯净抓取模式
const isPdfExport = ref(false);

const currentDir = computed(() => {
  if (!currentFilePath.value) return '';
  const parts = currentFilePath.value.split('/');
  parts.pop();
  return parts.join('/');
});
provide('isDark', isDark);
provide('currentDir', currentDir);

const groupedFiles = computed(() => {
  const groups: Record<string, string[]> = { homework: [], slides: [], articles: [], others: [] };
  fileList.value.forEach(file => {
    const normalized = file.replace(/^\//, ''); 
    if (normalized.startsWith('homework/')) groups.homework.push(file);
    else if (normalized.startsWith('slides/')) groups.slides.push(file);
    else if (normalized.startsWith('articles/')) groups.articles.push(file);
    else groups.others.push(file);
  });
  return groups;
});

const fetchFiles = async () => {
  const res = await fetch('/api/files');
  fileList.value = await res.json();
  
  const urlParams = new URLSearchParams(window.location.search);
  const initFile = urlParams.get('file');
  const initMode = urlParams.get('mode');
  
  // 判断是否为后台抓取模式
  isPdfExport.value = urlParams.get('export') === 'true';

  // 【核心核武器 ☢️】：如果是导出模式，直接用最高优先级的 JS 内联样式，干掉所有的视口锁定！
  if (isPdfExport.value) {
    setTimeout(() => {
      [document.documentElement, document.body, document.getElementById('app')].forEach(el => {
        if (el) {
          el.style.setProperty('height', 'auto', 'important');
          el.style.setProperty('min-height', '100vh', 'important');
          el.style.setProperty('max-height', 'none', 'important');
          el.style.setProperty('overflow', 'visible', 'important');
          el.style.setProperty('position', 'static', 'important');
        }
      });
    }, 50); // 稍微延迟一下，确保 #app 已经挂载
  }

  if (initFile && fileList.value.includes(initFile)) {
    await loadFile(initFile);
    if (initMode) currentViewMode.value = initMode as ViewMode;
  } else if (fileList.value.length > 0 && !currentFilePath.value) {
    loadFile(fileList.value[0]);
  }
};

const loadFile = async (path: string) => {
  currentFilePath.value = path;
  
  const normalized = path.replace(/^\//, '');
  if (normalized.startsWith('homework/')) currentViewMode.value = 'homework';
  else if (normalized.startsWith('slides/')) currentViewMode.value = 'slides';
  else if (normalized.startsWith('articles/')) currentViewMode.value = 'article';
  
  isDark.value = currentViewMode.value === 'slides';
  currentSlideIndex.value = 0;

  const res = await fetch(`/api/read?path=${encodeURIComponent(path)}`);
  currentMarkdown.value = await res.text();
};

watch(currentMarkdown, (newMd) => {
  slides.value = parseMarkdownToSlides(newMd);
});

if (import.meta.hot) {
  import.meta.hot.on('md-update', (payload) => {
    if (payload.type === 'add' || payload.type === 'unlink') fetchFiles();
    if (payload.path === currentFilePath.value) loadFile(currentFilePath.value);
  });
}

const cycleViewMode = () => {
  const idx = viewModes.indexOf(currentViewMode.value);
  currentViewMode.value = viewModes[(idx + 1) % viewModes.length];
  currentSlideIndex.value = 0; 
};

const handleKeydown = async(e: KeyboardEvent) => {
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

  if (e.key.toLowerCase() === 'e') showSidebar.value = !showSidebar.value; 
  if (e.key.toLowerCase() === 't') isDark.value = !isDark.value; 
  if (e.key.toLowerCase() === 'm') cycleViewMode();
  
  // 拦截 Ctrl+P 触发无头浏览器导出
  if (e.key.toLowerCase() === 'p' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    if (isExporting.value) return; 
    
    isExporting.value = true;
    try {
      const exportUrl = `/api/export-pdf?file=${encodeURIComponent(currentFilePath.value)}&mode=${currentViewMode.value}`;
      const res = await fetch(exportUrl);
      
      if (!res.ok) throw new Error('导出失败，请检查终端日志');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const fileName = currentFilePath.value.split('/').pop()?.replace(/\.md$/, '.pdf') || 'export.pdf';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err);
    } finally {
      isExporting.value = false;
    }
  }

  // 幻灯片翻页快捷键
  if (currentViewMode.value === 'slides' && slides.value.length > 0) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      if (currentSlideIndex.value < slides.value.length - 1) currentSlideIndex.value++;
    }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentSlideIndex.value > 0) currentSlideIndex.value--;
    }
  }
};

onMounted(() => {
  fetchFiles();
  window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

const getDisplayName = (path: string) => path.split('/').pop() || path;
</script>

<template>
  <div :class="{ 'dark': isDark }">
    
    <div v-if="isPdfExport" class="bg-white dark:bg-[#09090b] min-h-screen">
      <HomeworkView v-if="currentViewMode === 'homework'" :slides="slides" />
      
      <div v-else-if="currentViewMode === 'slides'" class="w-full">
        <div 
          v-for="(slide, index) in slides" 
          :key="index" 
          style="width: 1920px; height: 1080px; page-break-after: always; overflow: hidden;"
        >
          <SlideView :slide="slide" />
        </div>
      </div>

      <ArticleView v-else-if="currentViewMode === 'article'" :slides="slides" />
    </div>

    <div v-else class="w-screen h-screen overflow-hidden bg-gray-100 dark:bg-black flex transition-colors duration-300 relative">
      
      <div v-if="showSidebar" class="w-[280px] h-full bg-white dark:bg-gray-950 border-r border-gray-300 dark:border-gray-800 flex flex-col shrink-0 z-20">
        <div class="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <span class="font-extrabold text-gray-800 dark:text-gray-200 tracking-wide">📦 Local Studio</span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-6">
          <template v-for="(files, groupName) in groupedFiles" :key="groupName">
            <div v-if="files.length > 0" class="mb-2">
              <div class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">
                {{ groupName }}
              </div>
              <button 
                v-for="file in files" :key="file"
                @click="loadFile(file)"
                class="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 truncate border transition-all flex items-center gap-2"
                :class="file === currentFilePath 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 shadow-sm' 
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'"
              >
                <span class="opacity-60">{{ file === currentFilePath ? '📄' : '📝' }}</span>
                {{ getDisplayName(file) }}
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="flex-1 h-full overflow-y-auto custom-scrollbar bg-gray-200 dark:bg-[#09090b] relative">
        <transition name="fade-view" mode="out-in">
          <HomeworkView v-if="currentViewMode === 'homework'" :slides="slides" />
          <SlideView v-else-if="currentViewMode === 'slides' && slides.length > 0" :slide="slides[currentSlideIndex]" />
          <ArticleView v-else-if="currentViewMode === 'article'" :slides="slides" />
        </transition>

        <div class="fixed bottom-6 right-8 flex gap-3 z-50">
          <div v-if="currentViewMode === 'slides' && slides.length > 0" class="bg-gray-800/80 text-white font-mono text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur flex items-center gap-2 mr-2">
            <span>{{ currentSlideIndex + 1 }} / {{ slides.length }}</span>
          </div>

          <div class="bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg border border-blue-500 flex items-center gap-2 uppercase tracking-wide cursor-pointer hover:bg-blue-700 transition" @click="cycleViewMode">
            <span>Mode: {{ currentViewMode }}</span>
            <span class="opacity-75 text-[10px]">(M)</span>
          </div>

          <div class="text-gray-500 dark:text-gray-400 font-mono text-xs flex gap-3 bg-white/90 dark:bg-gray-800/90 px-5 py-2.5 rounded-full backdrop-blur border border-gray-200 dark:border-gray-700 shadow-lg items-center">
            <span class="flex items-center gap-1"><kbd class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">T</kbd> 暗色</span>
            <span class="flex items-center gap-1"><kbd class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">E</kbd> 边栏</span>
            <span class="flex items-center gap-1"><kbd class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">Ctrl+P</kbd> PDF</span>
          </div>
        </div>
      </div>
      
      <transition name="fade-view">
        <div v-if="isExporting" class="absolute bottom-24 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 font-bold tracking-wide">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          正在调用核心引擎渲染高清 PDF...
        </div>
      </transition>

    </div>
  </div>
</template>

<style>
.fade-view-enter-active,
.fade-view-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-view-enter-from { opacity: 0; transform: translateY(10px); }
.fade-view-leave-to { opacity: 0; transform: translateY(-10px); }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }


:global(body.export-mode) #app {
  /* 强制解除视口锁定和内部滚动 */
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  background: white !important;
}

/* 核心：找到那个产生阴影和灰色边框的层 (.paper-sheet) */
:global(body.export-mode) .paper-sheet {
  /* 干掉学术风作业组件外层的阴影和多余内边距，使内容贴边，PDF 看起来干净 */
  box-shadow: none !important; 
  filter: none !important;
  padding: 0 !important; /* 让内容直接占满纸张 */
  width: 100% !important;
  max-width: none !important;
  border: none !important;
}

/* 确保内部容器也是纯白 */
:global(body.export-mode) .homework-container {
  background: white !important;
  padding: 0 !important;
}

/* 解除任何内部具有 overflow-y-auto 的容器，确保 Puppeteer 能垂直看完所有内容 */
:global(body.export-mode) .overflow-y-auto,
:global(body.export-mode) .custom-scrollbar,
:global(body.export-mode) .h-full,
:global(body.export-mode) .h-screen {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}
</style>