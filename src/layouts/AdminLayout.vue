<template>
  <div class="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-gray-950">
    <header class="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
      <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
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
          <div v-if="user" class="hidden text-right sm:block">
            <div class="text-xs font-medium text-gray-700 dark:text-gray-200">
              {{ user.displayName || user.username }}
            </div>
            <div class="text-[11px] text-gray-400">
              {{ user.username }} · {{ user.role === 'owner' ? '所有者' : '管理员' }}
            </div>
          </div>
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

    <main class="mx-auto max-w-7xl">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi, clearCurrentUser, getCachedUser, getCurrentUser, type CurrentUser } from '@/api/auth'

const router = useRouter()
const user = ref<CurrentUser | null>(getCachedUser() ?? null)
const loggingOut = ref(false)

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
