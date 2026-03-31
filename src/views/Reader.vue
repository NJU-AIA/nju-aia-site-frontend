<!-- Reader.vue -->
<template>
  <div class="mt-14 w-full h-full overflow-hidden bg-white dark:bg-gray-950 flex transition-colors duration-300 relative">

    <!-- ── Sidebar ── -->
    <transition name="slide-sidebar">
      <div
        v-if="showSidebar"
        class="w-[240px] h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 z-20 absolute md:relative"
      >
        <!-- Sidebar Header -->
        <div class="h-12 px-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <!-- <a href="/" class="flex items-center gap-2 outline-none group"> -->
            <!-- <img src="/logo.png" alt="AIA Logo" class="w-5 h-5 object-contain" /> -->
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-50 group-hover:text-[#40B3FF] transition-colors">
              AIA Docs
            </span>
          <!-- </a> -->

          <div class="flex items-center gap-0.5">
            <button
              @click="syncCurrentDocument"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="同步最新内容"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M5.636 18.364A9 9 0 103.514 9.88M18.364 5.636A9 9 0 0120.486 14.12"/>
              </svg>
            </button>

            <button
              @click="showSourceEditor = !showSourceEditor"
              class="p-1.5 rounded-lg transition-colors"
              :class="showSourceEditor
                ? 'text-[#40B3FF] bg-blue-50 dark:bg-blue-950/50'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'"
              title="临时编辑源码 (E)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>

            <button
              @click="toggleTheme"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="切换明暗模式"
            >
              <svg v-if="isDark" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <button
              @click="showSidebar = false"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="收起侧栏"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Doc List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar py-2">
          <template v-for="(docs, groupName) in groupedDocs" :key="groupName">
            <div v-if="docs.length > 0" class="mb-1">
              <!-- Group label -->
              <div class="flex items-center gap-1.5 px-4 py-2">
                <span class="w-1 h-3 bg-[#40B3FF] rounded-full"></span>
                <span class="text-[10px] font-semibold text-[#40B3FF] uppercase tracking-widest">{{ groupName }}</span>
              </div>

              <!-- Doc items -->
              <div class="px-2 space-y-0.5">
                <div
                  v-for="doc in docs"
                  :key="doc.id"
                  class="flex items-center gap-1 rounded-lg transition-colors"
                  :class="doc.id === currentDocId
                    ? 'bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'"
                >
                  <!-- Mode toggle icon -->
                  <button
                    @click="cycleViewMode(doc.id)"
                    class="p-2 shrink-0 rounded-lg transition-colors"
                    :class="doc.id === currentDocId
                      ? 'text-[#40B3FF]'
                      : 'text-gray-300 dark:text-gray-600 hover:text-[#40B3FF]'"
                    title="切换渲染模式"
                  >
                    <svg v-if="documentModes[doc.id] === 'article'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <svg v-else-if="documentModes[doc.id] === 'slide'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </button>

                  <!-- Doc title button -->
                  <button
                    @click="loadDocument(doc.id)"
                    class="flex-1 text-left py-2 pr-3 flex flex-col outline-none min-w-0"
                  >
                    <span
                      class="text-[13px] font-medium leading-snug truncate transition-colors"
                      :class="doc.id === currentDocId
                        ? 'text-[#40B3FF]'
                        : 'text-gray-700 dark:text-gray-300'"
                    >{{ doc.title }}</span>
                    <span class="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 font-mono">{{ doc.date }}</span>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <p v-if="readerStore.error && docList.length === 0" class="px-4 py-3 text-xs text-red-500">
            {{ readerStore.error }}
          </p>
        </div>

        <!-- Sidebar Footer -->
        <div class="h-10 px-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <span class="text-[10px] text-gray-300 dark:text-gray-700 font-mono">{{ docList.length }} 篇文章</span>
          <span class="text-[10px] text-gray-300 dark:text-gray-700">NJU AIA</span>
        </div>
      </div>
    </transition>

    <!-- 侧栏收起时的展开触发区 -->
    <transition name="fade-view">
      <div
        v-if="!showSidebar"
        class="absolute left-0 top-0 h-full w-1 z-30 group"
      >
        <!-- 悬停时展示展开按钮 -->
        <button
          @click="showSidebar = true"
          class="absolute top-1/2 -translate-y-1/2 -right-5 flex items-center justify-center w-5 h-10 bg-white dark:bg-gray-900 border border-l-0 border-gray-100 dark:border-gray-800 rounded-r-lg shadow-sm text-gray-400 hover:text-[#40B3FF] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100"
          title="展开侧栏"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </transition>

    <!-- ── Main Content ── -->
    <div class="flex-1 h-full flex overflow-hidden min-w-0 bg-white dark:bg-gray-950 transition-colors">

      <!-- Source Editor (临时编辑) -->
      <transition name="slide-editor">
        <div
          v-if="showSourceEditor"
          class="w-[340px] h-full border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0"
        >
          <div class="h-9 px-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between shrink-0">
            <span class="text-xs text-amber-600 dark:text-amber-400 font-medium">临时编辑模式</span>
            <div class="flex items-center gap-2">
              <button
                @click="restoreLatestDocument"
                class="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                title="还原最新内容"
              >还原</button>
              <button
                @click="showSourceEditor = false"
                class="text-amber-400 hover:text-amber-700 dark:hover:text-amber-200 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <textarea
            v-model="currentMarkdown"
            class="flex-1 w-full px-4 py-4 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-mono text-xs leading-relaxed resize-none outline-none custom-scrollbar"
            spellcheck="false"
          ></textarea>
        </div>
      </transition>

      <!-- View Area -->
      <div class="flex-1 h-full flex flex-col min-w-0 overflow-hidden">

        <!-- View Toolbar -->
        <div class="h-12 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <!-- 左侧：展开按钮 + 标题 -->
          <div class="flex items-center gap-3 min-w-0">
            <button
              v-if="!showSidebar"
              @click="showSidebar = true"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              title="展开侧栏"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                {{ currentDocTitle || '请选择文章' }}
              </p>
              <!-- <p class="text-[10px] text-gray-400 font-mono leading-tight mt-0.5">
                {{ currentDocId || '—' }}
              </p> -->
            </div>
          </div>

          <!-- 右侧：视图模式切换 + 幻灯片计数 -->
          <!-- <div class="flex items-center gap-1.5 shrink-0">
            <div
              v-if="currentViewMode === 'slide' && slides.length > 0"
              class="mr-2 font-mono text-xs text-gray-400 tabular-nums"
            >
              {{ currentSlideIndex + 1 }}&thinsp;/&thinsp;{{ slides.length }}
            </div>

            <button
              @click="cycleViewMode(currentDocId)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="切换渲染模式"
            >
              <svg v-if="currentViewMode === 'article'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <svg v-else-if="currentViewMode === 'slide'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span class="capitalize">{{ currentViewMode }}</span>
            </button>

            <button
              @click="showSourceEditor = !showSourceEditor"
              class="p-1.5 rounded-lg transition-colors"
              :class="showSourceEditor
                ? 'text-[#40B3FF] bg-blue-50 dark:bg-blue-950/50'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'"
              title="临时编辑 (E)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>

            <button
              @click="toggleTheme"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="切换明暗模式"
            >
              <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div> -->
        </div>

        <!-- Slide nav bar (仅 slide 模式) -->
        <transition name="fade-view">
          <div
            v-if="currentViewMode === 'slide' && slides.length > 0"
            class="h-9 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 shrink-0 overflow-x-auto custom-scrollbar"
          >
            <button
              v-for="(_, idx) in slides"
              :key="idx"
              @click="currentSlideIndex = idx"
              class="shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono transition-colors"
              :class="idx === currentSlideIndex
                ? 'bg-[#40B3FF] text-white'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >{{ idx + 1 }}</button>
          </div>
        </transition>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <transition name="fade-view" mode="out-in">
            <HomeworkView
              v-if="currentViewMode === 'homework'"
              :slides="slides"
            />
            <SlideView
              v-else-if="currentViewMode === 'slide' && slides.length > 0"
              :slide="slides[currentSlideIndex]"
            />
            <ArticleView
              v-else-if="currentViewMode === 'article'"
              :slides="slides"
            />
            <div
              v-else
              class="h-full flex flex-col items-center justify-center gap-3 text-gray-300 dark:text-gray-700"
            >
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-sm">请从左侧选择文章</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-view-enter-active, .fade-view-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-view-enter-from { opacity: 0; transform: translateY(4px); }
.fade-view-leave-to { opacity: 0; transform: translateY(-4px); }

.slide-sidebar-enter-active, .slide-sidebar-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-sidebar-enter-from, .slide-sidebar-leave-to { transform: translateX(-100%); opacity: 0; }

.slide-editor-enter-active, .slide-editor-leave-active { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-editor-enter-from, .slide-editor-leave-to { transform: translateX(-20px); opacity: 0; }

.custom-scrollbar { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #cbd5e1; }
:global(.dark) .custom-scrollbar { scrollbar-color: #1e293b transparent; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1e293b; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #334155; }
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useReaderStore } from '@/stores/reader';

import HomeworkView from '@/components/HomeworkView.vue';
import SlideView from '@/components/SlideView.vue';
import ArticleView from '@/components/ArticleView.vue';

const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || '/assets';

const { isDark, toggleTheme } = useTheme();
const readerStore = useReaderStore();
const route = useRoute();
const router = useRouter();

const showSidebar = ref(true);
const showSourceEditor = ref(false);
const currentSlideIndex = ref(0);

const groupedDocs = computed(() => readerStore.groupedDocs);
const docList = computed(() => readerStore.docList);
const currentDocId = computed(() => readerStore.currentDocId);
const currentDocTitle = computed(() => {
  const doc = readerStore.docList.find(d => d.id === readerStore.currentDocId);
  return doc?.title ?? '';
});
const currentMarkdown = computed({
  get: () => readerStore.currentMarkdown,
  set: (val: string) => readerStore.updateCurrentMarkdown(val),
});
const slides = computed(() => readerStore.currentSlides);
const documentModes = computed(() => readerStore.documentModes);
const currentViewMode = computed(() => readerStore.currentViewMode);

provide('isDark', isDark);
provide('assetBaseUrl', ASSET_BASE_URL);
provide('currentArticleId', currentDocId);

const loadDocument = async (id: string) => {
  if (!id) return;
  currentSlideIndex.value = 0;
  await readerStore.loadDocument(id);
  router.replace({ path: '/reader', query: { id } });
};

const cycleViewMode = (id: string) => {
  if (!id) return;
  readerStore.cycleViewMode(id);
  if (id === readerStore.currentDocId) {
    currentSlideIndex.value = 0;
  }
};

const syncCurrentDocument = async () => {
  if (!readerStore.currentDocId) return;
  currentSlideIndex.value = 0;
  await readerStore.refreshCurrentDocument();
};

const restoreLatestDocument = async () => {
  if (!readerStore.currentDocId) return;
  currentSlideIndex.value = 0;
  await readerStore.refreshCurrentDocument();
};

const initData = async () => {
  const initId = typeof route.query.id === 'string' ? route.query.id : '';

  if (readerStore.docList.length > 0) {
    if (initId && readerStore.docList.some((d) => d.id === initId)) {
      await readerStore.loadDocument(initId);
    } else if (readerStore.docList.length > 0) {
      const firstId = readerStore.docList[0].id;
      await readerStore.loadDocument(firstId);
      router.replace({ path: '/reader', query: { id: firstId } });
    }
  }

  await readerStore.fetchDocList();

  const latestId = typeof route.query.id === 'string' ? route.query.id : '';

  if (latestId && readerStore.docList.some((d) => d.id === latestId)) {
    if (!readerStore.currentDocId || readerStore.currentDocId !== latestId) {
      await readerStore.loadDocument(latestId);
    }
  } else if (readerStore.docList.length > 0) {
    const firstId = readerStore.docList[0].id;
    if (readerStore.currentDocId !== firstId) {
      await readerStore.loadDocument(firstId);
    }
    router.replace({ path: '/reader', query: { id: firstId } });
  }
};

watch(
  () => route.query.id,
  async (newId) => {
    if (typeof newId === 'string' && newId && newId !== readerStore.currentDocId) {
      currentSlideIndex.value = 0;
      await readerStore.loadDocument(newId);
    }
  }
);

const handleKeydown = (e: KeyboardEvent) => {
  const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);

  if (e.key === 'Escape') {
    showSidebar.value = true;
    showSourceEditor.value = false;
    if (isTyping) (e.target as HTMLElement).blur();
    return;
  }

  if (isTyping) return;

  if (e.key.toLowerCase() === 'e') {
    e.preventDefault();
    showSourceEditor.value = !showSourceEditor.value;
  }

  if (currentViewMode.value === 'slide' && slides.value.length > 0) {
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

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>