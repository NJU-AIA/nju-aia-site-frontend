<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
    <Header />

    <main class="pt-24 pb-20 px-6">
      <div class="max-w-4xl mx-auto">

        <div class="mb-16 text-center">
          <p class="text-xs font-medium text-[#40B3FF] uppercase tracking-widest mb-4">Members</p>
          <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 text-balance">
            成员墙
          </h1>
          <p class="mt-4 text-base text-gray-500 dark:text-gray-400">
            感谢每一位为社团付出的成员，你们的贡献是我们前进的动力。
          </p>
        </div>

        <div
          v-if="memberStore.isLoading && !memberStore.hasData"
          class="flex justify-center items-center py-40 text-sm text-gray-400"
        >
          正在加载成员信息...
        </div>

        <div v-else class="space-y-5">
          <section
            v-for="group in memberStore.members"
            :key="group.year"
            class="p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 transition-colors duration-200"
          >
            <div class="flex flex-wrap items-center gap-3 mb-6">
              <h2 class="text-base font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <span class="w-1 h-5 bg-[#40B3FF] rounded-full"></span>
                {{ group.year }}
              </h2>
              <span class="text-xs text-gray-400 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700">
                {{ group.members.length }} 人
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              <div
                v-for="member in group.members"
                :key="isString(member) ? member : member.name"
                class="flex flex-col justify-center px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 min-h-[3rem]"
              >
                <template v-if="isString(member)">
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center truncate">
                    {{ member }}
                  </p>
                </template>

                <template v-else>
                  <div class="flex justify-between items-center gap-1 mb-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ member.name }}
                    </p>
                    <span class="flex-shrink-0 text-[10px] font-medium text-[#40B3FF] bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
                      志愿者
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">
                    {{ member.description }}
                  </p>
                </template>
              </div>
            </div>
          </section>
        </div>

        <p v-if="memberStore.error && !memberStore.hasData" class="text-center text-sm text-red-500 mt-6">
          {{ memberStore.error }}
        </p>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Header from '@/components/Header.vue'
import { useMemberStore, type MemberEntry } from '@/stores/member'

const memberStore = useMemberStore()

onMounted(() => {
  // 先用缓存渲染，再静默更新
  memberStore.fetchMembers()
})

const isString = (member: MemberEntry): member is string => typeof member === 'string'
</script>