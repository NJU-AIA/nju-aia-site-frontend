<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue';
import { api, type DocumentMeta, type ViewMode } from '@/api/client'; 
import { useTheme } from '@/composables/useTheme'; 
import { parseMarkdownToSlides, type SlideNode } from '@/core/parser';

import HomeworkView from '@/components/HomeworkView.vue';
import SlideView from '@/components/SlideView.vue';
import ArticleView from '@/components/ArticleView.vue'; 

const ASSET_BASE_URL = 'https://raw.githubusercontent.com/NJU-AIA/nju-aia.github.io/main/src';

const { isDark, toggleTheme } = useTheme();

const docList = ref<DocumentMeta[]>([]);
const currentDocId = ref<string>('');
const currentMarkdown = ref(''); 
const slides = ref<SlideNode[]>([]);

const showSidebar = ref(true); 
const showSourceEditor = ref(false);

const viewModes = ['homework', 'slides', 'article'] as const;
const currentViewMode = ref<ViewMode>('article');
const currentSlideIndex = ref(0);

const documentModes = ref<Record<string, ViewMode>>({});

provide('isDark', isDark);
provide('assetBaseUrl', ASSET_BASE_URL);

// 监听 Markdown 内容变化，实时解析
watch(currentMarkdown, (newVal) => {
  if (newVal) {
    slides.value = parseMarkdownToSlides(newVal);
  } else {
    slides.value = [];
  }
});

const groupedDocs = computed(() => {
  return {
    '活动推文': docList.value.filter(d => d.category === 'activity-posts'),
    '技术教程': docList.value.filter(d => d.category === 'tech-tutorials'),
  };
});

const getModeIcon = (mode: ViewMode) => {
  switch (mode) {
    case 'homework': return '📝';
    case 'slides': return '📺';
    case 'article': return '📄';
    default: return '📄';
  }
};

const cycleViewMode = (id: string) => {
  const currentModeForId = documentModes.value[id];
  if (!currentModeForId) return;

  const idx = viewModes.indexOf(currentModeForId);
  const nextMode = viewModes[(idx + 1) % viewModes.length];

  documentModes.value[id] = nextMode;

  if (id === currentDocId.value) {
    currentViewMode.value = nextMode;
    currentSlideIndex.value = 0; 
  }
};

