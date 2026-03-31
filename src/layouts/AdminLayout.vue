<!-- AdminLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <header class="bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">

        <div class="flex items-center gap-8">
          <router-link to="/admin/articles" class="flex items-center gap-2 outline-none group">
            <img src="/logo.png" alt="AIA Logo" class="w-6 h-6 object-contain" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-50 group-hover:text-[#40B3FF] transition-colors">
              AIA 管理后台
            </span>
          </router-link>

          <nav class="flex items-center gap-1">
            <router-link
              to="/admin/articles"
              class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              active-class="bg-blue-50 dark:bg-blue-950/50 text-[#40B3FF] dark:text-[#40B3FF]"
            >
              文章管理
            </router-link>

            <router-link
              to="/admin/assets"
              class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              active-class="bg-blue-50 dark:bg-blue-950/50 text-[#40B3FF] dark:text-[#40B3FF]"
            >
              资源管理
            </router-link>
          </nav>
        </div>

        <button
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-transparent hover:border-red-100 dark:hover:border-red-900/50 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          @click="handleLogout"
        >
          退出登录
        </button>

      </div>
    </header>

    <main class="mx-auto max-w-7xl ">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { removeToken } from '@/api/auth'

const router = useRouter()

const handleLogout = () => {
  removeToken()
  router.push('/admin/login')
}
</script>