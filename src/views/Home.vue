<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type DocumentMeta } from '@/api/client'
import Header from '@/components/Header.vue'

// 在 DocumentMeta 基础上扩展一下，以兼容首页可能存在的描述字段
interface EventMeta extends DocumentMeta {
  description?: string;
}

const recentEvents = ref<EventMeta[]>([])

onMounted(async () => {
  try {
    // 1. 从后端拉取真实的“活动推文”元数据
    const docs = await api.getDocList('activity-posts')
    
    // 2. 取最新的前 3 篇作为首页展示 (假设后端返回的数据已按日期排序)
    recentEvents.value = docs.slice(0, 3)
  } catch (error) {
    console.error('加载近期活动失败', error)
  }
})

// 日期格式化函数
const formatDate = (dateString: string) => {
  // 如果后端返回的是 '2026-03-20' 这种短格式，JS 原生可以直接解析
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai"
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
    <Header />
    
    <section class="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div class="absolute top-0 left-0 w-96 h-96 bg-[#40B3FF] opacity-20 blur-3xl rounded-full"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#954CE9] opacity-20 blur-3xl rounded-full"></div>
      </div>

      <div class="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 px-4 relative z-10 mt-24 md:mt-0">
        <div class="flex flex-col justify-center space-y-8">
          <h1 class="text-5xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-gray-50">
            探索人工智能的<br class="hidden md:block" />
            <span class="bg-gradient-to-r from-[#40B3FF] to-[#954CE9] bg-clip-text text-transparent">
              无限可能
            </span>
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            加入我们的AI研究社区，与志同道合的伙伴一起探索前沿技术，实现创新突破~
          </p>
          <div class="flex flex-wrap gap-4 mt-4">
            <a href="/about" class="px-8 py-3 bg-[#40B3FF] rounded-lg hover:bg-[#954CE9] transition-colors duration-300 text-lg text-white font-medium text-center shadow-lg shadow-[#40B3FF]/20">
              立即加入
            </a>
            <a href="/activity-posts" class="px-8 py-3 text-lg text-gray-700 dark:text-white bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-[#40B3FF] hover:text-white hover:border-[#40B3FF] transition-all duration-300 text-center">
              了解更多
            </a>
          </div>
        </div>
        
        <div class="relative flex justify-center items-center">
          <img 
            src="@/assets/capoo_swim.gif" 
            alt="AI Visualization" 
            class="w-full max-w-lg h-auto object-contain drop-shadow-2xl" 
          />
        </div>
      </div>
    </section>

    <section class="py-32 relative bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/2 left-1/4 w-64 h-64 bg-[#40B3FF] opacity-10 blur-3xl rounded-full"></div>
        <div class="absolute bottom-1/4 right-1/3 w-64 h-64 bg-[#954CE9] opacity-10 blur-3xl rounded-full"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <h2 class="text-3xl md:text-4xl font-bold mb-16 text-center">
          <span class="bg-gradient-to-r from-[#40B3FF] to-[#954CE9] bg-clip-text text-transparent">
            近期活动
          </span>
        </h2>
        
        <div v-if="recentEvents.length === 0" class="text-center py-10 text-gray-500">
          正在加载近期活动...
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <router-link 
            v-for="post in recentEvents" 
            :key="post.id" 
            :to="`/reader?id=${post.id}`"
            class="group block h-full outline-none"
          >
            <div class="h-full flex flex-col p-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-2xl transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-[#40B3FF]/10 group-hover:border-[#40B3FF]/30">
              <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white group-hover:text-[#40B3FF] transition-colors line-clamp-2">
                {{ post.title }}
              </h3>
              <p class="mb-6 text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                {{ post.description || '点击探索更多关于本次活动的精彩内容与技术分享细节...' }}
              </p>
              <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <p class="text-[#40B3FF] text-sm font-medium flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  时间：{{ formatDate(post.date) }}
                </p>
                <span class="opacity-0 group-hover:opacity-100 transition-opacity text-[#40B3FF] font-medium text-sm">
                  阅读 →
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

  </div>
</template>