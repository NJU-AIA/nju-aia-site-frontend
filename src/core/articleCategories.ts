import type { ArticleCategory } from '@/api/articles';

const CATEGORY_META: Record<ArticleCategory, { label: string; path: string }> = {
  preview: { label: '活动预热', path: '/activity-previews' },
  activity: { label: '活动推文', path: '/activity-posts' },
  tutorial: { label: '技术教程', path: '/tech-tutorials' },
};

export function articleCategoryLabel(category?: string): string {
  return CATEGORY_META[category as ArticleCategory]?.label || '文章';
}

export function articleCategoryPath(category?: string): string {
  return CATEGORY_META[category as ArticleCategory]?.path || '/';
}
