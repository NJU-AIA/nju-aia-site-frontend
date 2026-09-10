<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
    <Header v-if="!isImmersiveView" />
    <router-view :class="isImmersiveView ? '' : 'mt-14'" />

    <router-link
      v-if="!isImmersiveView"
      to="/admin"
      class="fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white/80 px-3 py-2 text-xs font-medium text-gray-500 shadow-sm backdrop-blur-md transition hover:border-[#6f145f]/30 hover:bg-white hover:text-[#6f145f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f145f]/40 dark:border-gray-700/90 dark:bg-gray-900/80 dark:text-gray-400 dark:hover:border-[#d77bc4]/40 dark:hover:bg-gray-900 dark:hover:text-[#f0a7df]"
      aria-label="进入管理后台"
      title="管理后台"
    >
      <svg
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 15.75A3.75 3.75 0 1 0 12 8.25a3.75 3.75 0 0 0 0 7.5Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15Z" />
      </svg>
      <span>管理后台</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'

const route = useRoute()

const isImmersiveView = computed(() => {
  const rawEntry = route.params.entry
  const hasEntry = Array.isArray(rawEntry) ? rawEntry.length > 0 : Boolean(rawEntry)
  return route.path === '/slides' || (route.path.startsWith('/gallery/') && hasEntry)
})
</script>
