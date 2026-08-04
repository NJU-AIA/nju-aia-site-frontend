<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { MarkdownNode } from '@/core/parser';
import AstRenderer from './AstRenderer.vue';

const props = withDefaults(
  defineProps<{
    elements: MarkdownNode[];
    align?: 'start' | 'center';
  }>(),
  { align: 'start' },
);

const viewport = ref<HTMLElement | null>(null);
const body = ref<HTMLElement | null>(null);
const fitState = ref<'pending' | 'ready'>('pending');
const scale = ref(1);
const overflow = ref(false);

const MIN_SCALE = 0.01;
const INITIAL_LOW_SCALE = 0.25;
const MAX_SCALE = 1.5;
const FIT_STEPS = 12;
const FIT_TOLERANCE = 1;

let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let fitVersion = 0;
let frameIds: number[] = [];

function cancelFrames() {
  frameIds.forEach(cancelAnimationFrame);
  frameIds = [];
}

function applyScale(value: number) {
  const viewportElement = viewport.value;
  const bodyElement = body.value;
  if (!viewportElement || !bodyElement) return;

  scale.value = value;
  bodyElement.style.width = `${100 / value}%`;
  bodyElement.style.transform = `scale(${value})`;
  bodyElement.style.setProperty(
    '--fit-media-max-height',
    `${viewportElement.clientHeight / value}px`,
  );
}

function fits(value: number) {
  const viewportElement = viewport.value;
  const bodyElement = body.value;
  if (!viewportElement || !bodyElement) return true;

  applyScale(value);
  return bodyElement.scrollWidth * value <= viewportElement.clientWidth + FIT_TOLERANCE
    && bodyElement.scrollHeight * value <= viewportElement.clientHeight + FIT_TOLERANCE;
}

function runFit(version: number) {
  if (version !== fitVersion) return;

  const viewportElement = viewport.value;
  if (!viewportElement || !body.value) return;

  if (viewportElement.clientWidth <= 0 || viewportElement.clientHeight <= 0) {
    fitState.value = 'ready';
    return;
  }

  overflow.value = false;
  if (fits(MAX_SCALE)) {
    applyScale(MAX_SCALE);
    fitState.value = 'ready';
    return;
  }

  let low = INITIAL_LOW_SCALE;
  let high = MAX_SCALE;

  while (!fits(low) && low > MIN_SCALE) {
    high = low;
    low = Math.max(MIN_SCALE, low / 2);
  }

  if (!fits(low)) {
    applyScale(low);
    overflow.value = true;
    fitState.value = 'ready';
    return;
  }

  for (let step = 0; step < FIT_STEPS; step++) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }

  applyScale(low * 0.995);
  fitState.value = 'ready';
}

function scheduleFit() {
  fitState.value = 'pending';
  const version = ++fitVersion;
  cancelFrames();

  void nextTick(() => {
    frameIds.push(requestAnimationFrame(() => {
      frameIds.push(requestAnimationFrame(() => runFit(version)));
    }));
  });
}

watch(() => props.elements, scheduleFit, { deep: true });

