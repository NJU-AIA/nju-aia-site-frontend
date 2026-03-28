<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'
import Header from '@/components/Header.vue'

// 定义响应式数据，给一些默认空值防止初次渲染报错
const isLoading = ref(true)
const aboutData = ref({
  title: '',
  intro: '',
  goals: [] as string[],
  activities: [] as any[],
  contacts: [] as any[],
  footer: ''
})

onMounted(async () => {
  try {
    // 从后端 API 获取关于我们的动态文案
    const data = await api.getAbout()
    if (data) {
      aboutData.value = data
    }
  } catch (error) {
    console.error("加载关于我们数据失败", error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
    <Header />
    
    <main class="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div v-if="isLoading" class="flex justify-center items-center py-32 text-gray-500">
        正在加载社团信息...
      </div>

      <div v-else class="max-w-5xl mx-auto transition-opacity duration-500">
        <h1 class="text-4xl font-extrabold text-blue-900 dark:text-blue-100 text-center mb-12">
          {{ aboutData.title }}
        </h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div class="bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h2 class="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span> 关于我们
            </h2>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ aboutData.intro }}
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h2 class="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-5 flex items-center gap-2">
              <span class="w-1.5 h-6 bg-green-500 rounded-full"></span> 我们的目标
            </h2>
            <ul class="space-y-3">
              <li v-for="goal in aboutData.goals" :key="goal" class="flex items-center space-x-3 group">
                <svg class="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-gray-700 dark:text-gray-300 font-medium">{{ goal }}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-12 hover:shadow-xl transition-shadow duration-300">
          <h2 class="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-purple-500 rounded-full"></span> 我们的活动
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div v-for="activity in aboutData.activities" :key="activity.id" class="flex items-start space-x-5 group">
              <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-gray-700 transition-colors">
                <svg v-if="activity.id === 'meeting'" :class="['w-8 h-8 flex-shrink-0', activity.iconColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <svg v-else-if="activity.id === 'contest'" :class="['w-8 h-8 flex-shrink-0', activity.iconColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{{ activity.title }}</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{{ activity.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <h2 class="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-red-500 rounded-full"></span> 联系我们
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div v-for="contact in aboutData.contacts" :key="contact.id" class="flex items-center space-x-3 group">
              <div class="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group-hover:scale-110 transition-transform">
                <svg v-if="contact.id === 'qq'" :class="['w-6 h-6', contact.iconColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                </svg>
                <svg v-else-if="contact.id === 'wechat'" :class="['w-6 h-6', contact.iconColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <svg v-else-if="contact.id === 'email'" :class="['w-6 h-6', contact.iconColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <a :href="contact.link" class="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {{ contact.label }}
              </a>
            </div>
          </div>
        </div>
        
        <p class="text-center text-gray-500 dark:text-gray-400 mt-10 font-medium flex items-center justify-center gap-2">
          ✨ {{ aboutData.footer }}
        </p>
      </div>
    </main>
  </div>
</template>