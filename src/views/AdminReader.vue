<template>
  <div class="w-full h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-gray-950 flex transition-colors duration-300 relative">

    <!-- Sidebar -->
    <transition name="slide-sidebar">
      <div v-if="showSidebar"
        class="w-[240px] h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 z-20 absolute md:relative">

        <!-- Sidebar Header -->
        <div class="h-12 px-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <!-- <a href="/" class="flex items-center gap-2 outline-none group"> -->
            <!-- <img src="/logo.png" alt="AIA Logo" class="w-5 h-5 object-contain" /> -->
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-50 group-hover:text-[#40B3FF] transition-colors">
              AIA Admin
            </span>
          <!-- </a> -->
          <div class="flex items-center gap-0.5">
            <button @click="createNewArticle"
              class="p-1.5 rounded-lg text-gray-400 hover:text-[#40B3FF] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="新建文章">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <button @click="fetchArticles"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="刷新">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M5.636 18.364A9 9 0 103.514 9.88M18.364 5.636A9 9 0 0120.486 14.12"/>
              </svg>
            </button>
            <button @click="showSidebar = false"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="收起侧栏">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
          <input v-model="keyword" type="text" placeholder="搜索标题..."
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF] transition-colors" />
        </div>

        <!-- Article List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <template v-for="(docs, groupName) in groupedArticles" :key="groupName">
            <div v-if="docs.length > 0">
              <!-- Group Header: 可折叠 -->
              <button
                @click="toggleGroup(groupName)"
                class="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span class="flex items-center gap-1.5 text-xs font-medium text-[#40B3FF] uppercase tracking-widest">
                  <span class="w-1 h-3 bg-[#40B3FF] rounded-full"></span>
                  {{ groupName }}
                </span>
                <svg
                  class="w-3 h-3 text-gray-400 transition-transform duration-200"
                  :class="collapsedGroups[groupName] ? '-rotate-90' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <div v-show="!collapsedGroups[groupName]" class="px-2 pb-2">
                <button v-for="doc in docs" :key="doc.id"
                  @click="selectArticle(doc.id)"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex flex-col outline-none border mb-0.5"
                  :class="selectedId === doc.id
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-[#40B3FF] border-blue-100 dark:border-blue-900/50'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'">
                  <span class="font-medium leading-tight text-[13px] truncate">{{ doc.title }}</span>
                  <span class="text-[10px] opacity-50 mt-0.5 font-mono">{{ doc.author }} · {{ doc.date || '暂无日期' }}</span>
                </button>
              </div>
            </div>
          </template>

          <p v-if="isLoading && articles.length === 0" class="px-4 py-4 text-xs text-gray-400">正在加载文章列表...</p>
          <p v-if="error && articles.length === 0" class="px-4 py-4 text-xs text-red-500">{{ error }}</p>
        </div>

        <!-- Sidebar Footer -->
        <div class="h-10 px-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <button @click="toggleTheme"
            class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <svg v-if="isDark" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            {{ isDark ? '浅色模式' : '深色模式' }}
          </button>
          <span class="text-[10px] text-gray-300 dark:text-gray-700">{{ articles.length }} 篇</span>
        </div>
      </div>
    </transition>

    <!-- 侧栏收起时的展开按钮 -->
    <transition name="fade-view">
      <button v-if="!showSidebar"
        @click="showSidebar = true"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-5 h-12 bg-white dark:bg-gray-900 border border-l-0 border-gray-100 dark:border-gray-800 rounded-r-lg text-gray-400 hover:text-[#40B3FF] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
        title="展开侧栏">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </transition>

    <!-- Main Content: 编辑 + 预览，撑满剩余高度 -->
    <div class="flex-1 h-full flex overflow-hidden min-w-0">

      <!-- Editor Panel -->
      <div class="w-1/2 h-full border-r border-gray-100 dark:border-gray-800 flex flex-col min-w-0">

        <!-- Editor Toolbar -->
        <div class="h-12 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-white dark:bg-gray-950">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-1 h-4 bg-[#40B3FF] rounded-full shrink-0"></span>
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {{ isCreating ? '新建文章' : '编辑文章' }}
            </p>
            <code class="text-[10px] text-gray-400 font-mono truncate hidden lg:block">{{ form.id || '未保存' }}</code>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span v-if="saveMessage" class="text-xs text-emerald-500 mr-1">{{ saveMessage }}</span>
            <button @click="resetForm"
              class="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              重置
            </button>
            <button @click="saveArticle" :disabled="saving"
              class="px-2.5 py-1 text-xs rounded-lg bg-[#40B3FF] text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
              {{ saving ? '保存中...' : '保存' }}
            </button>
            <button v-if="!isCreating && form.id" @click="deleteCurrentArticle" :disabled="saving || deleting"
              class="px-2.5 py-1 text-xs rounded-lg border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 hover:bg-red-100 disabled:opacity-50 transition-colors">
              {{ deleting ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>

        <!-- Editor Body: 上方元数据 + 下方内容区 tabs -->
        <div class="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-950">

          <!-- 元数据区 -->
          <div class="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 space-y-3">
            <div>
              <label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">标题</label>
              <input v-model="form.title" type="text" placeholder="请输入文章标题"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF] transition-colors" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">作者</label>
                <input v-model="form.author" type="text" placeholder="作者"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF] transition-colors" />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">分类</label>
                <select v-model="form.category"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF] transition-colors">
                  <option value="activity">activity</option>
                  <option value="tutorial">tutorial</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">展示模式</label>
                <select v-model="form.defaultMode"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF] transition-colors">
                  <option value="article">article</option>
                  <option value="slide">slide</option>
                  <option value="homework">homework</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">封面 URL</label>
              <input v-model="form.cover" type="text" placeholder="https://..."
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF] transition-colors" />
            </div>
          </div>

          <!-- Markdown 内容 -->
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">Markdown 内容</label>
            <textarea v-model="form.content"
              class="w-full min-h-[320px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-3 text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed resize-none outline-none focus:border-[#40B3FF] transition-colors custom-scrollbar"
              placeholder="# 请输入正文"></textarea>
          </div>

          <!-- 静态资源区 -->
          <div class="px-5 py-4">
            <!-- 区块标题 -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-1 h-3.5 bg-[#40B3FF] rounded-full"></span>
                <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">文章静态资源</span>
                <code class="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded px-1.5 py-0.5">
                  {{ form.id ? `/${form.id}` : '未保存' }}
                </code>
              </div>
              <span class="text-[11px] text-gray-400 tabular-nums">{{ articleAssets.length }} 项</span>
            </div>

            <!-- 上传行 -->
            <div class="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <div class="col-span-2">
                  <label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">选择文件</label>
                  <input ref="assetFileInputRef" type="file" @change="handleAssetFileChange"
                    class="block w-full text-xs text-gray-600 dark:text-gray-300
                    file:mr-3 file:rounded-md file:border-0 file:bg-[#40B3FF]/10 file:px-3 file:py-1.5
                    file:text-xs file:font-medium file:text-[#40B3FF] hover:file:bg-[#40B3FF]/20 cursor-pointer transition-colors" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">文件名（无后缀）</label>
                  <input v-model.trim="assetName" type="text" placeholder="例如 cover"
                    class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF] transition-colors" />
                </div>
                <div class="flex flex-col justify-end gap-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="assetOverwrite" type="checkbox" class="rounded border-gray-300 w-3.5 h-3.5" />
                    <span class="text-xs text-gray-500 dark:text-gray-400">覆盖同名文件</span>
                  </label>
                  <button @click="uploadArticleAsset" :disabled="assetUploading || !form.id"
                    class="w-full rounded-lg bg-[#40B3FF] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {{ assetUploading ? `上传中 ${assetUploadProgress}%` : '上传资源' }}
                  </button>
                </div>
              </div>

              <div v-if="assetError" class="text-xs text-red-500">{{ assetError }}</div>
              <div v-if="assetSuccessMessage" class="text-xs text-emerald-500">{{ assetSuccessMessage }}</div>
            </div>

            <!-- 资源列表 -->
            <div class="mt-2 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div v-if="assetsLoading" class="py-8 text-center text-xs text-gray-400">正在加载...</div>
              <div v-else-if="!form.id" class="py-8 text-center text-xs text-gray-400">请先保存文章</div>
              <div v-else-if="articleAssets.length === 0" class="py-8 text-center text-xs text-gray-400">暂无资源</div>
              <div v-else class="divide-y divide-gray-50 dark:divide-gray-800">
                <div v-for="asset in articleAssets" :key="asset.path || asset.url || asset.filename"
                  class="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <div class="min-w-0 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <div class="min-w-0">
                      <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ asset.filename || asset.name || '未命名资源' }}</p>
                      <p class="text-[10px] text-gray-400 font-mono">{{ getAssetTypeLabel(asset) }}</p>
                    </div>
                  </div>
                  <a v-if="asset.url" :href="asset.url" target="_blank" rel="noopener noreferrer"
                    class="shrink-0 text-xs text-[#40B3FF] hover:underline">
                    打开
                  </a>
                </div>
              </div>
            </div>

            <p v-if="error" class="mt-3 text-xs text-red-500">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="w-1/2 h-full flex flex-col min-w-0">

        <!-- Preview Toolbar -->
        <div class="h-12 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-white dark:bg-gray-950">
          <div class="flex items-center gap-2">
            <span class="w-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></span>
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">实时预览</p>
            <code class="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded px-1.5 py-0.5">{{ form.defaultMode }}</code>
          </div>

          <div class="flex items-center gap-1">
            <button @click="previewMode = 'article'"
              class="px-2.5 py-1 text-xs rounded-lg border transition-colors"
              :class="previewMode === 'article'
                ? 'border-[#40B3FF] text-[#40B3FF] bg-blue-50 dark:bg-blue-950/40'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'">
              Article
            </button>
            <button @click="previewMode = 'slide'"
              class="px-2.5 py-1 text-xs rounded-lg border transition-colors"
              :class="previewMode === 'slide'
                ? 'border-[#40B3FF] text-[#40B3FF] bg-blue-50 dark:bg-blue-950/40'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'">
              Slide
            </button>
            <button @click="previewMode = 'homework'"
              class="px-2.5 py-1 text-xs rounded-lg border transition-colors"
              :class="previewMode === 'homework'
                ? 'border-[#40B3FF] text-[#40B3FF] bg-blue-50 dark:bg-blue-950/40'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'">
              Homework
            </button>
          </div>
        </div>

        <!-- Preview Body -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <transition name="fade-view" mode="out-in">
            <HomeworkView v-if="previewMode === 'homework'" :slides="parsedSlides" />
            <SlideView v-else-if="previewMode === 'slide' && parsedSlides.length > 0" :slide="parsedSlides[currentSlideIndex]" />
            <ArticleView v-else-if="previewMode === 'article'" :slides="parsedSlides" />
            <div v-else class="h-full flex items-center justify-center text-sm text-gray-400">暂无可显示内容</div>
          </transition>
        </div>

        <!-- Slide Counter -->
        <transition name="fade-view">
          <div v-if="previewMode === 'slide' && parsedSlides.length > 0"
            class="h-9 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
            <span class="font-mono text-xs text-gray-400">{{ currentSlideIndex + 1 }} / {{ parsedSlides.length }}</span>
          </div>
        </transition>
      </div>

    </div>
  </div>
</template>
<style>
.fade-view-enter-active,
.fade-view-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-view-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-view-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0.1;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

:global(.dark) .custom-scrollbar {
  scrollbar-color: #1e293b transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #cbd5e1;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #1e293b;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #334155;
}
</style>

<script setup lang="ts">

import { ref, computed, onMounted, onUnmounted, provide, type ComputedRef, reactive } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { articlesApi, type Article, type ArticleMode, type CreateArticleRequest } from '@/api/articles';
import { assetsApi, type AssetRecord } from '@/api/assets';
import { parseMarkdownToSlides, type SlideNode } from '@/core/parser';

import HomeworkView from '@/components/HomeworkView.vue';
import SlideView from '@/components/SlideView.vue';
import ArticleView from '@/components/ArticleView.vue';

type ArticleCategory = 'activity' | 'tutorial';

interface ArticleListItem {
  id: string;
  title: string;
  author: string;
  category: string;
  date: string;
  defaultMode: ArticleMode;
  cover?: string;
}

interface AdminFormState {
  id: string;
  title: string;
  author: string;
  category: ArticleCategory;
  content: string;
  cover: string;
  defaultMode: ArticleMode;
}

const { isDark, toggleTheme } = useTheme();

const showSidebar = ref(true);
const currentSlideIndex = ref(0);
const keyword = ref('');
const isLoading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const error = ref('');
const saveMessage = ref('');
const selectedId = ref('');
const isCreating = ref(false);

const articles = ref<ArticleListItem[]>([]);
const previewMode = ref<ArticleMode>('article');

const form = ref<AdminFormState>({
  id: '',
  title: '',
  author: '',
  category: 'activity',
  content: '',
  cover: '',
  defaultMode: 'article',
});

const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || '/assets';

const currentArticleId = computed(() => form.value.id) as ComputedRef<string>;

provide('isDark', isDark);
provide('assetBaseUrl', ASSET_BASE_URL);
provide('currentArticleId', currentArticleId);

const articleAssets = ref<AssetRecord[]>([]);
const assetsLoading = ref(false);
const assetUploading = ref(false);
const assetUploadProgress = ref(0);
const assetError = ref('');
const assetSuccessMessage = ref('');
const assetFileInputRef = ref<HTMLInputElement | null>(null);
const assetSelectedFile = ref<File | null>(null);
const assetName = ref('');
const assetOverwrite = ref(false);

function clearAssetMessage() {
  assetError.value = '';
  assetSuccessMessage.value = '';
}

function getAssetTypeLabel(asset: AssetRecord): string {
  return asset.ext || asset.contentType || 'unknown';
}

function handleAssetFileChange(event: Event) {
  clearAssetMessage();
  const target = event.target as HTMLInputElement;
  assetSelectedFile.value = target.files?.[0] || null;

  if (!assetName.value && assetSelectedFile.value) {
    const fileName = assetSelectedFile.value.name;
    const lastDotIndex = fileName.lastIndexOf('.');
    assetName.value = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
  }
}

async function fetchArticleAssets() {
  clearAssetMessage();

  if (!form.value.id) {
    articleAssets.value = [];
    return;
  }

  assetsLoading.value = true;
  try {
    const { data } = await assetsApi.getAssets({
      scope: form.value.id,
      kind: 'article',
      page: 1,
    });

    articleAssets.value = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : [];
  } catch (err) {
    articleAssets.value = [];
    assetError.value = err instanceof Error ? err.message : '加载文章资源失败';
  } finally {
    assetsLoading.value = false;
  }
}

async function uploadArticleAsset() {
  clearAssetMessage();

  if (!form.value.id) {
    assetError.value = '请先保存文章，再上传文章资源';
    return;
  }

  if (!assetSelectedFile.value) {
    assetError.value = '请先选择文件';
    return;
  }

  if (!assetName.value.trim()) {
    assetError.value = '请填写文件名（无后缀）';
    return;
  }

  if (assetName.value.includes('/')) {
    assetError.value = '文件名不能包含 /';
    return;
  }

  assetUploading.value = true;
  assetUploadProgress.value = 0;

  try {
    await assetsApi.uploadAsset(
      {
        scope: form.value.id,
        name: assetName.value.trim(),
        file: assetSelectedFile.value,
        overwrite: assetOverwrite.value,
      },
      (percent) => {
        assetUploadProgress.value = percent;
      }
    );

    assetSuccessMessage.value = '上传成功';
    assetSelectedFile.value = null;
    assetUploadProgress.value = 0;
    assetName.value = '';

    if (assetFileInputRef.value) {
      assetFileInputRef.value.value = '';
    }

    await fetchArticleAssets();
  } catch (err) {
    assetError.value = err instanceof Error ? err.message : '上传失败';
  } finally {
    assetUploading.value = false;
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function mapArticleToListItem(article: Article): ArticleListItem {
  return {
    id: article.id,
    title: article.title,
    author: article.author,
    category: article.category,
    date: formatDate(article.createdAt || article.updatedAt),
    defaultMode: article.defaultMode,
    cover: article.cover,
  };
}

function applyArticleToForm(article: Article) {
  form.value = {
    id: article.id,
    title: article.title || '',
    author: article.author || '',
    category: (article.category as ArticleCategory) || 'activity',
    content: article.content || '',
    cover: article.cover || '',
    defaultMode: article.defaultMode || 'article',
  };
  previewMode.value = form.value.defaultMode;
}

function resetForm() {
  saveMessage.value = '';
  error.value = '';

  if (isCreating.value) {
    form.value = {
      id: '',
      title: '',
      author: '',
      category: 'activity',
      content: '',
      cover: '',
      defaultMode: 'article',
    };
    previewMode.value = 'article';
    currentSlideIndex.value = 0;
    articleAssets.value = [];
    clearAssetMessage();
    return;
  }

  if (selectedId.value) {
    selectArticle(selectedId.value);
  }
}

function createNewArticle() {
  selectedId.value = '';
  isCreating.value = true;
  saveMessage.value = '';
  error.value = '';
  currentSlideIndex.value = 0;

  form.value = {
    id: '',
    title: '',
    author: '',
    category: 'activity',
    content: '',
    cover: '',
    defaultMode: 'article',
  };

  previewMode.value = 'article';
  articleAssets.value = [];
  assetSelectedFile.value = null;
  assetName.value = '';
  clearAssetMessage();
}

const filteredArticles = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return articles.value;

  return articles.value.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });
});

