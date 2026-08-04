<template>

  <main class="max-w-4xl mx-auto px-6 pt-24 pb-20">
    <div class="mb-16 text-center">
      <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-4">Upcoming Events</p>
      <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 text-balance">
        活动预热
      </h1>
      <p class="mt-4 text-base text-gray-500 dark:text-gray-400">
        提前了解南大 AIA 即将开展的活动、报名信息与参与方式。
      </p>
    </div>

    <div v-if="activityPreviewsStore.isLoading && !activityPreviewsStore.hasData"
      class="text-center py-20 text-sm text-gray-400">
      正在加载活动预热...
    </div>

    <div v-else-if="activityPreviewsStore.hasData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <router-link v-for="post in activityPreviewsStore.posts" :key="post.id" :to="routeForArticle(post.id, post.defaultMode)"
        class="group block border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
        <div class="h-36 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">

          <img v-if="post.cover" :src="resolveArticleAssetUrl(post.cover, post.id)" :alt="post.title"
            class="h-full w-full object-contain" />
          <svg v-else class="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>

        <div class="p-5">
          <p class="text-xs text-gray-400 mb-2">{{ post.date || '暂无日期' }}</p>

          <h2
            class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#40B3FF] transition-colors line-clamp-2 leading-snug">
            {{ post.title }}
          </h2>

          <p v-if="post.author" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {{ post.author }}
          </p>

          <span
            class="mt-3 flex items-center gap-0.5 text-xs font-medium text-[#40B3FF] opacity-0 group-hover:opacity-100 transition-opacity">
            阅读
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </router-link>
    </div>

    <p v-else-if="activityPreviewsStore.error" class="text-center text-sm text-red-500 mt-6">
      {{ activityPreviewsStore.error }}
    </p>

    <p v-else class="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
      暂无活动预热，敬请期待。
    </p>
  </main>

</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useActivityPreviewsStore } from '@/stores/activityPreviews';
import { routeForArticle } from '@/core/articleRoutes';

const activityPreviewsStore = useActivityPreviewsStore();

const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || '/assets';

function resolveArticleAssetUrl(url: string, articleId?: string) {
  if (!url) return '';

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  const base = ASSET_BASE_URL.replace(/\/$/, '');

  if (url.startsWith('/')) {
    return `${base}${url}`;
  }

  const cleanFilename = url.replace(/^\.\//, '');
  const cleanArticleId = (articleId || '').trim();

  if (cleanArticleId) {
    return `${base}/${cleanArticleId}/${cleanFilename}`;
  }

  return `${base}/${cleanFilename}`;
}

onMounted(() => {
  activityPreviewsStore.fetchPosts();
});
</script>