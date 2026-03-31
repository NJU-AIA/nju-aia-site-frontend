<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
    <Header />
    <router-view class="mt-10"/>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
</script>