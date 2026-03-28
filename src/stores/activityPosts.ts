import { defineStore } from 'pinia'
import { api, type DocumentMeta } from '@/api/client'

export const useActivityPostsStore = defineStore('activityPosts', {
  state: () => ({
    posts: [] as DocumentMeta[],
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
      if (this.isLoading) return

      const hasCachedData = this.loaded && this.hasData

      // 只有没有缓存时才显示 loading
      if (!hasCachedData) {
        this.isLoading = true
      }

      this.error = null

      try {
        const data = await api.getDocList('activity-posts')
        this.posts = data || []
        this.loaded = true
        this.lastFetchedAt = Date.now()
      } catch (error) {
        console.error('加载活动推文失败', error)
        this.error = error instanceof Error ? error.message : '加载失败'
      } finally {
        this.isLoading = false
      }
    },

    clearPosts() {
      this.posts = []
      this.loaded = false
      this.error = null
      this.lastFetchedAt = 0
      this.isLoading = false
    },
  },

  persist: {
    key: 'activity-posts-store',
    storage: localStorage,
    pick: ['posts', 'loaded', 'lastFetchedAt'],
  },
})