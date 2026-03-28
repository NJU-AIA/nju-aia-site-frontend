<script setup lang="ts">
import type { SlideNode } from '../core/parser';
import AstRenderer from './AstRenderer.vue';

defineProps<{
  slides: SlideNode[];
}>();
</script>

<template>
  <div class="w-full h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-700 dark:text-slate-300 overflow-y-auto custom-scrollbar transition-colors duration-300">
    <div class="max-w-3xl mx-auto py-16 px-6 md:px-10">
      
      <template v-for="(slide, index) in slides" :key="index">
        
        <h1 
          v-if="slide.type === 'cover'" 
          :id="'slide-' + index"
          class="text-4xl md:text-5xl font-light tracking-tight leading-tight mt-8 mb-12 text-slate-900 dark:text-slate-100"
        >
          {{ slide.title }}
        </h1>
        
        <template v-else>
          <h2 
            v-if="!slide.isContinuation"
            :id="'slide-' + index"
            class="text-2xl md:text-3xl font-light tracking-tight text-slate-800 dark:text-slate-200 border-b-2 border-teal-300 dark:border-teal-600 pb-4 mt-12 mb-8"
          >
            {{ slide.title }}
          </h2>
          <hr 
            v-else 
            :id="'slide-' + index" 
            class="my-6 border-t border-dashed border-slate-300 dark:border-slate-700" 
          />
        </template>

        <div class="flex flex-col gap-0 md:gap-4">
          <AstRenderer v-for="(el, idx) in slide.elements" :key="idx" :node="el" />
        </div>
        
      </template>

      <div class="h-20 w-full flex items-end justify-center text-slate-400 dark:text-slate-600 font-serif text-sm tracking-widest">
        ∎
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
</style>