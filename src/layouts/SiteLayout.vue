<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
    <Header v-if="!isImmersiveGallery" />
    <router-view :class="isImmersiveGallery ? '' : 'mt-10'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'

const route = useRoute()

const isImmersiveGallery = computed(() => {
  const rawEntry = route.params.entry
  const hasEntry = Array.isArray(rawEntry) ? rawEntry.length > 0 : Boolean(rawEntry)
  return route.path.startsWith('/gallery/') && hasEntry
})
</script>