const groupedArticles = computed(() => ({
  活动推文: filteredArticles.value.filter((item) => item.category === 'activity'),
  技术教程: filteredArticles.value.filter((item) => item.category === 'tutorial'),
}));

const parsedSlides = computed<SlideNode[]>(() => {
  return form.value.content ? parseMarkdownToSlides(form.value.content) : [];
});

async function fetchArticles() {
  isLoading.value = true;
  error.value = '';

  try {
    const { data } = await articlesApi.getArticles();
    const items = Array.isArray(data.items) ? data.items : [];
    articles.value = items.map(mapArticleToListItem);

    if (!selectedId.value && !isCreating.value && articles.value.length > 0) {
      await selectArticle(articles.value[0].id);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败';
  } finally {
    isLoading.value = false;
  }
}

async function selectArticle(id: string) {
  if (!id) return;

  saveMessage.value = '';
  error.value = '';
  isCreating.value = false;
  selectedId.value = id;
  currentSlideIndex.value = 0;

  try {
    const { data } = await articlesApi.getArticleById(id);
    applyArticleToForm(data);
    await fetchArticleAssets();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文章失败';
    articleAssets.value = [];
  }
}

function buildPayload(): CreateArticleRequest {
  return {
    title: form.value.title.trim(),
    author: form.value.author.trim(),
    category: form.value.category,
    content: form.value.content,
    cover: form.value.cover.trim() || undefined,
    defaultMode: form.value.defaultMode,
  };
}

async function saveArticle() {
  error.value = '';
  saveMessage.value = '';

  if (!form.value.title.trim()) {
    error.value = '标题不能为空';
    return;
  }

  if (!form.value.author.trim()) {
    error.value = '作者不能为空';
    return;
  }

  if (!form.value.category.trim()) {
    error.value = '分类不能为空';
    return;
  }

  if (!form.value.content.trim()) {
    error.value = '内容不能为空';
    return;
  }

  saving.value = true;

  try {
    const payload = buildPayload();

    if (isCreating.value || !form.value.id) {
      const { data } = await articlesApi.createArticle(payload);
      saveMessage.value = '创建成功';
      isCreating.value = false;
      selectedId.value = data.id;
      form.value.id = data.id;
      await fetchArticles();
      await selectArticle(data.id);
    } else {
      await articlesApi.updateArticle(form.value.id, payload);
      saveMessage.value = '保存成功';
      await fetchArticles();
      await selectArticle(form.value.id);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败';
  } finally {
    saving.value = false;
  }
}

async function deleteCurrentArticle() {
  if (!form.value.id) return;

  const confirmed = window.confirm(`确认删除文章《${form.value.title || '未命名文章'}》吗？`);
  if (!confirmed) return;

  deleting.value = true;
  error.value = '';
  saveMessage.value = '';

  try {
    await articlesApi.deleteArticle(form.value.id);

    saveMessage.value = '删除成功';
    selectedId.value = '';
    isCreating.value = true;
    articleAssets.value = [];

    form.value = {
      id: '',
      title: '',
      author: '',
      category: 'activity',
      content: '',
      cover: '',
      defaultMode: 'article',
    };

    previewMode.value = 'article';
    currentSlideIndex.value = 0;

    await fetchArticles();

    if (articles.value.length > 0) {
      await selectArticle(articles.value[0].id);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除失败';
  } finally {
    deleting.value = false;
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);

  if (e.key === 'Escape') {
    showSidebar.value = true;
    if (isTyping) {
      (e.target as HTMLElement).blur();
    }
    return;
  }

  if (previewMode.value === 'slide' && parsedSlides.value.length > 0) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      if (!isTyping) {
        e.preventDefault();
        if (currentSlideIndex.value < parsedSlides.value.length - 1) {
          currentSlideIndex.value++;
        }
      }
    }

    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (!isTyping) {
        e.preventDefault();
        if (currentSlideIndex.value > 0) {
          currentSlideIndex.value--;
        }
      }
    }
  }

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    saveArticle();
  }
};

const collapsedGroups = reactive<Record<string, boolean>>({})
const toggleGroup = (groupName: string) => {
  collapsedGroups[groupName] = !collapsedGroups[groupName]
}

onMounted(async () => {
  await fetchArticles();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>