<!-- AssetManager.vue -->
<template>
  <main class="max-w-6xl mx-auto px-6 pt-8 pb-20">
    <div class="mb-10">
      <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-3">Assets</p>
      <h1 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
        静态资源管理
      </h1>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        管理文章私有资源与公共图片 / 视频 / 代码资源。
      </p>
    </div>

    <!-- Upload Panel -->
    <div class="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-2">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">资源类型</label>
          <select v-model="mode"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]">
            <option value="shared">公共资源</option>
            <option value="article">文章私有资源</option>
          </select>
        </div>

        <div v-if="mode === 'article'" class="lg:col-span-4">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">选择文章</label>
          <select v-model="selectedArticleId"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]">
            <option value="">请选择文章</option>
            <option v-for="article in articleOptions" :key="article.id" :value="article.id">
              {{ article.title }}（{{ article.id }}）
            </option>
          </select>
        </div>

        <div v-if="mode === 'article'" class="lg:col-span-3">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">文章 ID</label>
          <input :value="selectedArticleId" type="text" readonly
            class="w-full rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 outline-none" />
        </div>

        <div v-else class="lg:col-span-3">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">公共目录</label>
          <select v-model="sharedScope"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]">
            <option value="images">images</option>
            <option value="videos">videos</option>
            <option value="codes">codes</option>
            <option value="docs">docs</option>
          </select>
        </div>

        <div class="lg:col-span-3">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">文件名（无后缀）</label>
          <input v-model.trim="assetName" type="text" placeholder="例如 cover / banner"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF]" />
        </div>

        <div class="lg:col-span-2">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">覆盖同名</label>
          <label class="h-[38px] px-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-950">
            <input v-model="overwrite" type="checkbox" class="rounded border-gray-300" />
            <span class="text-sm text-gray-600 dark:text-gray-300">overwrite</span>
          </label>
        </div>

        <div class="lg:col-span-1 flex items-end">
          <button @click="fetchAssetList" :disabled="loading"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
            刷新
          </button>
        </div>
      </div>

      <div class="mt-5 border-t border-gray-100 dark:border-gray-800 pt-5">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div class="lg:col-span-5">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">选择文件</label>
            <input ref="fileInputRef" type="file" @change="handleFileChange"
              class="block w-full text-sm text-gray-600 dark:text-gray-300
              file:mr-4 file:rounded-lg file:border-0 file:bg-[#40B3FF] file:px-4 file:py-1.5
              file:text-sm file:font-medium file:text-white hover:file:opacity-90 cursor-pointer" />
          </div>

          <div class="lg:col-span-5">
            <div class="rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 px-4 py-2.5">
              <p class="text-xs text-gray-400">目标路径预览</p>
              <p class="mt-0.5 font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
                {{ previewPath || '请选择参数后生成路径' }}
              </p>
            </div>
          </div>

          <div class="lg:col-span-2">
            <button @click="uploadCurrentFile" :disabled="uploading || !selectedFile"
              class="w-full rounded-lg bg-[#40B3FF] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
              {{ uploading ? `上传中 ${uploadProgress}%` : '上传资源' }}
            </button>
          </div>
        </div>

        <p v-if="error" class="mt-3 text-xs text-red-500">{{ error }}</p>
        <p v-if="successMessage" class="mt-3 text-xs text-emerald-500">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Asset List -->
    <div class="mt-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span class="w-1 h-4 bg-[#40B3FF] rounded-full"></span>
            资源列表
          </h2>
          <p class="text-xs text-gray-400 mt-0.5 pl-3">{{ currentScopeLabel }}</p>
        </div>
        <span class="text-xs text-gray-400 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full">
          {{ normalizedAssets.length }} 项
        </span>
      </div>

      <div v-if="loading && normalizedAssets.length === 0" class="px-5 py-16 text-center text-sm text-gray-400">
        正在加载资源列表...
      </div>

      <div v-else-if="normalizedAssets.length === 0" class="px-5 py-16 text-center text-sm text-gray-400">
        暂无资源
      </div>

      <div v-else class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="asset in normalizedAssets" :key="asset.path || asset.url || asset.filename"
          class="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">

          <!-- Preview -->
          <div class="rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 overflow-hidden h-36 flex items-center justify-center">
            <img v-if="isImageAsset(asset)" :src="asset.url" :alt="asset.filename || asset.name || 'image'"
              class="w-full h-full object-contain" />
            <video v-else-if="isVideoAsset(asset)" :src="asset.url" controls preload="metadata"
              class="w-full h-full object-contain bg-black"></video>
            <div v-else class="flex flex-col items-center justify-center text-center p-3">
              <svg class="w-7 h-7 text-gray-300 dark:text-gray-600 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <p class="text-xs text-gray-400">{{ asset.ext || asset.contentType || 'unknown' }}</p>
            </div>
          </div>

          <!-- Info -->
          <div class="mt-3 min-w-0">
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 break-all leading-snug">
              {{ asset.filename || asset.name || '未命名资源' }}
            </h3>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span class="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[11px] font-medium text-[#40B3FF]">
                {{ asset.kind || '-' }}
              </span>
              <span class="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                {{ formatSize(asset.size) }}
              </span>
            </div>
            <p class="mt-1.5 text-[11px] text-gray-400 break-all font-mono">{{ asset.path || '-' }}</p>
          </div>

          <!-- Actions -->
          <div class="mt-3 flex flex-wrap gap-2">
            <a v-if="asset.url" :href="asset.url" target="_blank" rel="noopener noreferrer"
              class="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              打开
            </a>
            <button @click="copyText(asset.url || '')"
              class="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              复制 URL
            </button>
            <button @click="deleteAssetItem(asset.path || '')" :disabled="deletingPath === asset.path"
              class="rounded-lg border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-2.5 py-1.5 text-xs text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 disabled:opacity-50 transition-colors">
              {{ deletingPath === asset.path ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { assetsApi, type AssetKind, type AssetRecord } from '@/api/assets';
import { articlesApi, type Article } from '@/api/articles';

type ManagerMode = 'shared' | 'article';

interface ArticleOption {
  id: string;
  title: string;
}

const mode = ref<ManagerMode>('shared');
const sharedScope = ref('images');
const selectedArticleId = ref('');
const assetName = ref('');
const overwrite = ref(false);
const selectedFile = ref<File | null>(null);

const loading = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const deletingPath = ref('');

const error = ref('');
const successMessage = ref('');

const fileInputRef = ref<HTMLInputElement | null>(null);
const assets = ref<AssetRecord[] | { items?: AssetRecord[] }>([]);
const articleOptions = ref<ArticleOption[]>([]);

const currentScope = computed(() => {
  return mode.value === 'article' ? selectedArticleId.value.trim() : sharedScope.value.trim();
});

const currentKind = computed<AssetKind>(() => {
  return mode.value === 'article' ? 'article' : 'shared';
});

const currentScopeLabel = computed(() => {
  if (mode.value === 'article') {
    const currentArticle = articleOptions.value.find((item) => item.id === selectedArticleId.value);
    return selectedArticleId.value
      ? `文章私有 /${selectedArticleId.value} · ${currentArticle?.title || ''}`
      : '文章私有（未选择文章）';
  }

  return `公共资源 /${sharedScope.value.trim()}`;
});

const normalizedAssets = computed<AssetRecord[]>(() => {
  const data = assets.value;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
});

const previewPath = computed(() => {
  const filename = selectedFile.value?.name || '';
  if (!currentScope.value || !filename) return '';
  return `/${currentScope.value}/${filename}`;
});

function clearMessage() {
  error.value = '';
  successMessage.value = '';
}

function getExt(asset: AssetRecord): string {
  return (asset.ext || asset.filename?.split('.').pop() || '').toLowerCase();
}

function getContentType(asset: AssetRecord): string {
  return (asset.contentType || '').toLowerCase();
}

function isImageAsset(asset: AssetRecord): boolean {
  const ct = getContentType(asset);
  const ext = getExt(asset);
  return !!asset.url && (
    ct.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
  );
}

function isVideoAsset(asset: AssetRecord): boolean {
  const ct = getContentType(asset);
  const ext = getExt(asset);
  return !!asset.url && (
    ct.startsWith('video/') ||
    ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(ext)
  );
}

// function isCodeAsset(asset: AssetRecord): boolean {
//   const ext = getExt(asset);
//   return ['js', 'ts', 'tsx', 'jsx', 'py', 'go', 'java', 'cpp', 'c', 'rs', 'sh', 'json', 'yaml', 'yml', 'html', 'css', 'sql', 'md'].includes(ext);
// }

// function isDocAsset(asset: AssetRecord): boolean {
//   const ext = getExt(asset);
//   const ct = getContentType(asset);
//   return (
//     ct.includes('pdf') ||
//     ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(ext)
//   );
// }

function handleFileChange(event: Event) {
  clearMessage();
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files?.[0] || null;

  if (!assetName.value && selectedFile.value) {
    const fileName = selectedFile.value.name;
    const lastDotIndex = fileName.lastIndexOf('.');
    assetName.value = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
  }
}

function formatSize(size?: number) {
  if (!size && size !== 0) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

async function copyText(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    successMessage.value = '已复制到剪贴板';
    setTimeout(() => {
      if (successMessage.value === '已复制到剪贴板') successMessage.value = '';
    }, 1500);
  } catch {
    error.value = '复制失败';
  }
}

function validateScope() {
  if (mode.value === 'article') {
    if (!selectedArticleId.value.trim()) {
      error.value = '请先选择文章';
      return false;
    }
    return true;
  }

  const allowedSharedScopes = ['images', 'videos', 'codes', 'docs'];
  if (!allowedSharedScopes.includes(sharedScope.value.trim())) {
    error.value = '公共资源目录不合法';
    return false;
  }
  return true;
}

async function fetchArticles() {
  try {
    const { data } = await articlesApi.getArticles({ withAuth: true });
    const items = Array.isArray(data.items) ? data.items : [];
    articleOptions.value = items.map((item: Article) => ({
      id: item.id,
      title: item.title,
    }));
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文章列表失败';
  }
}

async function fetchAssetList() {
  clearMessage();

  if (!validateScope()) {
    assets.value = [];
    return;
  }

  loading.value = true;
  try {
    const { data } = await assetsApi.getAssets({
      scope: currentScope.value,
      kind: currentKind.value,
      page: 1,
    });
    assets.value = data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载资源失败';
  } finally {
    loading.value = false;
  }
}

async function uploadCurrentFile() {
  clearMessage();

  if (!validateScope()) return;

  if (!selectedFile.value) {
    error.value = '请先选择文件';
    return;
  }

  if (!assetName.value.trim()) {
    error.value = '请填写文件名主干';
    return;
  }

  if (assetName.value.includes('/')) {
    error.value = '文件名主干不能包含 /';
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    await assetsApi.uploadAsset(
      {
        scope: currentScope.value,
        name: assetName.value.trim(),
        file: selectedFile.value,
        overwrite: overwrite.value,
      },
      (percent) => {
        uploadProgress.value = percent;
      }
    );

    successMessage.value = '上传成功';
    selectedFile.value = null;
    uploadProgress.value = 0;

    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }

    await fetchAssetList();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '上传失败';
  } finally {
    uploading.value = false;
  }
}

async function deleteAssetItem(path: string) {
  clearMessage();

  if (!path) {
    error.value = '资源 path 不存在';
    return;
  }

  const confirmed = window.confirm(`确认删除资源？\n${path}`);
  if (!confirmed) return;

  deletingPath.value = path;

  try {
    await assetsApi.deleteAsset(path);
    successMessage.value = '删除成功';
    await fetchAssetList();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除失败';
  } finally {
    deletingPath.value = '';
  }
}

watch(mode, async () => {
  assets.value = [];
  clearMessage();
  await fetchAssetList();
});

watch(sharedScope, async () => {
  if (mode.value !== 'shared') return;
  assets.value = [];
  clearMessage();
  await fetchAssetList();
});

watch(selectedArticleId, async () => {
  if (mode.value !== 'article') return;
  assets.value = [];
  clearMessage();
  await fetchAssetList();
});

onMounted(async () => {
  await fetchArticles();

  if (!selectedArticleId.value && articleOptions.value.length > 0) {
    selectedArticleId.value = articleOptions.value[0].id;
  }

  await fetchAssetList();
});
</script>
