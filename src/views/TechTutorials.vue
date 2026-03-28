<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
    <Header />

    <main class="max-w-4xl mx-auto px-6 pt-24 pb-20">
      <div class="mb-16 text-center">
        <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-4">Tutorials</p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 text-balance">
          技术教程
        </h1>
        <p class="mt-4 text-base text-gray-500 dark:text-gray-400">
          从前沿理论到工程实践，系统化的学习资源库。
        </p>
      </div>

      <div class="space-y-3">
        <div
          v-if="techTutorialsStore.isLoading && !techTutorialsStore.hasData"
          class="text-center py-20 text-sm text-gray-400"
        >
          正在加载教程...
        </div>

        <template v-else>
          <router-link
            v-for="tut in techTutorialsStore.tutorials"
            :key="tut.id"
            :to="`/reader?id=${tut.id}`"
            class="flex items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
          >
            <div class="flex items-center gap-4 min-w-0">
              <div class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
                <svg
                  v-if="tut.defaultMode === 'article'"
                  class="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>

                <svg
                  v-else-if="tut.defaultMode === 'slides'"
                  class="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5h16v10H4V5zm2 12h12m-8 3h4"/>
                </svg>

                <svg
                  v-else
                  class="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>

              <div class="min-w-0">
                <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#40B3FF] transition-colors truncate">
                  {{ tut.title }}
                </h2>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-gray-400 font-mono px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    {{ tut.defaultMode.toUpperCase() }}
                  </span>
                  <span class="text-xs text-gray-400">{{ tut.date }}</span>
                </div>
              </div>
            </div>

            <span class="flex-shrink-0 flex items-center gap-0.5 text-xs font-medium text-[#40B3FF] opacity-0 group-hover:opacity-100 transition-opacity ml-4">
              阅读
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </router-link>
        </template>
      </div>

      <p
        v-if="techTutorialsStore.error && !techTutorialsStore.hasData"
        class="text-center text-sm text-red-500 mt-6"
      >
        {{ techTutorialsStore.error }}
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Header from '@/components/Header.vue'
import { useTechTutorialsStore } from '@/stores/techTutorials'

const techTutorialsStore = useTechTutorialsStore()

onMounted(() => {
  // 先用缓存渲染，再静默更新
  techTutorialsStore.fetchTutorials()
})
</script>