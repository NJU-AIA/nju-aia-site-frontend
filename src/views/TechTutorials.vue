<template>
  <main class="mx-auto max-w-4xl px-6 pb-20 pt-24">
    <div class="mb-16 text-center">
      <p class="mb-4 text-xs font-medium uppercase tracking-widest text-[#40B3FF]">Tutorials</p>
      <h1 class="text-balance text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-5xl">
        技术教程
      </h1>
      <p class="mt-4 text-base text-gray-500 dark:text-gray-400">
        从前沿理论到工程实践，系统化的学习资源库。
      </p>
    </div>

    <div class="space-y-3">
      <div
        v-if="techTutorialsStore.isLoading && !techTutorialsStore.hasData"
        class="py-20 text-center text-sm text-gray-400"
      >
        正在加载教程…
      </div>

      <template v-else>
        <router-link
          v-for="tutorial in techTutorialsStore.tutorials"
          :key="tutorial.id"
          :to="routeForArticle(tutorial.id, tutorial.defaultMode)"
          class="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600"
        >
          <div class="flex min-w-0 items-center gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-800">
              <svg
                v-if="contentTypeFromMode(tutorial.defaultMode) === 'slide'"
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5h16v10H4V5zm2 12h12m-8 3h4" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>

            <div class="min-w-0">
              <h2 class="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#40B3FF] dark:text-gray-100">
                {{ tutorial.title }}
              </h2>

              <div class="mt-1 flex items-center gap-2">
                <span class="rounded border border-gray-100 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-400 dark:border-gray-700 dark:bg-gray-800">
                  {{ contentTypeFromMode(tutorial.defaultMode) === 'slide' ? 'SLIDES' : 'ARTICLE' }}
                </span>
                <span class="text-xs text-gray-400">{{ tutorial.date || '暂无日期' }}</span>
                <span v-if="tutorial.author" class="truncate text-xs text-gray-400">· {{ tutorial.author }}</span>
              </div>
            </div>
          </div>

          <span class="ml-4 flex shrink-0 items-center gap-0.5 text-xs font-medium text-[#40B3FF] opacity-0 transition-opacity group-hover:opacity-100">
            打开
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </router-link>
      </template>
    </div>

    <p v-if="techTutorialsStore.error && !techTutorialsStore.hasData" class="mt-6 text-center text-sm text-red-500">
      {{ techTutorialsStore.error }}
    </p>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { contentTypeFromMode, routeForArticle } from '@/core/articleRoutes';
import { useTechTutorialsStore } from '@/stores/techTutorials';

const techTutorialsStore = useTechTutorialsStore();

onMounted(() => {
  void techTutorialsStore.fetchTutorials();
});
</script>
