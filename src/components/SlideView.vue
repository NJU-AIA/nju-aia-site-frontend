<script setup lang="ts">
import { computed } from 'vue';
import type { SlideNode } from '../core/parser';
import AstRenderer from './AstRenderer.vue';

const props = defineProps<{ slide: SlideNode; }>();

const slideAnalysis = computed(() => {
  const els = props.slide.elements;
  
  const isPureMedia = (node: any) => {
    if (node.type !== 'paragraph') return false;
    const validChildren = node.children?.filter((c: any) => c.type !== 'text' || c.value.trim() !== '') || [];
    return validChildren.length > 0 && validChildren.every((c: any) => c.type === 'image');
  };

  const isVisualBlock = (node: any) => {
    if (node.type === 'image' || isPureMedia(node)) return true;
    
    if (node.type === 'code') {
      if (node.lang === 'mermaid' || node.lang === 'pseudo' || node.lang === 'algorithm') {
        return true; 
      }
      
      const lineCount = node.value ? node.value.split('\n').length : 0;
      return lineCount > 10;
    }
    
    return false;
  };

  const visualNodes = els.filter(isVisualBlock);
  const textNodes = els.filter(n => !isVisualBlock(n));

  return { visualNodes, textNodes, els };
});

const layoutMode = computed(() => {
  if (props.slide.type === 'cover') return 'cover';
  const { visualNodes, textNodes } = slideAnalysis.value;
  if (visualNodes.length > 0 && textNodes.length > 0) return 'split';
  if (visualNodes.length > 0 && textNodes.length === 0) return 'visual-only';
  return 'text-only';
});

const splitGridClass = computed(() => {
  if (layoutMode.value !== 'split') return '';
  let textLength = 0;
  const countText = (node: any) => {
    if (node.value) textLength += node.value.length;
    if (node.children) node.children.forEach(countText);
  };
  slideAnalysis.value.textNodes.forEach(countText);

  if (textLength > 250) return 'grid-cols-[6.5fr_3.5fr]';
  if (textLength > 120) return 'grid-cols-[5.5fr_4.5fr]';
  return 'grid-cols-[1fr_1fr]';
});
</script>

<template>
  <div class="w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 p-12 flex flex-col box-border min-h-0 transition-colors duration-300">
    
    <h2 
      v-if="slide.type !== 'cover'" 
      class="text-4xl font-light tracking-tight mb-8 text-slate-900 dark:text-slate-100 border-b-2 border-teal-300 dark:border-teal-600 pb-4 shrink-0"
    >
      {{ slide.title }}
    </h2>

    <div class="flex-1 w-full max-w-[1500px] mx-auto overflow-hidden min-h-0 relative">
      
      <div v-if="layoutMode === 'cover'" class="h-full flex flex-col items-center justify-center text-center gap-12">
        <h1 class="text-6xl md:text-7xl leading-tight font-light tracking-tight text-slate-900 dark:text-slate-50">
          {{ slide.title }}
        </h1>
        <div class="max-w-3xl mx-auto text-slate-700 dark:text-slate-300 text-lg leading-8">
          <AstRenderer v-for="(el, idx) in slideAnalysis.els" :key="idx" :node="el" />
        </div>
      </div>

      <div v-else-if="layoutMode === 'split'" :class="['h-full grid gap-8 pb-4', splitGridClass]">
        <div class="flex flex-col justify-center max-h-full overflow-y-auto pr-6 scrollbar-hide min-w-0 pb-8 border-r-2 border-teal-200 dark:border-teal-800/40">
          <div class="text-slate-700 dark:text-slate-300 text-base leading-8 space-y-6">
            <AstRenderer v-for="(el, idx) in slideAnalysis.textNodes" :key="'t'+idx" :node="el" />
          </div>
        </div>
        <div class="flex flex-col justify-center items-center gap-6 max-h-full overflow-y-auto pr-4 scrollbar-hide min-w-0 pb-8">
          <AstRenderer v-for="(el, idx) in slideAnalysis.visualNodes" :key="'v'+idx" :node="el" />
        </div>
      </div>

      <div v-else-if="layoutMode === 'visual-only'" class="h-full flex flex-col justify-center items-center max-h-full overflow-y-auto scrollbar-hide pb-8">
        <div class="w-full max-w-5xl">
          <AstRenderer v-for="(el, idx) in slideAnalysis.visualNodes" :key="'v'+idx" :node="el" />
        </div>
      </div>

      <div v-else class="h-full flex flex-col justify-center pb-4 max-h-full overflow-y-auto scrollbar-hide pr-4 max-w-5xl mx-auto w-full text-slate-700 dark:text-slate-300 text-base leading-8">
        <AstRenderer v-for="(el, idx) in slideAnalysis.textNodes" :key="idx" :node="el" />
      </div>

    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>