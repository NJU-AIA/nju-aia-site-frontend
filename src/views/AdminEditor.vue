<script setup lang="ts">
import { ref, computed, onMounted, watch, provide, onUnmounted } from 'vue'
import { api, type DocumentMeta } from '@/api/client'
import { parseMarkdownToSlides, type SlideNode } from '@/core/parser'

import ArticleView from '@/components/ArticleView.vue'
import SlideView from '@/components/SlideView.vue'
import HomeworkView from '@/components/HomeworkView.vue'

const docList = ref<DocumentMeta[]>([])
const searchQuery = ref('')
const currentDoc = ref<Partial<DocumentMeta> & { content?: string }>({})
const isEditing = ref(false)
const isSaving = ref(false)

const previewSlides = ref<SlideNode[]>([])
const currentSlideIndex = ref(0) 

// 【修改点 1】：使用两个独立的状态控制面板显示，代替全屏控制
const showSidebar = ref(true)
const showEditor = ref(true)

const ASSET_BASE_URL = 'https://raw.githubusercontent.com/NJU-AIA/nju-aia.github.io/main/src';
provide('assetBaseUrl', ASSET_BASE_URL);

const filteredDocs = computed(() => {
  return docList.value.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    doc.id?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const fetchList = async () => {
  try {
    docList.value = await api.getDocList()
  } catch(e) {
    console.error("获取列表失败", e)
  }
}

onMounted(() => {
  fetchList()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(() => currentDoc.value.content, (newVal) => {
  if (newVal) {
    previewSlides.value = parseMarkdownToSlides(newVal)
  } else {
    previewSlides.value = []
  }
  currentSlideIndex.value = 0
})

watch(() => currentDoc.value.defaultMode, () => {
  currentSlideIndex.value = 0
})

const handleKeydown = (e: KeyboardEvent) => {
  // 【修改点 2】：退出沉浸模式（恢复所有面板）
  if (e.key === 'Escape') {
    showSidebar.value = true
    showEditor.value = true
  }
  
  if (currentDoc.value.defaultMode === 'slides' && previewSlides.value.length > 0) {
    const isInputActive = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
    // 只有在没隐藏编辑框并且正在输入时，才屏蔽翻页
    if (isInputActive && showEditor.value) return; 

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (currentSlideIndex.value < previewSlides.value.length - 1) currentSlideIndex.value++
    }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentSlideIndex.value > 0) currentSlideIndex.value--
    }
  }
}

const createNewDoc = () => {
  const timestamp = new Date().toISOString().split('T')[0];
  currentDoc.value = {
    id: `new-doc-${Date.now()}`,
    title: '未命名新文章',
    category: 'activity-posts',
    defaultMode: 'article',
    content: `# 新文章标题\n\n在这里开始编写...\n\n**日期**：${timestamp}`
  }
  isEditing.value = true
  showSidebar.value = true
  showEditor.value = true
}

const loadDoc = async (meta: DocumentMeta) => {
  try {
    const data = await api.getDocContent(meta.id)
    currentDoc.value = { ...meta, content: data.content }
    isEditing.value = true
  } catch (error) {
    alert('加载文章失败')
  }
}

const handleSave = async () => {
  if (!currentDoc.value.title || !currentDoc.value.id) return alert('标题和ID不能为空')
  isSaving.value = true
  try {
    await api.saveDoc(currentDoc.value as any)
    alert('保存成功！')
    await fetchList()
  } catch (error) {
    alert('保存失败，请检查后端服务')
  } finally {
    isSaving.value = false
  }
}

const handleDelete = async (id: string) => {
  if (!confirm('确定要永久删除这篇文章吗？操作不可逆！')) return
  try {
    await api.deleteDoc(id)
    alert('删除成功')
    if (currentDoc.value.id === id) {
      isEditing.value = false
      currentDoc.value = {}
    }
    await fetchList()
  } catch (error) {
    alert('删除失败')
  }
}
</script>

<template>
  <div class="h-screen w-screen flex bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-hidden font-sans">
    
    <aside v-show="showSidebar" class="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 transition-all">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
        <h1 class="font-bold text-lg text-blue-600 dark:text-blue-400">AIA 管理后台</h1>
        <a href="/" class="text-sm text-gray-500 hover:underline">返回首页</a>
      </div>
      
      <div class="p-4">
        <button @click="createNewDoc" class="w-full py-2 bg-[#40B3FF] hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          新建文章
        </button>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索 ID 或标题定位..." 
          class="w-full mt-4 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-transparent rounded focus:border-[#40B3FF] focus:ring-1 focus:ring-[#40B3FF] outline-none text-sm"
        />
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        <div 
          v-for="doc in filteredDocs" :key="doc.id"
          class="group p-3 rounded-lg cursor-pointer transition border border-transparent"
          :class="currentDoc.id === doc.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
          @click="loadDoc(doc)"
        >
          <div class="flex justify-between items-start">
            <h3 class="font-medium text-sm line-clamp-1 flex-1 pr-2" :title="doc.title">{{ doc.title }}</h3>
            <button @click.stop="handleDelete(doc.id)" class="text-red-500 opacity-0 group-hover:opacity-100 transition px-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded" title="删除">
              ×
            </button>
          </div>
          <div class="flex gap-2 mt-1.5 text-[10px] text-gray-500 font-mono">
            <span class="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded uppercase">{{ doc.category === 'activity-posts' ? '推文' : '教程' }}</span>
            <span>{{ doc.date }}</span>
          </div>
        </div>
      </div>
    </aside>

    <main v-if="isEditing" class="flex-1 flex flex-col h-full bg-gray-100 dark:bg-black relative transition-all">
      
      <header class="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 gap-4 shrink-0">
        <input v-model="currentDoc.title" class="text-lg font-bold bg-transparent border-none outline-none flex-1" placeholder="文章标题" />
        
        <select v-model="currentDoc.category" class="text-sm bg-gray-100 dark:bg-gray-800 border-none rounded px-3 py-1.5 outline-none cursor-pointer">
          <option value="activity-posts">分类：活动推文</option>
          <option value="tech-tutorials">分类：技术教程</option>
        </select>
        
        <select v-model="currentDoc.defaultMode" class="text-sm bg-gray-100 dark:bg-gray-800 border-none rounded px-3 py-1.5 outline-none cursor-pointer">
          <option value="article">模式：长文 (Article)</option>
          <option value="slides">模式：幻灯片 (Slides)</option>
          <option value="homework">模式：作业 (Homework)</option>
        </select>

        <button @click="handleSave" :disabled="isSaving" class="px-5 py-1.5 bg-[#954CE9] hover:bg-purple-600 text-white text-sm font-medium rounded shadow transition disabled:opacity-50">
          {{ isSaving ? '保存中...' : '💾 保存修改' }}
        </button>
      </header>

      <div class="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden">
        
        <div v-show="showEditor" class="w-1/2 h-full border-r border-gray-300 dark:border-gray-800 shrink-0">
          <textarea 
            v-model="currentDoc.content"
            class="w-full h-full p-6 bg-white dark:bg-[#0d1117] text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed resize-none outline-none custom-scrollbar"
            placeholder="支持使用 Markdown 语法，实时在右侧预览..."
          ></textarea>
        </div>

        <div 
          :class="showEditor ? 'w-1/2' : 'w-full'"
          class="bg-white dark:bg-gray-950 overflow-y-auto custom-scrollbar relative transition-all duration-300"
        >
          <div class="absolute top-4 right-6 flex items-center gap-3 z-50">
            <div v-if="currentDoc.defaultMode === 'slides' && previewSlides.length > 0" class="bg-gray-900/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-mono">
              {{ currentSlideIndex + 1 }} / {{ previewSlides.length }}
            </div>
            
            <button 
              @click="showEditor = !showEditor" 
              class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full shadow-sm hover:text-[#40B3FF] dark:hover:text-[#40B3FF] transition-all text-xs font-bold"
            >
              {{ showEditor ? '👁️ 隐藏编辑区' : '📝 显示编辑区' }}
            </button>

            <button 
              @click="showSidebar = !showSidebar" 
              class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full shadow-sm hover:text-[#40B3FF] dark:hover:text-[#40B3FF] transition-all text-xs font-bold"
            >
              {{ showSidebar ? '📚 隐藏侧边栏' : '📚 显示侧边栏' }}
            </button>

            <div v-if="!showSidebar || !showEditor" class="absolute top-10 right-0 opacity-50 text-[10px] text-gray-500 pointer-events-none whitespace-nowrap">
              按 Esc 恢复完整布局
            </div>
          </div>
          
          <transition name="fade" mode="out-in">
            <HomeworkView v-if="currentDoc.defaultMode === 'homework'" :slides="previewSlides" />
            
            <SlideView 
              v-else-if="currentDoc.defaultMode === 'slides' && previewSlides.length > 0" 
              :slide="previewSlides[currentSlideIndex]" 
            />
            
            <ArticleView v-else :slides="previewSlides" />
          </transition>
        </div>

      </div>
    </main>
    
    <main v-else class="flex-1 flex items-center justify-center text-gray-400">
      <div class="text-center">
        <div class="text-6xl mb-4">✍️</div>
        <p>从左侧选择一篇文章进行编辑，或点击“新建文章”</p>
      </div>
    </main>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>