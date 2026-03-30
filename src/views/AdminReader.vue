<template>
  <div class="w-screen h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300 relative">
    <!-- Sidebar -->
    <transition name="slide-sidebar">
      <div
        v-if="showSidebar"
        class="w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 z-20 absolute md:relative"
      >
        <!-- Sidebar Header -->
        <div class="h-14 px-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <a href="/" class="flex items-center gap-2 outline-none group">
            <img src="/logo.png" alt="AIA Logo" class="w-5 h-5 object-contain" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-50 group-hover:text-[#40B3FF] transition-colors">
              AIA Admin
            </span>
          </a>

          <div class="flex items-center gap-1">
            <button
              @click="createNewArticle"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-[#40B3FF] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="新建文章"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>

            <button
              @click="fetchArticles"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="刷新列表"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M5.636 18.364A9 9 0 103.514 9.88M18.364 5.636A9 9 0 0120.486 14.12"/>
              </svg>
            </button>

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

            <button
              @click="showSidebar = false"
              class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="隐藏边栏"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                <line x1="9" y1="3" x2="9" y2="21" stroke-width="2"/>
                <path d="m15 15-3-3 3-3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Filter -->
        <div class="px-3 py-3 border-b border-gray-100 dark:border-gray-800">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索标题..."
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]"
          />
        </div>

        <!-- Article List -->
        <div class="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-5">
          <template v-for="(docs, groupName) in groupedArticles" :key="groupName">
            <div v-if="docs.length > 0">
              <div class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-2 px-2 flex items-center gap-1.5">
                <span class="w-1 h-3 bg-[#40B3FF] rounded-full"></span>
                {{ groupName }}
              </div>

              <div
                v-for="doc in docs"
                :key="doc.id"
                class="mb-1"
              >
                <button
                  @click="selectArticle(doc.id)"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex flex-col outline-none border"
                  :class="selectedId === doc.id
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-[#40B3FF] border-blue-100 dark:border-blue-900/50'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'"
                >
                  <span class="font-medium leading-tight text-[13px]">{{ doc.title }}</span>
                  <span class="text-[10px] opacity-50 mt-0.5 font-mono">
                    {{ doc.author }} · {{ doc.date || '暂无日期' }}
                  </span>
                </button>
              </div>
            </div>
          </template>

          <p v-if="isLoading && articles.length === 0" class="px-2 text-xs text-gray-400">
            正在加载文章列表...
          </p>

          <p v-if="error && articles.length === 0" class="px-2 text-xs text-red-500">
            {{ error }}
          </p>
        </div>
      </div>
    </transition>

    <!-- Main Content -->
    <div class="flex-1 h-full bg-white dark:bg-gray-950 relative w-full transition-colors flex overflow-hidden">
      <!-- Hint -->
      <transition name="fade-view">
        <div
          v-if="!showSidebar"
          class="fixed top-5 right-6 z-50 opacity-10 hover:opacity-100 transition-opacity pointer-events-none"
        >
          <span class="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-full border border-gray-700 dark:border-gray-600">
            按 <b>Esc</b> 恢复侧边栏
          </span>
        </div>
      </transition>

      <!-- Editor Panel -->
      <div class="w-1/2 h-full border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 min-w-0">
        <div class="h-14 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {{ isCreating ? '新建文章' : '编辑文章' }}
            </p>
            <p class="text-xs text-gray-400 truncate">
              {{ form.id || '未保存' }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span
              v-if="saveMessage"
              class="text-xs text-emerald-500"
            >
              {{ saveMessage }}
            </span>

            <button
              @click="resetForm"
              class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              重置
            </button>

            <button
              @click="saveArticle"
              :disabled="saving"
              class="px-3 py-1.5 text-xs rounded-lg bg-[#40B3FF] text-white hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>

            <button
              v-if="!isCreating && form.id"
              @click="deleteCurrentArticle"
              :disabled="saving || deleting"
              class="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {{ deleting ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">标题</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]"
                placeholder="请输入文章标题"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">作者</label>
              <input
                v-model="form.author"
                type="text"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]"
                placeholder="请输入作者"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">分类</label>
              <select
                v-model="form.category"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]"
              >
                <option value="activity">activity</option>
                <option value="tutorial">tutorial</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">展示模式</label>
              <select
                v-model="form.defaultMode"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]"
              >
                <option value="article">article</option>
                <option value="slide">slide</option>
                <option value="homework">homework</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">封面</label>
              <input
                v-model="form.cover"
                type="text"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]"
                placeholder="请输入封面 URL"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Markdown 内容</label>
            <textarea
              v-model="form.content"
              class="w-full min-h-[420px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-4 text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed resize-none outline-none focus:border-[#40B3FF]"
              placeholder="# 请输入正文"
            ></textarea>
          </div>

          <!-- Article Assets -->
          <div class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">文章静态资源</p>
                <p class="text-xs text-gray-400">
                  {{ form.id ? `作用域：/${form.id}` : '请先保存文章后再上传资源' }}
                </p>
              </div>

              <div class="text-xs text-gray-400">
                {{ articleAssets.length }} 项
              </div>
            </div>

            <div class="p-4 space-y-4">
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                <div class="lg:col-span-5">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    选择文件
                  </label>
                  <input
                    ref="assetFileInputRef"
                    type="file"
                    @change="handleAssetFileChange"
                    class="block w-full text-sm text-gray-700 dark:text-gray-200
                    file:mr-4 file:rounded-lg file:border-0 file:bg-[#40B3FF] file:px-4 file:py-2
                    file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                  />
                </div>

                <div class="lg:col-span-3">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    文件名（无后缀）
                  </label>
                  <input
                    v-model.trim="assetName"
                    type="text"
                    placeholder="例如 cover / index / demo"
                    class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]"
                  />
                </div>

                <div class="lg:col-span-2">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    覆盖同名
                  </label>
                  <label class="h-[42px] px-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-950">
                    <input v-model="assetOverwrite" type="checkbox" class="rounded border-gray-300" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">overwrite</span>
                  </label>
                </div>

                <div class="lg:col-span-2">
                  <button
                    @click="uploadArticleAsset"
                    :disabled="assetUploading || !form.id"
                    class="w-full rounded-lg bg-[#40B3FF] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {{ assetUploading ? `上传中 ${assetUploadProgress}%` : '上传资源' }}
                  </button>
                </div>
              </div>

              <p v-if="assetError" class="text-sm text-red-500">
                {{ assetError }}
              </p>
              <p v-if="assetSuccessMessage" class="text-sm text-emerald-500">
                {{ assetSuccessMessage }}
              </p>

              <div class="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div v-if="assetsLoading" class="px-4 py-10 text-center text-sm text-gray-400">
                  正在加载资源列表...
                </div>

                <div v-else-if="!form.id" class="px-4 py-10 text-center text-sm text-gray-400">
                  请先保存文章
                </div>

                <div v-else-if="articleAssets.length === 0" class="px-4 py-10 text-center text-sm text-gray-400">
                  暂无资源
                </div>

                <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
                  <div
                    v-for="asset in articleAssets"
                    :key="asset.path || asset.url || asset.filename"
                    class="px-4 py-3 flex items-center justify-between gap-4"
                  >
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
                        {{ asset.filename || asset.name || '未命名资源' }}
                      </p>
                      <p class="mt-1 text-xs text-gray-400">
                        {{ getAssetTypeLabel(asset) }}
                      </p>
                    </div>

                    <a
                      v-if="asset.url"
                      :href="asset.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      打开
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-if="error" class="text-sm text-red-500">
            {{ error }}
          </p>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="w-1/2 h-full relative overflow-y-auto custom-scrollbar transition-all duration-300">
        <div class="h-14 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur z-10">
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">实时预览</p>
            <p class="text-xs text-gray-400">{{ form.defaultMode }}</p>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="previewMode = 'article'"
              class="px-2.5 py-1 text-xs rounded-lg border transition-colors"
              :class="previewMode === 'article'
                ? 'border-[#40B3FF] text-[#40B3FF] bg-blue-50 dark:bg-blue-950/40'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'"
            >
              Article
            </button>
            <button
              @click="previewMode = 'slide'"
              class="px-2.5 py-1 text-xs rounded-lg border transition-colors"
              :class="previewMode === 'slide'
                ? 'border-[#40B3FF] text-[#40B3FF] bg-blue-50 dark:bg-blue-950/40'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'"
            >
              Slide
            </button>
            <button
              @click="previewMode = 'homework'"
              class="px-2.5 py-1 text-xs rounded-lg border transition-colors"
              :class="previewMode === 'homework'
                ? 'border-[#40B3FF] text-[#40B3FF] bg-blue-50 dark:bg-blue-950/40'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'"
            >
              Homework
            </button>
          </div>
        </div>

        <transition name="fade-view" mode="out-in">
          <HomeworkView
            v-if="previewMode === 'homework'"
            :slides="parsedSlides"
          />
          <SlideView
            v-else-if="previewMode === 'slide' && parsedSlides.length > 0"
            :slide="parsedSlides[currentSlideIndex]"
          />
          <ArticleView
            v-else-if="previewMode === 'article'"
            :slides="parsedSlides"
          />
          <div
            v-else
            class="h-full flex items-center justify-center text-sm text-gray-400"
          >
            暂无可显示内容
          </div>
        </transition>

        <transition name="fade-view">
          <div
            v-if="previewMode === 'slide' && parsedSlides.length > 0"
            class="fixed bottom-5 right-6 z-50 opacity-30 hover:opacity-100 transition-opacity"
          >
            <div class="bg-gray-900 dark:bg-gray-800 text-white font-mono text-xs px-3 py-1.5 rounded-full border border-gray-700">
              {{ currentSlideIndex + 1 }} / {{ parsedSlides.length }}
            </div>
          </div>
        </transition>
      </div>
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
import { ref, computed, onMounted, onUnmounted, provide, type ComputedRef } from 'vue';
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

const ASSET_BASE_URL = 'http://localhost:8080/assets';

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

onMounted(async () => {
  await fetchArticles();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>