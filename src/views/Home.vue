<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 font-sans transition-colors duration-300">
    <Header />

    <!-- Hero Section -->
    <section class="min-h-screen flex items-center pt-14">
      <div class="container mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 py-24">
        
        <div class="flex flex-col justify-center gap-8">
          <div class="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-[#40B3FF]"></span>
            Artificial Intelligence Association of Nanjing University
          </div>
          
          <h1 class="text-5xl md:text-6xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-gray-50">
            探索人工智能<br class="hidden md:block" />的无限可能
          </h1>

          <p class="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
            加入我们的 AI 研究社区，与志同道合的伙伴一起探索前沿技术，实现创新突破。
          </p>

          <div class="flex flex-wrap gap-3 mt-2">
            <router-link
              to="/about"
              class="px-12 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors duration-200"
            >
              立即加入
            </router-link>

            <router-link
              to="/activity-posts"
              class="px-12 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
            >
              了解更多
            </router-link>
          </div>
        </div>

        <div class="relative flex justify-center items-center">
          <div class="w-80 h-80 md:w-96 md:h-96 rounded-2xl flex items-center justify-center overflow-hidden">
            <img 
              :src="randomGif" 
              alt="Capoo" 
              class="w-full h-full object-contain p-8"
            />
          </div>
        </div>

      </div>
    </section>

    <!-- Divider -->
    <div class="container mx-auto px-12">
      <hr class="border-gray-100 dark:border-gray-800" />
    </div>

    <!-- Events Section -->
    <section class="py-24">
      <div class="container mx-auto px-12">

        <div class="mb-12">
          <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-3">Activities</p>
          <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            近期活动
          </h2>
        </div>

        <!-- 只有首次没有缓存时才显示 loading -->
        <div
          v-if="homeStore.isLoading && !homeStore.hasData"
          class="py-20 text-center text-gray-400 text-sm"
        >
          正在加载近期活动...
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <router-link 
            v-for="post in homeStore.recentEvents" 
            :key="post.id" 
            :to="`/reader?id=${post.id}`"
            class="group block outline-none"
          >
            <div class="h-full flex flex-col p-6 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
              
              <h3 class="text-base font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-[#40B3FF] transition-colors line-clamp-2 leading-snug">
                {{ post.title }}
              </h3>
              
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
                {{ post.description || '点击探索更多关于本次活动的精彩内容与技术分享细节...' }}
              </p>

              <div class="mt-5 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <p class="text-xs text-gray-400 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ formatDate(post.date) }}
                </p>
                <span class="text-xs font-medium text-[#40B3FF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  阅读
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>

            </div>
          </router-link>
        </div>

        <p v-if="homeStore.error && !homeStore.hasData" class="mt-6 text-center text-sm text-red-500">
          {{ homeStore.error }}
        </p>

      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import { useHomeStore } from '@/stores/home'

const homeStore = useHomeStore()

const randomGif = ref('')

const getRandomGif = () => {
  const n = Math.floor(Math.random() * 32) + 1
  return `https://aia-1361527502.cos.ap-nanjing.myqcloud.com/capoo/${n}.gif`
}

onMounted(() => {
  randomGif.value = getRandomGif()

  // 先用缓存渲染，再静默更新
  homeStore.fetchRecentEvents()
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  })
}
</script>