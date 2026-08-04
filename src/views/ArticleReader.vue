<script setup lang="ts">
import { computed, provide } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useArticleFromRoute } from '@/composables/useArticleFromRoute';
import { parseMarkdownDocument } from '@/core/parser';
import ArticleDocument from '@/components/ArticleDocument.vue';

const { isDark } = useTheme();
const { article, articleId, loading, error, reload } = useArticleFromRoute();
const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || '/assets';

provide('isDark', isDark);
provide('currentArticleId', articleId);
provide('assetBaseUrl', assetBaseUrl);

const nodes = computed(() => parseMarkdownDocument(article.value?.content || ''));
const returnPath = computed(() => article.value?.category === 'activity' ? '/activity-posts' : '/tech-tutorials');
</script>

<template>
  <main class="min-h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-950">
    <div class="sticky top-14 z-20 border-b border-gray-100 bg-white/88 backdrop-blur dark:border-gray-800 dark:bg-gray-950/88">
      <div class="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
        <router-link
          :to="returnPath"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#6f145f] dark:text-gray-400"
        >
          <span aria-hidden="true">←</span>
          返回列表
        </router-link>

        <router-link
          v-if="article?.defaultMode === 'slide'"
          :to="{ path: '/slides', query: { id: article.id } }"
          class="rounded-lg border border-[#d8c1d4] px-3 py-1.5 text-xs font-semibold text-[#6f145f] transition hover:bg-[#f8f3f7] dark:border-[#604157] dark:text-[#f0a7df] dark:hover:bg-[#281d26]"
        >
          演示模式
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="flex min-h-[60vh] items-center justify-center text-sm text-gray-400">
      正在加载文章…
    </div>

    <div v-else-if="error" class="mx-auto max-w-xl px-6 py-24 text-center">
      <p class="text-sm text-red-500">{{ error }}</p>
      <button
        type="button"
        class="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        @click="reload"
      >
        重新加载
      </button>
    </div>

    <ArticleDocument
      v-else-if="article"
      :id="article.id"
      :title="article.title"
      :author="article.author"
      :date="article.date"
      :category="article.category"
      :cover="article.cover"
      :nodes="nodes"
    />
  </main>
</template>
