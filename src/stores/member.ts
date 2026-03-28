import { defineStore } from 'pinia'
import { api } from '@/api/client'

export interface VolunteerMember {
  name: string
  description: string
}

export type MemberEntry = string | VolunteerMember

export interface MemberGroup {
  year: string
  members: MemberEntry[]
}

export const useMemberStore = defineStore('member', {
  state: () => ({
    members: [] as MemberGroup[],
    isLoading: false,
    loaded: false,
    error: null as string | null,
    lastFetchedAt: 0,
  }),

  getters: {
    hasData: (state) => state.members.length > 0,
  },

  actions: {
    async fetchMembers() {
      if (this.isLoading) return

      const hasCachedData = this.loaded && this.hasData

      // 只有没有缓存时才显示 loading
      if (!hasCachedData) {
        this.isLoading = true
      }

      this.error = null

      try {
        const data = await api.getMembers()
        this.members = data || []
        this.loaded = true
        this.lastFetchedAt = Date.now()
      } catch (error) {
        console.error('加载成员墙数据失败', error)
        this.error = error instanceof Error ? error.message : '加载失败'
      } finally {
        this.isLoading = false
      }
    },

    clearMembers() {
      this.members = []
      this.loaded = false
      this.error = null
      this.lastFetchedAt = 0
      this.isLoading = false
    },
  },

  persist: {
    key: 'member-store',
    storage: localStorage,
    pick: ['members', 'loaded', 'lastFetchedAt'],
  },
})