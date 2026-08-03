<template>
  <section class="px-6 py-8">
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">授权用户</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          使用论坛用户名预授权。用户首次通过 AIA 统一身份认证登录后，会自动绑定其 OIDC 身份。
        </p>
      </div>
    </div>

    <div class="mb-8 rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 class="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">添加授权用户</h2>
      <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="createUser">
        <input
          v-model="newUsername"
          type="text"
          autocomplete="off"
          placeholder="论坛用户名，例如 fwerkor"
          class="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
        />
        <select
          v-model="newRole"
          class="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
        >
          <option value="admin">管理员</option>
          <option value="owner">所有者</option>
        </select>
        <button
          type="submit"
          :disabled="creating || !newUsername.trim()"
          class="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          {{ creating ? '添加中...' : '添加' }}
        </button>
      </form>
    </div>

    <div
      v-if="message"
      class="mb-4 rounded-lg border px-3 py-2.5 text-sm"
      :class="messageType === 'error'
        ? 'border-red-100 bg-red-50 text-red-500 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400'
        : 'border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400'"
    >
      {{ message }}
    </div>

    <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div v-if="loading" class="px-6 py-12 text-center text-sm text-gray-400">加载中...</div>
      <div v-else-if="users.length === 0" class="px-6 py-12 text-center text-sm text-gray-400">暂无授权用户</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
          <thead class="bg-gray-50/70 dark:bg-gray-950/50">
            <tr class="text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              <th class="px-5 py-3">用户</th>
              <th class="px-5 py-3">身份绑定</th>
              <th class="px-5 py-3">最近登录</th>
              <th class="px-5 py-3">角色</th>
              <th class="px-5 py-3">状态</th>
              <th class="px-5 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="user in users" :key="user.id" class="text-sm">
              <td class="px-5 py-4">
                <div class="font-medium text-gray-900 dark:text-gray-100">{{ user.displayName || user.username }}</div>
                <div class="mt-0.5 text-xs text-gray-400">
                  {{ user.username }}<span v-if="user.email"> · {{ user.email }}</span>
                </div>
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="user.bound
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'"
                >
                  {{ user.bound ? '已绑定' : '等待首次登录' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-gray-500 dark:text-gray-400">
                {{ formatDate(user.lastLoginAt) }}
              </td>
              <td class="px-5 py-4">
                <select
                  v-model="user.role"
                  class="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-700 outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                >
                  <option value="admin">管理员</option>
                  <option value="owner">所有者</option>
                </select>
              </td>
              <td class="px-5 py-4">
                <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input v-model="user.enabled" type="checkbox" class="h-4 w-4 rounded border-gray-300" />
                  {{ user.enabled ? '启用' : '停用' }}
                </label>
              </td>
              <td class="whitespace-nowrap px-5 py-4 text-right">
                <button
                  type="button"
                  class="mr-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[#168BD2] hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-950/30"
                  :disabled="busyUserID === user.id"
                  @click="saveUser(user)"
                >
                  保存
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                  :disabled="busyUserID === user.id"
                  @click="removeUser(user)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { authApi, type AdminRole, type AdminUser } from '@/api/auth'

const users = ref<AdminUser[]>([])
const loading = ref(true)
const creating = ref(false)
const busyUserID = ref<number | null>(null)
const newUsername = ref('')
const newRole = ref<AdminRole>('admin')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text
  messageType.value = type
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await authApi.listUsers()
    users.value = response.data.items
  } catch (error) {
    showMessage(error instanceof Error ? error.message : '读取授权用户失败', 'error')
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  const username = newUsername.value.trim()
  if (!username) return
  creating.value = true
  try {
    await authApi.createUser(username, newRole.value)
    newUsername.value = ''
    newRole.value = 'admin'
    showMessage('授权用户已添加。', 'success')
    await loadUsers()
  } catch (error) {
    showMessage(error instanceof Error ? error.message : '添加失败', 'error')
  } finally {
    creating.value = false
  }
}

const saveUser = async (user: AdminUser) => {
  busyUserID.value = user.id
  try {
    const response = await authApi.updateUser(user.id, user.role, user.enabled)
    const index = users.value.findIndex((item) => item.id === user.id)
    if (index >= 0) users.value[index] = response.data
    showMessage('授权设置已保存。', 'success')
  } catch (error) {
    showMessage(error instanceof Error ? error.message : '保存失败', 'error')
    await loadUsers()
  } finally {
    busyUserID.value = null
  }
}

const removeUser = async (user: AdminUser) => {
  if (!window.confirm(`确认删除 ${user.username} 的后台权限？`)) return
  busyUserID.value = user.id
  try {
    await authApi.deleteUser(user.id)
    users.value = users.value.filter((item) => item.id !== user.id)
    showMessage('授权用户已删除。', 'success')
  } catch (error) {
    showMessage(error instanceof Error ? error.message : '删除失败', 'error')
  } finally {
    busyUserID.value = null
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return '尚未登录'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

onMounted(loadUsers)
</script>
