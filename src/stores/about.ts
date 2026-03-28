import { defineStore } from 'pinia'
import { api, type AboutData } from '@/api/client'

const getDefaultAboutData = (): AboutData => ({
  title: '',
  intro: '',
  goals: [],
  activities: [],
  contacts: [],
  footer: '',
})

export const useAboutStore = defineStore('about', {
  state: () => ({
    aboutData: getDefaultAboutData() as AboutData,
    isLoading: false,      // 首次加载
    isRefreshing: false,   // 有缓存时后台刷新
    loaded: false,
    error: null as string | null,
    lastFetchedAt: 0,
  }),

  getters: {
    hasData: (state) => !!state.aboutData.title,
  },

  actions: {
    async fetchAbout() {
      if (this.isLoading || this.isRefreshing) return

      const hasCachedData = this.loaded && this.hasData

      if (hasCachedData) {
        this.isRefreshing = true
      } else {
        this.isLoading = true
      }

      this.error = null

      try {
        const data = await api.getAbout()
        this.aboutData = data
        this.loaded = true
        this.lastFetchedAt = Date.now()
      } catch (error) {
        console.error('加载关于我们数据失败', error)
        this.error = error instanceof Error ? error.message : '加载失败'
      } finally {
        this.isLoading = false
        this.isRefreshing = false
      }
    },

    async refreshAbout() {
      await this.fetchAbout()
    },

    clearAbout() {
      this.aboutData = getDefaultAboutData()
      this.loaded = false
      this.error = null
      this.lastFetchedAt = 0
      this.isLoading = false
      this.isRefreshing = false
    },
  },

  persist: {
    key: 'about-store',
    storage: localStorage,
    pick: ['aboutData', 'loaded', 'lastFetchedAt'],
  },
})