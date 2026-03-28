<script setup lang="ts">
import { ref, onMounted } from 'vue'
// 【修改点 1】：引入真实的 API 客户端
import { api, type DocumentMeta, type ViewMode } from '@/api/client'
import Header from '@/components/Header.vue'

const posts = ref<DocumentMeta[]>([])

// 【修改点 2】：动态映射图标，根据文章排版模式显示 Emoji
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
    // 【修改点 3】：直接请求过滤好的数据
    posts.value = await api.getDocList('activity-posts')
  } catch (error) {
    console.error("加载活动推文失败", error)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <Header />
    <main class="max-w-7xl mx-auto px-6 py-24">
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">活动推文 📸</h1>
        <p class="text-gray-600 dark:text-gray-400">记录南大 AIA 的每一次精彩瞬间与硬核技术分享。</p>
      </div>

      <div v-if="posts.length === 0" class="text-center py-10 text-gray-500">
        正在加载推文或暂无内容...
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link 
          v-for="post in posts" :key="post.id" 
          :to="`/reader?id=${post.id}`"
          class="group block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div class="h-48 bg-gradient-to-br from-[#40B3FF]/20 to-[#954CE9]/20 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500">
            {{ getModeIcon(post.defaultMode) }}
          </div>
          <div class="p-6">
            <div class="text-xs text-[#954CE9] font-mono mb-2">{{ post.date }}</div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#40B3FF] transition-colors line-clamp-2">
              {{ post.title }}
            </h2>
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>