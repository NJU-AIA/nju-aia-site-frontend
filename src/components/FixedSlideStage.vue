<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue';
import type { SlideNode } from '@/core/parser';
import SlideView from './SlideView.vue';

defineProps<{ slide: SlideNode }>();

const LOGICAL_WIDTH = 1920;
const LOGICAL_HEIGHT = 1080;

provide('isDark', ref(false));

const viewport = ref<HTMLElement | null>(null);
const scale = ref(1);
let resizeObserver: ResizeObserver | null = null;

function updateScale() {
  const element = viewport.value;
  if (!element) return;

  const nextScale = Math.min(
    element.clientWidth / LOGICAL_WIDTH,
    element.clientHeight / LOGICAL_HEIGHT,
  );

  scale.value = Number.isFinite(nextScale) && nextScale > 0
    ? nextScale
    : 1;
}

onMounted(() => {
  const element = viewport.value;
  if (!element) return;

  resizeObserver = new ResizeObserver(updateScale);
  resizeObserver.observe(element);
  updateScale();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div
    ref="viewport"
    class="fixed-slide-stage"
    data-stage-viewport
  >
    <div
      class="fixed-slide-stage__canvas"
      data-stage-canvas
      data-logical-width="1920"
      data-logical-height="1080"
      :data-stage-scale="scale.toFixed(6)"
      :style="{ transform: `translate(-50%, -50%) scale(${scale})` }"
    >
      <SlideView :slide="slide" />
    </div>
  </div>
</template>

<style scoped>
.fixed-slide-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.fixed-slide-stage__canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1920px;
  height: 1080px;
  contain: size layout paint;
  isolation: isolate;
  overflow: hidden;
  transform-origin: center center;
  background: white;
  box-shadow: 0 12px 40px rgb(15 23 42 / 14%);
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
  will-change: transform;
}
</style>
