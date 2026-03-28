import { defineStore } from 'pinia'
import { api } from '@/api/client'

export interface HonorAward {
  name: string
}

export interface HonorItem {
  event: string
  date: string
  awards: HonorAward[]
}

export const useHonorStore = defineStore('honor', {
  state: () => ({
    honors: [] as HonorItem[],
    isLoading: false,
    loaded: false,
    error: null as string | null,
    lastFetchedAt: 0,
  }),

  getters: {
    hasData: (state) => state.honors.length > 0,
  },

  actions: {
    async fetchHonors() {
      if (this.isLoading) return

      const hasCachedData = this.loaded && this.hasData

      // 只有没有缓存时才显示 loading
      if (!hasCachedData) {
        this.isLoading = true
      }

      this.error = null

      try {
        const data = await api.getHonors()
        this.honors = data || []
        this.loaded = true
        this.lastFetchedAt = Date.now()
      } catch (error) {
        console.error('加载荣誉墙数据失败', error)
        this.error = error instanceof Error ? error.message : '加载失败'
      } finally {
        this.isLoading = false
      }
    },

    clearHonors() {
      this.honors = []
      this.loaded = false
      this.error = null
      this.lastFetchedAt = 0
      this.isLoading = false
    },
  },

  persist: {
    key: 'honor-store',
    storage: localStorage,
    pick: ['honors', 'loaded', 'lastFetchedAt'],
  },
})