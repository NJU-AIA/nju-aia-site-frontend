import { defineStore } from 'pinia'
import { api, type DocumentMeta } from '@/api/client'

interface EventMeta extends DocumentMeta {
  description?: string
}

export const useHomeStore = defineStore('home', {
  state: () => ({
    recentEvents: [] as EventMeta[],
    isLoading: false,
    loaded: false,
    error: null as string | null,
    lastFetchedAt: 0,
  }),

  getters: {
    hasData: (state) => state.recentEvents.length > 0,
  },

  actions: {
    async fetchRecentEvents() {
      if (this.isLoading) return

      const hasCachedData = this.loaded && this.hasData

      // 没缓存时才显示 loading
      if (!hasCachedData) {
        this.isLoading = true
      }

      this.error = null

      try {
        const docs = await api.getDocList('activity-posts')
        this.recentEvents = docs.slice(0, 3)
        this.loaded = true
        this.lastFetchedAt = Date.now()
      } catch (error) {
        console.error('加载近期活动失败', error)
        this.error = error instanceof Error ? error.message : '加载失败'
      } finally {
        this.isLoading = false
      }
    },

    clearRecentEvents() {
      this.recentEvents = []
      this.loaded = false
      this.error = null
      this.lastFetchedAt = 0
      this.isLoading = false
    },
  },

  persist: {
    key: 'home-store',
    storage: localStorage,
    pick: ['recentEvents', 'loaded', 'lastFetchedAt'],
  },
})