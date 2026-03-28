import { defineStore } from 'pinia'
import { api, type DocumentMeta, type ViewMode } from '@/api/client'
import { parseMarkdownToSlides, type SlideNode } from '@/core/parser'

interface CachedDocumentContent {
  content: string
  parsedSlides: SlideNode[]
  fetchedAt: number
}

export const useReaderStore = defineStore('reader', {
  state: () => ({
    docList: [] as DocumentMeta[],
    docListLoading: false,

    documentModes: {} as Record<string, ViewMode>,
    documentCache: {} as Record<string, CachedDocumentContent>,

    currentDocId: '',
    currentMarkdown: '',
    currentSlides: [] as SlideNode[],
    currentViewMode: 'article' as ViewMode,

    error: null as string | null,
  }),

  getters: {
    groupedDocs: (state) => ({
      '活动推文': state.docList.filter(d => d.category === 'activity-posts'),
      '技术教程': state.docList.filter(d => d.category === 'tech-tutorials'),
    }),
  },

  actions: {
    async fetchDocList() {
      if (this.docListLoading) return

      this.docListLoading = true
      this.error = null

      try {
        const docs = await api.getDocList()
        this.docList = docs || []

        for (const doc of this.docList) {
          if (!this.documentModes[doc.id]) {
            this.documentModes[doc.id] = doc.defaultMode
          }
        }

        const validIds = new Set(this.docList.map(doc => doc.id))

        // 清除已经不存在的正文缓存
        Object.keys(this.documentCache).forEach((id) => {
          if (!validIds.has(id)) {
            delete this.documentCache[id]
          }
        })

        // 清除已经不存在的模式缓存
        Object.keys(this.documentModes).forEach((id) => {
          if (!validIds.has(id)) {
            delete this.documentModes[id]
          }
        })

        // 如果当前文章已被删除，清空当前内容
        if (this.currentDocId && !validIds.has(this.currentDocId)) {
          this.currentDocId = ''
          this.currentMarkdown = ''
          this.currentSlides = []
        }
      } catch (error) {
        console.error('加载文档列表失败', error)
        this.error = error instanceof Error ? error.message : '加载失败'
      } finally {
        this.docListLoading = false
      }
    },

    async loadDocument(id: string) {
      if (!id) return

      this.currentDocId = id
      this.currentViewMode = this.documentModes[id] || 'article'
      this.error = null

      const cached = this.documentCache[id]
      if (cached) {
        this.currentMarkdown = cached.content
        this.currentSlides = cached.parsedSlides
        return
      }

      await this.refreshDocument(id)
    },

    async refreshDocument(id: string) {
      if (!id) return

      this.currentDocId = id
      this.currentViewMode = this.documentModes[id] || 'article'
      this.error = null

      try {
        const data = await api.getDocContent(id)
        const content = data.content || ''
        const parsedSlides = content ? parseMarkdownToSlides(content) : []

        this.documentCache[id] = {
          content,
          parsedSlides,
          fetchedAt: Date.now(),
        }

        this.currentMarkdown = content
        this.currentSlides = parsedSlides
      } catch (error) {
        console.error('加载文档失败', error)
        this.error = error instanceof Error ? error.message : '加载失败'
        this.currentMarkdown = '# 文档加载失败\n请稍后重试。'
        this.currentSlides = parseMarkdownToSlides(this.currentMarkdown)
      }
    },

    async refreshCurrentDocument() {
      if (!this.currentDocId) return
      await this.refreshDocument(this.currentDocId)
    },

    updateCurrentMarkdown(markdown: string) {
      this.currentMarkdown = markdown
      this.currentSlides = markdown ? parseMarkdownToSlides(markdown) : []

      if (this.currentDocId) {
        this.documentCache[this.currentDocId] = {
          content: markdown,
          parsedSlides: this.currentSlides,
          fetchedAt: Date.now(),
        }
      }
    },

    cycleViewMode(id: string) {
      const viewModes: ViewMode[] = ['homework', 'slides', 'article']
      const currentMode = this.documentModes[id]
      if (!currentMode) return

      const idx = viewModes.indexOf(currentMode)
      const nextMode = viewModes[(idx + 1) % viewModes.length]

      this.documentModes[id] = nextMode

      if (id === this.currentDocId) {
        this.currentViewMode = nextMode
      }
    },
  },

  persist: {
    key: 'reader-store',
    storage: localStorage,
    pick: ['docList', 'documentModes', 'documentCache'],
  },
})