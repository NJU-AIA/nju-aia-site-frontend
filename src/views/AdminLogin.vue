<!-- AdminLogin.vue -->
<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
    <div class="w-full max-w-sm px-8 py-10 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">

      <div class="mb-8 text-center">
        <div class="flex justify-center mb-4">
          <img src="/logo.png" alt="AIA Logo" class="w-10 h-10 object-contain" />
        </div>
        <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">管理员登录</h1>
        <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">NJU AIA 后台管理系统</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入管理员密码"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#40B3FF] dark:focus:border-[#40B3FF] transition-colors"
          />
        </div>

        <div v-if="errorMessage" class="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-sm text-red-500 dark:text-red-400">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-sm text-emerald-600 dark:text-emerald-400">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { authApi, setToken } from '@/api/auth'

const router = useRouter()

const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!password.value.trim()) {
    errorMessage.value = '请输入密码'
    return
  }

  loading.value = true

  try {
    const res = await authApi.login({ password: password.value })
    const token = res.data.token
    setToken(token)
    successMessage.value = '登录成功！'
    setTimeout(() => {
      router.push('/admin/articles')
    }, 500)
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = (error as any).message || '登录失败'
    } else {
      errorMessage.value = '发生未知错误'
    }
  } finally {
    loading.value = false
  }
}
</script>