const initData = async () => {
  try {
    docList.value = await api.getDocList();
    
    docList.value.forEach(doc => {
      if (!documentModes.value[doc.id]) {
        documentModes.value[doc.id] = doc.defaultMode;
      }
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    const initId = urlParams.get('id');

    if (initId && docList.value.some(d => d.id === initId)) {
      await loadDocument(initId);
    } else if (docList.value.length > 0) {
      await loadDocument(docList.value[0].id);
    }
  } catch (error) {
    console.error("初始化列表失败", error);
  }
};

const loadDocument = async (id: string) => {
  currentDocId.value = id;
  if (documentModes.value[id]) {
    currentViewMode.value = documentModes.value[id];
  }
  currentSlideIndex.value = 0;
  
  try {
    const data = await api.getDocContent(id);
    currentMarkdown.value = data.content; 
  } catch (error) {
    console.error("加载文档失败", error);
    currentMarkdown.value = "# 文档加载失败\n请确保后端 API 服务正常运行。";
  }
};

// 【修改点】：全局键盘事件重构，加入彩蛋逻辑和全局 Esc 接管
const handleKeydown = async(e: KeyboardEvent) => {
  const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);

  // 1. 全局 Esc 拦截（无论什么状态，即使在输入框内，也恢复默认视图并失焦）
  if (e.key === 'Escape') {
    showSidebar.value = true;
    showSourceEditor.value = false;
    if (isTyping) {
      (e.target as HTMLElement).blur();
    }
    return;
  }

  // 如果正在输入，屏蔽其他所有快捷键
  if (isTyping) return;

  // 2. 快捷键 E 触发源码编辑彩蛋
  if (e.key.toLowerCase() === 'e') {
    e.preventDefault();
    showSourceEditor.value = !showSourceEditor.value;
  }

  // 3. 幻灯片翻页逻辑
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
  initData();
  window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-gray-100 dark:bg-black flex transition-colors duration-300 relative">
    
    <transition name="slide-sidebar">
      <div v-if="showSidebar" class="w-[280px] h-full bg-white dark:bg-gray-950 border-r border-gray-300 dark:border-gray-800 flex flex-col shrink-0 z-20 absolute md:relative shadow-2xl md:shadow-none">
        
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <a href="/" class="flex items-center gap-2 font-extrabold hover:text-[#40B3FF] transition-colors outline-none text-sm">
            🏠 <span class="text-gray-800 dark:text-gray-200 tracking-wide">AIA Doc</span>
          </a>
          
          <div class="flex items-center gap-0.5">
            <button @click="showSourceEditor = !showSourceEditor" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" title="临时修改源码 (快捷键: E)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>

            <button @click="toggleTheme" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" title="明暗模式">
              <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <button @click="showSidebar = false" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" title="隐藏边栏 (Esc 恢复)">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                <line x1="9" y1="3" x2="9" y2="21" stroke-width="2"/>
                <path d="m15 15-3-3 3-3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-6">
          <template v-for="(docs, groupName) in groupedDocs" :key="groupName">
            <div v-if="docs.length > 0" class="mb-2">
              <div class="text-xs font-bold text-[#954CE9] dark:text-[#954CE9]/80 uppercase tracking-widest mb-3 px-2 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-[#40B3FF]"></span> {{ groupName }}
              </div>
              
              <div v-for="doc in docs" :key="doc.id" class="w-full flex items-center gap-1 mb-1.5">
                <button 
                  @click="cycleViewMode(doc.id)"
                  class="p-2.5 rounded-lg flex items-center justify-center text-xl transition-all h-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  title="点击切换渲染模式 (📝/📺/📄)"
                >
                  {{ getModeIcon(documentModes[doc.id]) }}
                </button>
                
                <button 
                  @click="loadDocument(doc.id)"
                  class="flex-1 text-left px-3 py-2.5 rounded-lg text-sm border transition-all flex flex-col outline-none"
                  :class="doc.id === currentDocId 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50 shadow-sm' 
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'"
                >
                  <span class="font-medium leading-tight">{{ doc.title }}</span>
                  <span class="text-[10px] opacity-60 mt-1 font-mono">{{ doc.date }}</span>
                </button>
              </div>

            </div>
          </template>
        </div>
      </div>
    </transition>

    <div class="flex-1 h-full bg-gray-200 dark:bg-[#09090b] relative w-full transition-colors flex overflow-hidden">
      
      <transition name="fade-view">
        <div v-if="!showSidebar || showSourceEditor" class="fixed top-6 right-8 z-50 opacity-10 hover:opacity-100 transition-opacity pointer-events-none">
          <span class="bg-gray-900/60 dark:bg-white/10 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10">按 <b>Esc</b> 恢复默认视图</span>
        </div>
      </transition>

      <div v-show="showSourceEditor" class="w-1/2 h-full border-r border-gray-300 dark:border-gray-800 flex flex-col shrink-0">
        <div class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 text-xs px-4 py-2 text-center border-b border-yellow-200 dark:border-yellow-900/50 flex justify-between items-center">
          <span>当前为临时修改模式，修改不会保存</span>
          <button @click="showSourceEditor = false" class="hover:text-black dark:hover:text-white" title="关闭源码">✖</button>
        </div>
        <textarea 
          v-model="currentMarkdown"
          class="flex-1 w-full p-6 bg-white dark:bg-[#0d1117] text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed resize-none outline-none custom-scrollbar"
        ></textarea>
      </div>

      <div :class="showSourceEditor ? 'w-1/2' : 'w-full'" class="h-full relative overflow-y-auto custom-scrollbar transition-all duration-300">
        <transition name="fade-view" mode="out-in">
          <HomeworkView v-if="currentViewMode === 'homework'" :slides="slides" />
          <SlideView v-else-if="currentViewMode === 'slides' && slides.length > 0" :slide="slides[currentSlideIndex]" />
          <ArticleView v-else-if="currentViewMode === 'article'" :slides="slides" />
        </transition>
      </div>
      
      <transition name="fade-view">
        <div v-if="currentViewMode === 'slides' && slides.length > 0" class="fixed bottom-6 right-8 z-50 opacity-30 hover:opacity-100 transition-opacity">
           <div class="bg-gray-800 text-white font-mono text-xs px-3 py-1.5 rounded-full backdrop-blur">{{ currentSlideIndex + 1 }} / {{ slides.length }}</div>
        </div>
      </transition>

    </div>
  </div>
</template>

<style>
/* 这里保留您之前的动画及自定义滚动条样式，无需变动 */
.fade-view-enter-active, .fade-view-leave-active { transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-view-enter-from { opacity: 0; transform: translateY(8px); }
.fade-view-leave-to { opacity: 0; transform: translateY(-8px); }
.slide-sidebar-enter-active, .slide-sidebar-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-sidebar-enter-from, .slide-sidebar-leave-to { transform: translateX(-100%); opacity: 0.2; }

.custom-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
:global(.dark) .custom-scrollbar { scrollbar-color: #334155 transparent; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 9999px; background-clip: padding-box; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #475569; }
</style>