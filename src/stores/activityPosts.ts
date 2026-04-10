import { defineStore } from 'pinia';
import { articlesApi, type Article } from '@/api/articles';

export interface ActivityPostItem {
  id: string;
  title: string;
  date: string;
  cover?: string;
  author: string;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function mapArticle(article: Article): ActivityPostItem {
  return {
    id: article.id,
    title: article.title,
    date: formatDate(article.date || article.createdAt || article.updatedAt),
    cover: article.cover,
    author: article.author,
  };
}

function toTimestamp(value?: string): number {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

function compareArticleByLatest(a: Article, b: Article): number {
  const ta = toTimestamp(a.date) || toTimestamp(a.updatedAt) || toTimestamp(a.createdAt);
  const tb = toTimestamp(b.date) || toTimestamp(b.updatedAt) || toTimestamp(b.createdAt);
  return tb - ta;
}

export const useActivityPostsStore = defineStore('activityPosts', {
  state: () => ({
    posts: [] as ActivityPostItem[],
    isLoading: false,
    loaded: false,
    error: null as string | null,
    lastFetchedAt: 0,
  }),

  getters: {
    hasData: (state) => state.posts.length > 0,
  },

  actions: {
    async fetchPosts() {
      if (this.isLoading) return;

      const hasCachedData = this.loaded && this.hasData;

      if (!hasCachedData) {
        this.isLoading = true;
      }

      this.error = null;

      try {
        const { data } = await articlesApi.getArticles();

        this.posts = (data.items || [])
          .filter((item) => item.category === 'activity')
          .sort(compareArticleByLatest)
          .map(mapArticle);

        this.loaded = true;
        this.lastFetchedAt = Date.now();
      } catch (error) {
        console.error('加载活动推文失败', error);
        this.error = error instanceof Error ? error.message : '加载失败';
      } finally {
        this.isLoading = false;
      }
    },
  },

  persist: {
    key: 'activity-posts-store',
    storage: localStorage,
    pick: ['posts', 'loaded', 'lastFetchedAt'],
  },
});
