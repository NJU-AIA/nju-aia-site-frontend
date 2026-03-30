import { defineStore } from 'pinia';
import { articlesApi, type Article, type ArticleMode } from '@/api/articles';
import { parseMarkdownToSlides, type SlideNode } from '@/core/parser';

interface ReaderDocMeta {
  id: string;
  title: string;
  category: string;
  date: string;
  defaultMode: ArticleMode;
  author: string;
  cover?: string;
}

interface CachedDocumentContent {
  content: string;
  parsedSlides: SlideNode[];
  fetchedAt: number;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function mapArticleToDocMeta(article: Article): ReaderDocMeta {
  return {
    id: article.id,
    title: article.title,
    category: article.category,
    date: formatDate(article.createdAt || article.updatedAt),
    defaultMode: article.defaultMode,
    author: article.author,
    cover: article.cover,
  };
}

export const useReaderStore = defineStore('reader', {
  state: () => ({
    docList: [] as ReaderDocMeta[],
    docListLoading: false,

    documentModes: {} as Record<string, ArticleMode>,
    documentCache: {} as Record<string, CachedDocumentContent>,

    currentDocId: '',
    currentMarkdown: '',
    currentSlides: [] as SlideNode[],
    currentViewMode: 'article' as ArticleMode,

    error: null as string | null,
  }),

  getters: {
    groupedDocs: (state) => ({
      活动推文: state.docList.filter((d) => d.category === 'activity'),
      技术教程: state.docList.filter((d) => d.category === 'tutorial'),
    }),
  },

  actions: {
    async fetchDocList() {
      if (this.docListLoading) return;

      this.docListLoading = true;
      this.error = null;

      try {
        const { data } = await articlesApi.getArticles();
        const items = Array.isArray(data.items) ? data.items : [];

        this.docList = items.map(mapArticleToDocMeta);

        for (const doc of this.docList) {
          if (!this.documentModes[doc.id]) {
            this.documentModes[doc.id] = doc.defaultMode;
          }
        }

        const validIds = new Set(this.docList.map((doc) => doc.id));

        Object.keys(this.documentCache).forEach((id) => {
          if (!validIds.has(id)) {
            delete this.documentCache[id];
          }
        });

        Object.keys(this.documentModes).forEach((id) => {
          if (!validIds.has(id)) {
            delete this.documentModes[id];
          }
        });

        if (this.currentDocId && !validIds.has(this.currentDocId)) {
          this.currentDocId = '';
          this.currentMarkdown = '';
          this.currentSlides = [];
        }
      } catch (error) {
        console.error('加载文章列表失败', error);
        this.error = error instanceof Error ? error.message : '加载失败';
      } finally {
        this.docListLoading = false;
      }
    },

    async loadDocument(id: string) {
      if (!id) return;

      this.currentDocId = id;
      this.currentViewMode = this.documentModes[id] || 'article';
      this.error = null;

      const cached = this.documentCache[id];
      if (cached) {
        this.currentMarkdown = cached.content;
        this.currentSlides = cached.parsedSlides;
        return;
      }

      await this.refreshDocument(id);
    },

    async refreshDocument(id: string) {
      if (!id) return;

      this.currentDocId = id;
      this.currentViewMode = this.documentModes[id] || 'article';
      this.error = null;

      try {
        const { data } = await articlesApi.getArticleById(id);
        const content = data.content || '';
        const parsedSlides = content ? parseMarkdownToSlides(content) : [];

        this.documentModes[id] = data.defaultMode || 'article';

        this.documentCache[id] = {
          content,
          parsedSlides,
          fetchedAt: Date.now(),
        };

        this.currentMarkdown = content;
        this.currentSlides = parsedSlides;
        this.currentViewMode = this.documentModes[id];
      } catch (error) {
        console.error('加载文章失败', error);
        this.error = error instanceof Error ? error.message : '加载失败';
        this.currentMarkdown = '# 文档加载失败\n请稍后重试。';
        this.currentSlides = parseMarkdownToSlides(this.currentMarkdown);
      }
    },

    async refreshCurrentDocument() {
      if (!this.currentDocId) return;
      await this.refreshDocument(this.currentDocId);
    },

    updateCurrentMarkdown(markdown: string) {
      this.currentMarkdown = markdown;
      this.currentSlides = markdown ? parseMarkdownToSlides(markdown) : [];

      if (this.currentDocId) {
        this.documentCache[this.currentDocId] = {
          content: markdown,
          parsedSlides: this.currentSlides,
          fetchedAt: Date.now(),
        };
      }
    },

    cycleViewMode(id: string) {
      const viewModes: ArticleMode[] = ['homework', 'slide', 'article'];
      const currentMode = this.documentModes[id];
      if (!currentMode) return;

      const idx = viewModes.indexOf(currentMode);
      const nextMode = viewModes[(idx + 1) % viewModes.length];

      this.documentModes[id] = nextMode;

      if (id === this.currentDocId) {
        this.currentViewMode = nextMode;
      }
    },
  },

  persist: {
    key: 'reader-store',
    storage: localStorage,
    pick: ['docList', 'documentModes', 'documentCache'],
  },
});