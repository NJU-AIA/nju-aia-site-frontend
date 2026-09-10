<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleFromRoute } from '@/composables/useArticleFromRoute';
import { articleCategoryPath } from '@/core/articleCategories';
import { parseMarkdownToSlides } from '@/core/parser';
import FixedSlideStage from '@/components/FixedSlideStage.vue';

const router = useRouter();
const { article, articleId, loading, error, reload } = useArticleFromRoute();
const currentSlideIndex = ref(0);
const isDark = ref(false);
const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || '/assets';

provide('isDark', isDark);
provide('currentArticleId', articleId);
provide('assetBaseUrl', assetBaseUrl);

const slides = computed(() => parseMarkdownToSlides(article.value?.content || ''));
const currentSlide = computed(() => slides.value[currentSlideIndex.value] || null);
const returnPath = computed(() => articleCategoryPath(article.value?.category));

function clampIndex(value: number) {
  if (slides.value.length === 0) return 0;
  return Math.min(Math.max(value, 0), slides.value.length - 1);
}

function previousSlide() {
  currentSlideIndex.value = clampIndex(currentSlideIndex.value - 1);
}

function nextSlide() {
  currentSlideIndex.value = clampIndex(currentSlideIndex.value + 1);
}

function handleKeydown(event: KeyboardEvent) {
  if (['ArrowRight', ' ', 'PageDown'].includes(event.key)) {
    event.preventDefault();
    nextSlide();
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    previousSlide();
  } else if (event.key === 'Home') {
    currentSlideIndex.value = 0;
  } else if (event.key === 'End') {
    currentSlideIndex.value = Math.max(0, slides.value.length - 1);
  } else if (event.key === 'Escape') {
    void router.push(returnPath.value);
  }
}

watch(articleId, () => {
  currentSlideIndex.value = 0;
});

watch(
  () => slides.value.length,
  () => {
    currentSlideIndex.value = clampIndex(currentSlideIndex.value);
  },
);

onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <main class="relative h-screen w-screen overflow-hidden bg-[#ece9ec]">
    <div v-if="loading" class="flex h-full items-center justify-center text-sm text-gray-500">
      正在加载幻灯片…
    </div>

    <div v-else-if="error" class="flex h-full flex-col items-center justify-center px-6 text-center">
      <p class="text-sm text-red-500">{{ error }}</p>
      <button
        type="button"
        class="mt-5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        @click="reload"
      >
        重新加载
      </button>
    </div>

    <template v-else-if="article && currentSlide">
      <FixedSlideStage :key="currentSlideIndex" :slide="currentSlide" />

      <div class="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-5">
        <router-link
          :to="returnPath"
          class="pointer-events-auto rounded-full bg-gray-900/65 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur transition hover:bg-gray-900/80"
        >
          ← 返回
        </router-link>
        <div class="max-w-[50vw] truncate rounded-full bg-white/78 px-4 py-2 text-xs font-medium text-gray-700 shadow backdrop-blur">
          {{ article.title }}
        </div>
        <router-link
          :to="{ path: '/article', query: { id: article.id } }"
          class="pointer-events-auto rounded-full bg-white/78 px-4 py-2 text-xs font-medium text-[#6f145f] shadow backdrop-blur transition hover:bg-white"
        >
          文章模式
        </router-link>
      </div>

      <div class="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900/65 p-1.5 shadow-lg backdrop-blur">
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15 disabled:opacity-30"
          :disabled="currentSlideIndex === 0"
          aria-label="上一页"
          @click="previousSlide"
        >
          ‹
        </button>
        <span class="min-w-[74px] text-center font-mono text-xs text-white">
          {{ currentSlideIndex + 1 }} / {{ slides.length }}
        </span>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15 disabled:opacity-30"
          :disabled="currentSlideIndex >= slides.length - 1"
          aria-label="下一页"
          @click="nextSlide"
        >
          ›
        </button>
      </div>
    </template>

    <div v-else class="flex h-full items-center justify-center text-sm text-gray-500">
      当前内容中没有可显示的幻灯片。
    </div>
  </main>
</template>
