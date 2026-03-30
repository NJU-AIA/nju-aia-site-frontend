<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
    <Header />

    <main class="pt-24 pb-20 px-6">
      <div
        v-if="isLoading"
        class="flex justify-center items-center py-40 text-sm text-gray-400"
      >
        正在加载社团信息...
      </div>

      <div v-else class="max-w-4xl mx-auto">
        <!-- Page Title -->
        <div class="mb-16 text-center">
          <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-4">
            About Us
          </p>
          <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 text-balance">
            {{ aboutData.title }}
          </h1>
        </div>

        <!-- 关于我们 + 我们的目标 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
              <span class="w-1 h-4 bg-[#40B3FF] rounded-full"></span>
              关于我们
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {{ aboutData.intro }}
            </p>
          </div>

          <div class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
              <span class="w-1 h-4 bg-[#40B3FF] rounded-full"></span>
              我们的目标
            </h2>
            <ul class="space-y-2.5">
              <li
                v-for="goal in aboutData.goals"
                :key="goal"
                class="flex items-start gap-2.5"
              >
                <svg class="w-4 h-4 text-[#40B3FF] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ goal }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 我们的活动 -->
        <div class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 mb-5">
          <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50 mb-6 flex items-center gap-2">
            <span class="w-1 h-4 bg-[#40B3FF] rounded-full"></span>
            我们的活动
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="activity in aboutData.activities"
              :key="activity.id"
              class="flex items-start gap-4"
            >
              <div class="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0">
                <svg
                  v-if="activity.id === 'meeting'"
                  class="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <svg
                  v-else-if="activity.id === 'contest'"
                  class="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>

              <div>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {{ activity.title }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {{ activity.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系我们 -->
        <div class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 mb-10">
          <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50 mb-6 flex items-center gap-2">
            <span class="w-1 h-4 bg-[#40B3FF] rounded-full"></span>
            联系我们
          </h2>
          <div class="flex flex-wrap gap-4">
            <div
              v-for="contact in aboutData.contacts"
              :key="contact.id"
              class="flex items-center gap-2"
            >
              <div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <svg v-if="contact.id === 'qq'" class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                </svg>
                <svg v-else-if="contact.id === 'wechat'" class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <svg v-else-if="contact.id === 'email'" class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>

              <a
                :href="contact.link"
                class="text-sm text-gray-600 dark:text-gray-400 hover:text-[#40B3FF] transition-colors"
              >
                {{ contact.label }}
              </a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-gray-400 dark:text-gray-600">
          {{ aboutData.footer }}
        </p>

        <!-- 错误提示 -->
        <p v-if="error" class="text-center text-sm text-red-500 mt-6">
          {{ error }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Header from '@/components/Header.vue'

interface AboutActivity {
  id: string
  title: string
  description: string
}

interface AboutContact {
  id: string
  label: string
  link: string
}

interface AboutData {
  title: string
  intro: string
  goals: string[]
  activities: AboutActivity[]
  contacts: AboutContact[]
  footer: string
}

const getDefaultAboutData = (): AboutData => ({
  title: '',
  intro: '',
  goals: [],
  activities: [],
  contacts: [],
  footer: '',
})

const aboutData = ref<AboutData>(getDefaultAboutData())
const isLoading = ref(false)
const error = ref('')

const ABOUT_URL = '/settings/about.json'

const fetchAbout = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const res = await fetch(ABOUT_URL)

    if (!res.ok) {
      throw new Error(`请求失败：${res.status}`)
    }

    const data = await res.json()

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('返回数据格式不正确')
    }

    aboutData.value = {
      title: data.title ?? '',
      intro: data.intro ?? '',
      goals: Array.isArray(data.goals) ? data.goals : [],
      activities: Array.isArray(data.activities) ? data.activities : [],
      contacts: Array.isArray(data.contacts) ? data.contacts : [],
      footer: data.footer ?? '',
    }
  } catch (err) {
    console.error('加载关于我们数据失败:', err)
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAbout()
})
</script>