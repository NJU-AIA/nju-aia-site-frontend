<template>
  <main v-if="currentEntry" class="fixed inset-0 overflow-hidden bg-black">
    <iframe
      :key="currentEntry.routePath"
      :srcdoc="currentEntry.html"
      class="h-full w-full"
      sandbox="allow-scripts allow-modals"
      referrerpolicy="no-referrer"
      title="Gallery HTML Viewer"
    />

    <div class="pointer-events-none absolute right-6 top-4 md:right-10 md:top-5">
      <router-link
        to="/gallery"
        class="pointer-events-auto inline-flex items-center rounded-full bg-white/78 px-4 py-1.5 text-sm font-medium text-gray-700 shadow-md shadow-black/10 backdrop-blur-xl transition hover:bg-white"
      >
        返回画廊
      </router-link>
    </div>
  </main>

  <main v-else class="min-h-screen px-4 pb-10 pt-20 md:px-8">
    <section class="mx-auto mb-6 max-w-7xl">
      <p class="mb-2 text-xs font-medium uppercase tracking-widest text-[#40B3FF]">Gallery</p>
      <h1 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 md:text-4xl">画廊</h1>
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">收录零散 HTML 展示页面，点击即可进入沉浸式全屏查看。</p>
    </section>

    <section class="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <router-link
        v-for="entry in galleryEntries"
        :key="entry.routePath"
        :to="`/gallery/${entry.routePath}`"
        class="rounded-xl border border-gray-100 bg-white p-4 transition hover:border-[#40B3FF] hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <p class="truncate text-base font-medium text-gray-900 dark:text-gray-100">{{ entry.title }}</p>
        <p class="mt-1 truncate text-xs text-gray-400">{{ entry.filePath }}</p>
      </router-link>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { galleryEntries, galleryEntryMap } from '@/gallary/registry'

const route = useRoute()

const activeRoutePath = computed(() => {
  const entry = route.params.entry

  if (!entry) return ''

  return Array.isArray(entry) ? entry.join('/') : entry
})

const currentEntry = computed(() => galleryEntryMap.get(activeRoutePath.value) ?? null)
</script>
