<script setup lang="ts">
import { computed } from 'vue';
import type { MarkdownNode } from '@/core/parser';
import { resolveArticleAssetUrl } from '@/core/assets';
import { articleCategoryLabel } from '@/core/articleCategories';
import AstRenderer from './AstRenderer.vue';

const props = withDefaults(
  defineProps<{
    id?: string;
    title: string;
    author?: string;
    date?: string;
    category?: string;
    cover?: string;
    nodes: MarkdownNode[];
    compact?: boolean;
  }>(),
  { compact: false },
);

function textOf(node: MarkdownNode): string {
  if (typeof node.value === 'string') return node.value;
  return (node.children ?? []).map(textOf).join('');
}

function normalized(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

const renderedNodes = computed(() => {
  const [first, ...rest] = props.nodes;
  if (
    first?.type === 'heading'
    && Number(first.depth) === 1
    && normalized(textOf(first)) === normalized(props.title)
  ) {
    return rest;
  }
  return props.nodes;
});

const coverUrl = computed(() => resolveArticleAssetUrl(props.cover, props.id));
const categoryLabel = computed(() => articleCategoryLabel(props.category));
</script>

<template>
  <article
    class="article-document"
    :class="compact ? 'article-document--compact' : 'article-document--full'"
  >
    <header class="article-header">
      <div class="article-kicker">
        <span>{{ categoryLabel }}</span>
        <span v-if="date">{{ date }}</span>
      </div>

      <h1>{{ title }}</h1>

      <div v-if="author" class="article-author">
        <span class="article-author__avatar">{{ author.slice(0, 1) }}</span>
        <span>{{ author }}</span>
      </div>

      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="title"
        class="article-cover"
        referrerpolicy="no-referrer"
      />
    </header>

    <div class="article-body">
      <AstRenderer
        v-for="(node, index) in renderedNodes"
        :key="index"
        :node="node"
      />
    </div>
  </article>
</template>

<style scoped>
.article-document {
  width: 100%;
  color: #312b30;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.article-document--full {
  max-width: 860px;
  margin: 0 auto;
  padding: 72px 28px 96px;
}

.article-document--compact {
  max-width: 760px;
  margin: 0 auto;
  padding: 34px 28px 56px;
}

.article-header {
  margin-bottom: 3rem;
}

.article-kicker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1rem;
  margin-bottom: 1rem;
  color: #6f145f;
  font-size: 0.78rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.article-header h1 {
  margin: 0;
  color: #211c20;
  font-size: clamp(2.25rem, 5vw, 3.8rem);
  font-weight: 760;
  letter-spacing: -0.035em;
  line-height: 1.12;
}

.article-document--compact .article-header h1 {
  font-size: clamp(1.85rem, 4vw, 2.65rem);
}

.article-author {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 1.35rem;
  color: #746b72;
  font-size: 0.95rem;
}

.article-author__avatar {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f4eaf2;
  color: #6f145f;
  font-size: 0.84rem;
  font-weight: 700;
}

.article-cover {
  display: block;
  width: 100%;
  max-height: 520px;
  margin-top: 2.2rem;
  border: 1px solid #eee5ec;
  border-radius: 0.9rem;
  background: #faf8fa;
  object-fit: contain;
}

.article-body {
  color: #40393f;
  font-size: 1.06rem;
  line-height: 1.82;
}

.article-document--compact .article-body {
  font-size: 0.98rem;
  line-height: 1.74;
}

.article-body :deep(.ast-heading-1) {
  margin-top: 3rem;
  font-size: 2.15em;
}

.article-body :deep(.ast-heading-2) {
  position: relative;
  margin-top: 3rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid #eaddea;
  font-size: 1.65em;
}

.article-body :deep(.ast-heading-2)::after {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 4.5rem;
  height: 2px;
  background: #6f145f;
  content: "";
}

.article-body :deep(.ast-heading-3) {
  margin-top: 2.2rem;
  font-size: 1.3em;
}

.article-body :deep(.ast-paragraph) {
  margin-bottom: 1.15rem;
}

.article-body :deep(.ast-code-content),
.article-body :deep(.ast-code-fallback) {
  font-size: 0.92rem;
}

:global(.dark .article-document) { color: #ebe4ea; }
:global(.dark .article-kicker) { color: #efa6df; }
:global(.dark .article-header h1) { color: #fff8fd; }
:global(.dark .article-author) { color: #cec2cc; }
:global(.dark .article-author__avatar) { background: #3a2736; color: #f5b8e7; }
:global(.dark .article-body) { color: #e7e0e6; }
:global(.dark .article-body .ast-heading-2) { border-color: #604157; }
:global(.dark .article-body .ast-heading-2::after) { background: #d77bc4; }
:global(.dark .article-cover) { border-color: #4a3746; background: #181217; }

@media (max-width: 640px) {
  .article-document--full,
  .article-document--compact {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
