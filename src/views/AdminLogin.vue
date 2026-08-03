<template>
  <div class="flex min-h-screen items-center justify-center bg-white px-6 transition-colors duration-300 dark:bg-gray-950">
    <div class="w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-8 py-10 dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-8 text-center">
        <div class="mb-4 flex justify-center">
          <img src="/logo.png" alt="AIA Logo" class="h-10 w-10 object-contain" />
        </div>
        <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">管理员登录</h1>
        <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">使用 AIA 统一身份认证进入后台</p>
      </div>

      <div
        v-if="errorMessage"
        class="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-500 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
      >
        {{ errorMessage }}
      </div>

      <button
        type="button"
        class="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        @click="handleLogin"
      >
        使用 auth.nju-aia.com 登录
      </button>

      <p class="mt-4 text-center text-xs leading-5 text-gray-400 dark:text-gray-500">
        仅后台授权列表中的账户可以访问。认证成功但未获授权的账户仍会被拒绝。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { authApi } from '@/api/auth'

const route = useRoute()

const errorMessages: Record<string, string> = {
  not_authorized: '当前账户未获得后台权限，请联系后台所有者添加授权。',
  invalid_flow: '登录流程已过期或校验失败，请重新登录。',
  provider_rejected: '统一身份认证未完成。',
  oidc_failed: '统一身份认证失败，请重新尝试。',
  session_failed: '后台会话创建失败，请重新尝试。',
}

const errorMessage = computed(() => {
  const code = typeof route.query.error === 'string' ? route.query.error : ''
  return code ? errorMessages[code] || '登录失败，请重新尝试。' : ''
})

const handleLogin = () => {
  window.location.assign(authApi.loginURL)
}
</script>