onMounted(() => {
  const viewportElement = viewport.value;
  const bodyElement = body.value;
  if (!viewportElement || !bodyElement) return;

  resizeObserver = new ResizeObserver(scheduleFit);
  resizeObserver.observe(viewportElement);

  mutationObserver = new MutationObserver(scheduleFit);
  mutationObserver.observe(bodyElement, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  viewportElement.addEventListener('load', scheduleFit, true);
  scheduleFit();
});

onBeforeUnmount(() => {
  fitVersion++;
  cancelFrames();
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
  viewport.value?.removeEventListener('load', scheduleFit, true);
});
</script>

<template>
  <section
    ref="viewport"
    class="content-block"
    :class="{ 'content-block--center': align === 'center' }"
    :data-fit-state="fitState"
    :data-fit-scale="scale.toFixed(3)"
    :data-fit-overflow="overflow ? 'true' : 'false'"
  >
    <div ref="body" class="content-block__body">
      <AstRenderer
        v-for="(element, index) in elements"
        :key="index"
        :node="element"
      />
    </div>
  </section>
</template>

<style scoped>
.content-block {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.content-block__body {
  box-sizing: border-box;
  transform-origin: top left;
  color: #262126;
  font-size: 16px;
  line-height: 1.58;
}

.content-block--center .content-block__body { text-align: center; }
.content-block__body :deep(> *:first-child) { margin-top: 0 !important; }
.content-block__body :deep(> *:last-child) { margin-bottom: 0 !important; }

.content-block__body :deep(.ast-paragraph),
.content-block__body :deep(.ast-list) {
  margin-bottom: 0.68rem !important;
  font-size: inherit !important;
  line-height: 1.52 !important;
}

.content-block__body :deep(.ast-list) { padding-left: 1.4rem !important; }
.content-block__body :deep(.ast-list-item) { margin: 0.2rem 0 !important; }
.content-block__body :deep(.ast-heading-3) {
  margin: 0.85rem 0 0.42rem !important;
  font-size: 1.12em !important;
  line-height: 1.3 !important;
}
.content-block__body :deep(.ast-heading-4),
.content-block__body :deep(.ast-heading-5),
.content-block__body :deep(.ast-heading-6) {
  margin: 0.62rem 0 0.36rem !important;
  font-size: 1em !important;
  line-height: 1.3 !important;
}

.content-block__body :deep(.ast-media) {
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: var(--fit-media-max-height) !important;
  margin: 0.38rem auto !important;
  border: 0 !important;
  background: transparent !important;
  object-fit: contain !important;
}

.content-block__body :deep(.ast-media-gallery) {
  margin: 0.4rem 0 !important;
  gap: 0.65rem !important;
}

.content-block__body :deep(.ast-media-gallery > .ast-media) {
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: var(--fit-media-max-height) !important;
  margin: 0 !important;
  object-fit: contain !important;
  aspect-ratio: auto !important;
}

.content-block__body :deep(.ast-math),
.content-block__body :deep(.ast-mermaid),
.content-block__body :deep(.ast-code-block),
.content-block__body :deep(.ast-blockquote),
.content-block__body :deep(.ast-table-wrapper) {
  margin: 0.65rem 0 !important;
}

.content-block__body :deep(.ast-math),
.content-block__body :deep(.ast-mermaid),
.content-block__body :deep(.ast-table-wrapper) {
  overflow: visible !important;
}

.content-block__body :deep(.ast-blockquote) {
  border-radius: 0 0.45rem 0.45rem 0 !important;
  padding: 0.65rem 1rem !important;
  font-size: inherit !important;
  line-height: 1.62 !important;
}

.content-block__body :deep(.ast-table) {
  width: 100% !important;
  table-layout: fixed;
  font-size: 14px !important;
}

.content-block__body :deep(.ast-table-cell) {
  padding: 0.42rem 0.58rem !important;
  overflow-wrap: anywhere;
}

.content-block__body :deep(.ast-code-frame),
.content-block__body :deep(.ast-pseudo) {
  border-radius: 0.5rem !important;
  box-shadow: 0 2px 10px rgb(76 29 67 / 6%) !important;
}

.content-block__body :deep(.ast-code-meta) {
  padding: 0.48rem 0.8rem !important;
}

.content-block__body :deep(.ast-code-content),
.content-block__body :deep(.ast-code-fallback),
.content-block__body :deep(.ast-code-content pre),
.content-block__body :deep(.ast-code-content code),
.content-block__body :deep(.ast-code-fallback code) {
  overflow: visible !important;
  white-space: pre-wrap !important;
  overflow-wrap: anywhere !important;
  word-break: break-word !important;
}

.content-block__body :deep(.ast-code-content),
.content-block__body :deep(.ast-code-fallback) {
  padding: 0.72rem 0.9rem !important;
}

.content-block__body :deep(.ast-code-content code),
.content-block__body :deep(.ast-code-fallback code),
.content-block__body :deep(.ast-pseudo-lines) {
  font-size: 14px !important;
  line-height: 1.55 !important;
}

.content-block__body :deep(.ast-divider) {
  margin: 0.8rem 0 !important;
}
</style>
