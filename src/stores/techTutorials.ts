import { defineStore } from 'pinia'
import { api, type DocumentMeta } from '@/api/client'

export const useTechTutorialsStore = defineStore('techTutorials', {
  state: () => ({
    tutorials: [] as DocumentMeta[],
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
      if (this.isLoading) return

      const hasCachedData = this.loaded && this.hasData

      // 只有没有缓存时才显示 loading
      if (!hasCachedData) {
        this.isLoading = true
      }

      this.error = null

      try {
        const data = await api.getDocList('tech-tutorials')
        this.tutorials = data || []
        this.loaded = true
        this.lastFetchedAt = Date.now()
      } catch (error) {
        console.error('加载技术教程失败', error)
        this.error = error instanceof Error ? error.message : '加载失败'
      } finally {
        this.isLoading = false
      }
    },

    clearTutorials() {
      this.tutorials = []
      this.loaded = false
      this.error = null
      this.lastFetchedAt = 0
      this.isLoading = false
    },
  },

  persist: {
    key: 'tech-tutorials-store',
    storage: localStorage,
    pick: ['tutorials', 'loaded', 'lastFetchedAt'],
  },
})