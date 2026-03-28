<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api/client' // 引入刚才写的客户端
import Header from '@/components/Header.vue'

const members = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    members.value = await api.getMembers()
  } finally {
    isLoading.value = false
  }
})
// 类型守卫辅助函数，用于在 template 中区分字符串和对象
const isString = (member: any): member is string => typeof member === 'string';
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <Header />
    
    <main class="pt-28 pb-16 relative">
      <article class="container mx-auto px-4 max-w-5xl relative z-10">
        
        <h1 class="text-4xl md:text-5xl font-bold text-center mb-12">
          <span class="bg-gradient-to-r from-[#40B3FF] to-[#954CE9] bg-clip-text text-transparent">
            成员墙
          </span>
        </h1>
        <p class="text-center text-xl mb-16 dark:text-gray-300 text-gray-600 font-medium">
          感谢每一位为社团付出的成员，你们的贡献是我们前进的动力！
        </p>

        <div class="space-y-12">
          <section 
            v-for="group in members" 
            :key="group.year" 
            class="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <h2 class="text-2xl md:text-3xl font-bold mb-8 flex flex-wrap items-center gap-3 text-gray-900 dark:text-white">
              <span class="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#40B3FF] to-[#954CE9] rounded-full text-white shadow-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </span>
              <span>{{ group.year }}</span>
              <span class="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {{ group.members.length }} 人
              </span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div 
                v-for="(member, _) in group.members" 
                :key="isString(member) ? member : member.name" 
                class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-center min-h-[4.5rem]"
              >
                <template v-if="isString(member)">
                  <p class="font-medium text-gray-900 dark:text-gray-100 text-center w-full">{{ member }}</p>
                </template>

                <template v-else>
                  <div class="w-full flex flex-col items-start gap-1.5">
                    <div class="w-full flex justify-between items-center gap-2">
                      <p class="font-medium text-gray-900 dark:text-white">{{ member.name }}</p>
                      <span class="text-[10px] font-bold tracking-wide bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                        志愿者
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ member.description }}</p>
                  </div>
                </template>
              </div>
            </div>
          </section>
        </div>
        
      </article>
    </main>
  </div>
</template>