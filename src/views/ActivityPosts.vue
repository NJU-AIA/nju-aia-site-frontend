<!-- ActivityPosts.vue -->
<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
    <Header />
    <main class="max-w-4xl mx-auto px-6 pt-24 pb-20">

      <div class="mb-16 text-center">
        <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-4">Activities</p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 text-balance">
          活动推文
        </h1>
        <p class="mt-4 text-base text-gray-500 dark:text-gray-400">
          记录南大 AIA 的每一次精彩瞬间与硬核技术分享。
        </p>
      </div>

      <div v-if="posts.length === 0" class="text-center py-20 text-sm text-gray-400">
        <!-- 正在加载推文或暂无内容... -->
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <router-link
          v-for="post in posts"
          :key="post.id"
          :to="`/reader?id=${post.id}`"
          class="group block border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
        >
          <div class="h-36 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
          </div>
          <div class="p-5">
            <p class="text-xs text-gray-400 mb-2">{{ post.date }}</p>
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#40B3FF] transition-colors line-clamp-2 leading-snug">
              {{ post.title }}
            </h2>
            <span class="mt-3 flex items-center gap-0.5 text-xs font-medium text-[#40B3FF] opacity-0 group-hover:opacity-100 transition-opacity">
              阅读
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </router-link>
      </div>

    </main>
  </div>
</template>

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