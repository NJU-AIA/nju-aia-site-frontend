<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type DocumentMeta, type ViewMode } from '@/api/client'
import Header from '@/components/Header.vue'

const tutorials = ref<DocumentMeta[]>([])

// 动态映射图标：根据教程的默认排版模式显示对应的 Emoji
const getModeIcon = (mode: ViewMode) => {
  switch (mode) {
    case 'homework': return '📝';
    case 'slides': return '📺';
    case 'article': return '📄';
    default: return '📄';
  }
};

onMounted(async () => {
  try {
    // 工业级做法：直接把分类参数传给后端，让数据库做过滤
    tutorials.value = await api.getDocList('tech-tutorials')
  } catch (error) {
    console.error("加载技术教程失败", error)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <Header />
    <main class="max-w-4xl mx-auto px-6 py-24">
      <div class="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">技术教程 📚</h1>
        <p class="text-gray-600 dark:text-gray-400">从前沿理论到工程实践，系统化的学习资源库。</p>
      </div>

      <div class="space-y-4">
        <div v-if="tutorials.length === 0" class="text-center py-10 text-gray-500">
          正在加载教程或暂无内容...
        </div>

        <router-link 
          v-else
          v-for="tut in tutorials" :key="tut.id" 
          :to="`/reader?id=${tut.id}`"
          class="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#40B3FF] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
        >
          <div class="flex items-start gap-4">
            <div class="text-3xl mt-1 opacity-80 group-hover:scale-110 transition-transform">
              {{ getModeIcon(tut.defaultMode) }}
            </div>
            
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#40B3FF] transition-colors">
                {{ tut.title }}
              </h2>
              <div class="flex items-center gap-3 mt-2 text-xs text-gray-500 font-mono">
                <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {{ tut.defaultMode.toUpperCase() }}
                </span>
                <span>{{ tut.date }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-[#40B3FF] font-medium text-sm">
            开始阅读 <span class="ml-1">→</span>
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>