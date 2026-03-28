<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

// 引入全局的主题控制逻辑
const { isDark, toggleTheme } = useTheme()

// 导航链接配置表
const navLinks = [
  { name: '首页', href: '/' },
  { name: '活动推文', href: '/activity-posts' },
  { name: '技术教程', href: '/tech-tutorials' },
  { name: '关于我们', href: '/about' },
  { name: '荣誉墙', href: '/honor-wall' },
  { name: '成员墙', href: '/member-wall' },
  // 新增的技术论坛入口，假设它是外部链接或独立子站
  { name: '技术论坛', href: 'https://forum.nju-aia.lsamc.website/', isExternal: true }, 
]
</script>

<template>
  <header class="fixed w-full top-0 z-50 px-4 py-3 transition-all duration-300">
    
    <nav class="container mx-auto px-6 py-3 flex justify-between items-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm">
      
      <a href="/" class="flex items-baseline group outline-none">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-[#40B3FF] to-[#954CE9] bg-clip-text text-transparent">
          NJU AIA
          <span class="text-base font-normal text-gray-500 dark:text-gray-400 hidden lg:inline-block ml-2 group-hover:text-[#40B3FF] transition-colors">
            南京大学人工智能协会
          </span>
        </h1>
      </a>

      <ul class="hidden md:flex items-center space-x-6 dark:text-gray-50 text-gray-900 font-medium">
        <li v-for="link in navLinks" :key="link.name">
          <a :href="link.href" 
             :target="link.isExternal ? '_blank' : '_self'"
             :class="[
               'transition-colors duration-200 flex items-center gap-1',
               link.name === '技术论坛' 
                 ? 'text-[#954CE9] hover:text-[#40B3FF]' // 让论坛颜色与普通链接稍微区分
                 : 'hover:text-[#40B3FF]'
             ]">
            {{ link.name }}
            <svg v-if="link.isExternal" class="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </a>
        </li>
      </ul>

      <div class="flex items-center space-x-4">
        <button 
          @click="toggleTheme" 
          class="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
          aria-label="切换白天/黑夜模式"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        
        <button class="md:hidden p-2 text-gray-600 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
    </nav>
  </header>
</template>