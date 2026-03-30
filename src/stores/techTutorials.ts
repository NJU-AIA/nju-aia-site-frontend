import { defineStore } from 'pinia';
import { articlesApi, type Article } from '@/api/articles';

export interface TechTutorialItem {
  id: string;
  title: string;
  date: string;
  defaultMode: string;
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

function mapArticle(article: Article): TechTutorialItem {
  return {
    id: article.id,
    title: article.title,
    date: formatDate(article.createdAt || article.updatedAt),
    defaultMode: article.defaultMode,
    author: article.author,
  };
}

export const useTechTutorialsStore = defineStore('techTutorials', {
  state: () => ({
    tutorials: [] as TechTutorialItem[],
    isLoading: false,
    loaded: false,
    error: null as string | null,
    lastFetchedAt: 0,
  }),

  getters: {
    hasData: (state) => state.tutorials.length > 0,
  },

  actions: {
    async fetchTutorials() {
      if (this.isLoading) return;

      const hasCachedData = this.loaded && this.hasData;

      if (!hasCachedData) {
        this.isLoading = true;
      }

      this.error = null;

      try {
        const { data } = await articlesApi.getArticles();

        this.tutorials = (data.items || [])
          .filter((item) => item.category === 'tutorial')
          .map(mapArticle);

        this.loaded = true;
        this.lastFetchedAt = Date.now();
      } catch (error) {
        console.error('加载技术教程失败', error);
        this.error = error instanceof Error ? error.message : '加载失败';
      } finally {
        this.isLoading = false;
      }
    },
  },

  persist: {
    key: 'tech-tutorials-store',
    storage: localStorage,
    pick: ['tutorials', 'loaded', 'lastFetchedAt'],
  },
});