<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'
import Header from '@/components/Header.vue'

// 1. 初始化空数组和加载状态
const honors = ref<any[]>([])
const isLoading = ref(true)

// 2. 页面挂载时向后端请求真实数据
onMounted(async () => {
  try {
    const data = await api.getHonors()
    if (data) {
      honors.value = data
    }
  } catch (error) {
    console.error("加载荣誉墙数据失败", error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <Header />
    
    <main class="py-20 md:py-32 relative">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/3 w-64 h-64 bg-[#40B3FF] opacity-10 blur-3xl rounded-full"></div>
        <div class="absolute bottom-1/4 right-1/3 w-64 h-64 bg-[#954CE9] opacity-10 blur-3xl rounded-full"></div>
      </div>
      
      <div class="container mx-auto px-4 relative z-10 max-w-5xl">
        <h1 class="text-4xl md:text-5xl font-bold text-center mb-12">
          <span class="bg-gradient-to-r from-[#40B3FF] to-[#954CE9] bg-clip-text text-transparent">
            荣誉墙
          </span>
        </h1>
        <p class="text-center text-xl mb-16 dark:text-gray-300 text-gray-600">
          纪念在例会中现场通关的同学们 ~
        </p>
        
        <div v-if="isLoading" class="flex justify-center items-center py-20 text-gray-500">
          正在加载荣誉榜单...
        </div>

        <div v-else class="space-y-16">
          <div 
            v-for="honor in honors" 
            :key="honor.event" 
            class="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-2 border-transparent hover:border-[#40B3FF] rounded-2xl p-8 transition-all duration-300"
          >
            <h2 class="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#40B3FF] to-[#954CE9] bg-clip-text text-transparent">
              {{ honor.event }}
            </h2>
            <p class="text-lg mb-6 dark:text-gray-400 text-gray-500">{{ honor.date }}</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div 
                v-for="award in honor.awards" 
                :key="award.name" 
                class="flex items-center space-x-4"
              >
                <p class="dark:text-gray-300 text-gray-600 font-medium">{{ award.name }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>