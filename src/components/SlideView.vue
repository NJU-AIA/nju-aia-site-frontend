<script setup lang="ts">
import type { SlideNode } from '@/core/parser';
import SlideLayoutTree from './SlideLayoutTree.vue';

defineProps<{ slide: SlideNode }>();
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-white text-[#161216]">
    <img
      src="/nju-aia.png"
      alt="南京大学人工智能协会"
      class="absolute right-7 top-4 h-10 w-auto max-w-[220px] object-contain"
    />

    <div
      v-if="slide.type === 'cover'"
      class="flex h-full flex-col items-center justify-center px-20 text-center"
    >
      <h1 class="max-w-[1320px] text-[46px] font-bold leading-tight tracking-wide text-[#231d22]">
        {{ slide.title }}
      </h1>
      <div class="mb-8 mt-7 h-[3px] w-40 shrink-0 bg-[#6f145f]" />
      <div class="h-[50%] w-full max-w-[1120px] min-h-0">
        <SlideLayoutTree :node="slide.body" align="center" />
      </div>
    </div>

    <template v-else>
      <header class="absolute left-9 right-[270px] top-6">
        <h2 class="truncate text-[28px] font-bold leading-none tracking-tight text-[#241e23]">
          {{ slide.title }}
        </h2>
        <div class="mt-3 h-[2px] w-[230px] bg-[#6f145f]" />
      </header>

      <main class="absolute bottom-7 left-10 right-10 top-[78px] overflow-hidden">
        <SlideLayoutTree :node="slide.body" />
      </main>
    </template>

    <div class="absolute bottom-3.5 left-7 text-[11px] font-medium tracking-[0.16em] text-[#9a8796]">
      NJU · AIA
    </div>
  </div>
</template>
