<template>
  <div class="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-gray-950">
    <header class="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
      <div class="flex h-14 w-full items-center justify-between px-4 sm:px-6 xl:px-8 2xl:px-10">
        <div class="flex items-center gap-8">
          <router-link to="/admin/articles" class="group flex items-center gap-2 outline-none">
            <img src="/logo.png" alt="AIA Logo" class="h-6 w-6 object-contain" />
            <span class="text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#40B3FF] dark:text-gray-50">
              AIA 管理后台
            </span>
          </router-link>

          <nav class="flex items-center gap-1">
            <router-link
              to="/admin/articles"
              class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              active-class="bg-blue-50 text-[#40B3FF] dark:bg-blue-950/50 dark:text-[#40B3FF]"
            >
              文章管理
            </router-link>

            <router-link
              to="/admin/assets"
              class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              active-class="bg-blue-50 text-[#40B3FF] dark:bg-blue-950/50 dark:text-[#40B3FF]"
            >
              资源管理
            </router-link>

            <router-link
              to="/admin/livecodes"
              class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              active-class="bg-blue-50 text-[#40B3FF] dark:bg-blue-950/50 dark:text-[#40B3FF]"
            >
              LiveCode 管理
            </router-link>

            <router-link
              v-if="user?.role === 'owner'"
              to="/admin/users"
              class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              active-class="bg-blue-50 text-[#40B3FF] dark:bg-blue-950/50 dark:text-[#40B3FF]"
            >
              授权用户
            </router-link>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <router-link
            to="/"
            class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-[#6f145f]/30 hover:bg-[#f8f3f7] hover:text-[#6f145f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f145f]/30 dark:border-gray-700 dark:text-gray-400 dark:hover:border-[#d77bc4]/40 dark:hover:bg-[#281d26] dark:hover:text-[#f0a7df]"
            aria-label="返回前台首页"
            title="返回前台首页"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m3 11.25 9-7.5 9 7.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 9.75V20.25h13.5V9.75M9 20.25v-6h6v6" />
            </svg>
            <span class="hidden lg:inline">返回前台</span>
          </router-link>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
            :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
            @click="toggleTheme"
          >
            <svg v-if="isDark" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <div v-if="user" class="hidden w-36 shrink-0 text-right sm:block">
            <div class="text-xs font-medium text-gray-700 dark:text-gray-200">
              {{ user.displayName || user.username }}
            </div>
            <div class="text-[11px] text-gray-400">
              {{ user.username }} · {{ user.role === 'owner' ? '所有者' : '管理员' }}
            </div>
          </div>
          <div v-else class="hidden w-36 shrink-0 sm:block" aria-hidden="true"></div>
          <button
            class="rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-gray-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:text-gray-400 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            {{ loggingOut ? '退出中...' : '退出登录' }}
          </button>
        </div>
      </div>
    </header>

    <main :class="isWorkspace ? 'w-full max-w-none' : 'mx-auto w-full max-w-[1800px]'">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi, clearCurrentUser, getCachedUser, getCurrentUser, type CurrentUser } from '@/api/auth'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const route = useRoute()
const user = ref<CurrentUser | null>(getCachedUser() ?? null)
const loggingOut = ref(false)
const { isDark, toggleTheme } = useTheme()
const layoutMode = computed(() => {
  const matched = [...route.matched]
    .reverse()
    .find((record) => typeof record.meta.adminLayout === 'string')
  return matched?.meta.adminLayout === 'workspace' ? 'workspace' : 'wide'
})
const isWorkspace = computed(() => layoutMode.value === 'workspace')

onMounted(async () => {
  user.value = await getCurrentUser()
})

const handleLogout = async () => {
  loggingOut.value = true
  try {
    await authApi.logout()
  } finally {
    clearCurrentUser()
    loggingOut.value = false
    await router.push('/admin/login')
  }
}
</script>
