<template>
  <div class="w-screen h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300 relative">
    <!-- Sidebar -->
    <transition name="slide-sidebar">
      <div
        v-if="showSidebar"
        class="w-65 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 z-20 absolute md:relative"
      >
        <!-- Sidebar Header -->
        <div class="h-14 px-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <a href="/" class="flex items-center gap-2 outline-none group">
            <img src="/logo.png" alt="AIA Logo" class="w-5 h-5 object-contain" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-50 group-hover:text-[#40B3FF] transition-colors">
              AIA Docs
            </span>
          </a>

          <div class="flex items-center gap-0.5">
            <!-- 同步当前文章 -->
            <button
              @click="syncCurrentDocument"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="同步当前文章最新内容"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M5.636 18.364A9 9 0 103.514 9.88M18.364 5.636A9 9 0 0120.486 14.12"/>
              </svg>
            </button>

            <!-- 临时编辑 -->
            <button
              @click="showSourceEditor = !showSourceEditor"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="临时修改源码 (快捷键: E)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>

            <!-- 主题 -->
            <button
              @click="toggleTheme"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="明暗模式"
            >
              <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <!-- 隐藏侧边栏 -->
            <button
              @click="showSidebar = false"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="隐藏边栏 (Esc 恢复)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                <line x1="9" y1="3" x2="9" y2="21" stroke-width="2"/>
                <path d="m15 15-3-3 3-3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Doc List -->
        <div class="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-5">
          <template v-for="(docs, groupName) in groupedDocs" :key="groupName">
            <div v-if="docs.length > 0">
              <div class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-2 px-2 flex items-center gap-1.5">
                <span class="w-1 h-3 bg-[#40B3FF] rounded-full"></span>
                {{ groupName }}
              </div>

              <div v-for="doc in docs" :key="doc.id" class="flex items-center gap-1 mb-1">
                <button
                  @click="cycleViewMode(doc.id)"
                  class="p-2 rounded-lg flex items-center justify-center shrink-0 text-gray-400 dark:text-gray-500 hover:text-[#40B3FF] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  title="切换渲染模式"
                >
                  <svg
                    v-if="documentModes[doc.id] === 'article'"
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>

                  <svg
                    v-else-if="documentModes[doc.id] === 'slides'"
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
                  </svg>

                  <svg
                    v-else
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </button>

                <button
                  @click="loadDocument(doc.id)"
                  class="flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all flex flex-col outline-none border"
                  :class="doc.id === currentDocId
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-[#40B3FF] border-blue-100 dark:border-blue-900/50'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'"
                >
                  <span class="font-medium leading-tight text-[13px]">{{ doc.title }}</span>
                  <span class="text-[10px] opacity-50 mt-0.5 font-mono">{{ doc.date }}</span>
                </button>
              </div>
            </div>
          </template>

          <p v-if="readerStore.error && docList.length === 0" class="px-2 text-xs text-red-500">
            {{ readerStore.error }}
          </p>
        </div>
      </div>
    </transition>

    <!-- Main Content -->
    <div class="flex-1 h-full bg-white dark:bg-gray-950 relative w-full transition-colors flex overflow-hidden">
      <!-- Hint -->
      <transition name="fade-view">
        <div
          v-if="!showSidebar || showSourceEditor"
          class="fixed top-5 right-6 z-50 opacity-10 hover:opacity-100 transition-opacity pointer-events-none"
        >
          <span class="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-full border border-gray-700 dark:border-gray-600">
            按 <b>Esc</b> 恢复默认视图
          </span>
        </div>
      </transition>

      <!-- Source Editor -->
      <div
        v-show="showSourceEditor"
        class="w-1/2 h-full border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0"
      >
        <div class="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs px-4 py-2 border-b border-amber-100 dark:border-amber-900/50 flex justify-between items-center">
          <span>临时修改模式，修改不会保存</span>

          <div class="flex items-center gap-2">
            <button
              @click="restoreLatestDocument"
              class="px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
              title="放弃当前修改，并同步最新文章内容"
            >
              还原
            </button>

            <button
              @click="showSourceEditor = false"
              class="hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
              title="关闭源码编辑器"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <textarea
          v-model="currentMarkdown"
          class="flex-1 w-full p-6 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed resize-none outline-none custom-scrollbar"
        ></textarea>
      </div>

      <!-- View -->
      <div
        :class="showSourceEditor ? 'w-1/2' : 'w-full'"
        class="h-full relative overflow-y-auto custom-scrollbar transition-all duration-300"
      >
        <transition name="fade-view" mode="out-in">
          <HomeworkView
            v-if="currentViewMode === 'homework'"
            :slides="slides"
          />
          <SlideView
            v-else-if="currentViewMode === 'slides' && slides.length > 0"
            :slide="slides[currentSlideIndex]"
          />
          <ArticleView
            v-else-if="currentViewMode === 'article'"
            :slides="slides"
          />
          <div
            v-else
            class="h-full flex items-center justify-center text-sm text-gray-400"
          >
            暂无可显示内容
          </div>
        </transition>
      </div>

      <!-- Slide Counter -->
      <transition name="fade-view">
        <div
          v-if="currentViewMode === 'slides' && slides.length > 0"
          class="fixed bottom-5 right-6 z-50 opacity-30 hover:opacity-100 transition-opacity"
        >
          <div class="bg-gray-900 dark:bg-gray-800 text-white font-mono text-xs px-3 py-1.5 rounded-full border border-gray-700">
            {{ currentSlideIndex + 1 }} / {{ slides.length }}
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style>
.fade-view-enter-active, .fade-view-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-view-enter-from { opacity: 0; transform: translateY(6px); }
.fade-view-leave-to { opacity: 0; transform: translateY(-6px); }
.slide-sidebar-enter-active, .slide-sidebar-leave-active { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-sidebar-enter-from, .slide-sidebar-leave-to { transform: translateX(-100%); opacity: 0.1; }

.custom-scrollbar { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
:global(.dark) .custom-scrollbar { scrollbar-color: #1e293b transparent; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 9999px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #cbd5e1; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1e293b; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #334155; }
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useReaderStore } from '@/stores/reader'

import HomeworkView from '@/components/HomeworkView.vue'
import SlideView from '@/components/SlideView.vue'
import ArticleView from '@/components/ArticleView.vue'

const ASSET_BASE_URL = 'https://cdn.jsdelivr.net/gh/NJU-AIA/nju-aia.github.io@main/src'

const { isDark, toggleTheme } = useTheme()
const readerStore = useReaderStore()
const route = useRoute()
const router = useRouter()

const showSidebar = ref(true)
const showSourceEditor = ref(false)
const currentSlideIndex = ref(0)

provide('isDark', isDark)
provide('assetBaseUrl', ASSET_BASE_URL)

const groupedDocs = computed(() => readerStore.groupedDocs)
const docList = computed(() => readerStore.docList)
const currentDocId = computed(() => readerStore.currentDocId)
const currentMarkdown = computed({
  get: () => readerStore.currentMarkdown,
  set: (val: string) => readerStore.updateCurrentMarkdown(val),
})
const slides = computed(() => readerStore.currentSlides)
const documentModes = computed(() => readerStore.documentModes)
const currentViewMode = computed(() => readerStore.currentViewMode)

const loadDocument = async (id: string) => {
  if (!id) return

  currentSlideIndex.value = 0
  await readerStore.loadDocument(id)

  router.replace({
    path: '/reader',
    query: { id },
  })
}

const cycleViewMode = (id: string) => {
  readerStore.cycleViewMode(id)
  if (id === readerStore.currentDocId) {
    currentSlideIndex.value = 0
  }
}

const syncCurrentDocument = async () => {
  if (!readerStore.currentDocId) return
  currentSlideIndex.value = 0
  await readerStore.refreshCurrentDocument()
}

const restoreLatestDocument = async () => {
  if (!readerStore.currentDocId) return
  currentSlideIndex.value = 0
  await readerStore.refreshCurrentDocument()
}

const initData = async () => {
  const initId = typeof route.query.id === 'string' ? route.query.id : ''

  // 先用缓存秒开
  if (readerStore.docList.length > 0) {
    if (initId && readerStore.docList.some(d => d.id === initId)) {
      await readerStore.loadDocument(initId)
    } else {
      const firstId = readerStore.docList[0].id
      await readerStore.loadDocument(firstId)
      router.replace({ path: '/reader', query: { id: firstId } })
    }
  }

  // 每次进入 Reader，都重新拉一次最新列表和基本信息
  await readerStore.fetchDocList()

  // 用最新列表校正当前文章
  const latestId = typeof route.query.id === 'string' ? route.query.id : ''

  if (latestId && readerStore.docList.some(d => d.id === latestId)) {
    if (!readerStore.currentDocId) {
      await readerStore.loadDocument(latestId)
    }
  } else if (readerStore.docList.length > 0) {
    const firstId = readerStore.docList[0].id
    if (readerStore.currentDocId !== firstId) {
      await readerStore.loadDocument(firstId)
    }
    router.replace({ path: '/reader', query: { id: firstId } })
  }
}

watch(
  () => route.query.id,
  async (newId) => {
    if (typeof newId === 'string' && newId && newId !== readerStore.currentDocId) {
      currentSlideIndex.value = 0
      await readerStore.loadDocument(newId)
    }
  }
)

const handleKeydown = (e: KeyboardEvent) => {
  const isTyping = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)

  if (e.key === 'Escape') {
    showSidebar.value = true
    showSourceEditor.value = false
    if (isTyping) {
      ;(e.target as HTMLElement).blur()
    }
    return
  }

  if (isTyping) return

  if (e.key.toLowerCase() === 'e') {
    e.preventDefault()
    showSourceEditor.value = !showSourceEditor.value
  }

  if (currentViewMode.value === 'slides' && slides.value.length > 0) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault()
      if (currentSlideIndex.value < slides.value.length - 1) {
        currentSlideIndex.value++
      }
    }

    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault()
      if (currentSlideIndex.value > 0) {
        currentSlideIndex.value--
      }
    }
  }
}

onMounted(() => {
  initData()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>