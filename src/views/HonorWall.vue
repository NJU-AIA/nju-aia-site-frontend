<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
    <Header />

    <main class="pt-24 pb-20 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="mb-16 text-center">
          <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-4">Honor Wall</p>
          <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 text-balance">
            荣誉墙
          </h1>
          <p class="mt-4 text-base text-gray-500 dark:text-gray-400">
            纪念在例会中现场通关的同学们
          </p>
        </div>

        <div
          v-if="isLoading"
          class="flex justify-center items-center py-40 text-sm text-gray-400"
        >
          正在加载荣誉榜单...
        </div>

        <template v-else>
          <div v-if="honors.length > 0" class="space-y-4">
            <div
              v-for="honor in honors"
              :key="`${honor.event}-${honor.date}`"
              class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
            >
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  <span class="w-1 h-5 bg-[#40B3FF] rounded-full flex-shrink-0"></span>
                  {{ honor.event }}
                </h2>
                <span class="text-xs text-gray-400 dark:text-gray-500 pl-3 sm:pl-0">
                  {{ honor.date }}
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pl-3">
                <div
                  v-for="award in honor.awards"
                  :key="award.name"
                  class="flex items-center gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span class="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                    {{ award.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p v-else-if="error" class="text-center text-sm text-red-500 mt-6">
            {{ error }}
          </p>

          <p v-else class="text-center text-sm text-gray-400 mt-6">
            暂无荣誉数据
          </p>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Header from '@/components/Header.vue'

interface AwardItem {
  name: string
}

interface HonorItem {
  event: string
  date: string
  awards: AwardItem[]
}

const honors = ref<HonorItem[]>([])
const isLoading = ref(false)
const error = ref('')

// public/settings/honors.json -> 访问路径应写成 /settings/honors.json
const HONORS_URL = '/settings/honors.json'

const fetchHonors = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const res = await fetch(HONORS_URL)

    if (!res.ok) {
      throw new Error(`请求失败：${res.status}`)
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error('返回数据格式不正确')
    }

    honors.value = data
  } catch (err) {
    console.error('获取荣誉墙失败:', err)
    error.value = err instanceof Error ? err.message : '加载荣誉墙失败'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchHonors()
})
</script>