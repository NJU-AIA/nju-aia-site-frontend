<!-- Header.vue -->
<template>
  <header
    class="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-950/90"
  >
    <nav class="container relative mx-auto flex h-14 items-center justify-between px-6">
      <a href="/" class="group flex items-center gap-2.5 outline-none">
        <img src="/logo.png" alt="AIA Logo" class="h-7 w-7 object-contain" />
        <span class="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50">NJU AIA</span>
        <span
          class="hidden text-sm text-gray-400 transition-colors group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 lg:inline-block"
        >
          南京大学人工智能协会
        </span>
      </a>

      <ul class="hidden items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-400 md:flex">
        <li v-for="link in navLinks" :key="link.name">
          <a
            :href="link.href"
            :target="link.isExternal ? '_blank' : '_self'"
            class="flex items-center gap-1 transition-colors duration-200 hover:text-gray-900 dark:hover:text-gray-100"
          >
            {{ link.name }}
            <svg
              v-if="link.isExternal"
              class="h-3 w-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </li>
      </ul>

      <div class="flex items-center gap-1">
        <button
          @click="toggleTheme"
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          aria-label="切换白天/黑夜模式"
        >
          <svg
            v-if="isDark"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 md:hidden"
          aria-label="打开导航菜单"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div
        v-if="mobileMenuOpen"
        class="absolute left-0 top-14 w-full border-b border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 md:hidden"
      >
        <ul class="flex flex-col gap-4 px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          <li v-for="link in navLinks" :key="link.name">
            <a
              :href="link.href"
              :target="link.isExternal ? '_blank' : '_self'"
              class="block transition-colors hover:text-gray-900 dark:hover:text-gray-100"
              @click="mobileMenuOpen = false"
            >
              {{ link.name }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
const mobileMenuOpen = ref(false)

const navLinks = [
  { name: '首页', href: '/' },
  { name: '活动推文', href: '/activity-posts' },
  { name: '技术教程', href: '/tech-tutorials' },
  // { name: 'LiveCode', href: '/livecodes' },

  { name: '关于我们', href: '/about' },
  { name: '荣誉墙', href: '/honor-wall' },
  { name: '成员墙', href: '/member-wall' },
    { name: '画廊', href: '/gallery' },
  { name: '技术论坛', href: 'https://forum.nju-aia.com/', isExternal: true },
]
</script>
