<template>
  <main class="h-[calc(100vh-3.5rem)] overflow-hidden bg-gray-50 dark:bg-gray-950">
    <div class="flex h-full">
      <aside class="flex w-[300px] flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div class="border-b border-gray-200 p-3 dark:border-gray-800">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">代码文件</h2>
            <span class="text-xs text-gray-400">{{ files.length }}</span>
          </div>
          <button
            class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="fetchFiles"
          >
            刷新
          </button>
          <p v-if="loadingList" class="mt-2 text-[11px] text-gray-400">正在加载列表...</p>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          <button
            v-for="file in files"
            :key="file.id"
            class="mb-1 w-full rounded-md border px-3 py-2 text-left transition-colors"
            :class="
              selectedFileId === file.id
                ? 'border-blue-200 bg-blue-50 text-[#40B3FF] dark:border-blue-900/50 dark:bg-blue-950/30'
                : 'border-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
            "
            @click="selectFile(file.id)"
          >
            <p class="truncate text-sm font-medium">{{ file.slug }}</p>
            <p class="mt-0.5 text-[11px] text-gray-400">{{ formatDate(file.publishedAt) }}</p>
          </button>
        </div>
      </aside>

      <section class="min-w-0 flex-1 overflow-y-auto p-4">
        <div v-if="loadingDetail" class="py-12 text-center text-sm text-gray-400">加载中...</div>
        <div v-else-if="!currentDoc" class="py-12 text-center text-sm text-gray-400">请选择左侧代码文件</div>
        <template v-else>
          <!-- <div class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3 dark:border-gray-800">
            <div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ currentDoc.slug }}</h1>
              <p class="text-xs text-gray-400">{{ formatDate(currentDoc.publishedAt) }}</p>
            </div>
            <button
              class="rounded-md bg-[#40B3FF] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              @click="copyText(allContentText, 'all')"
            >
              {{ copiedAll ? '已复制全部' : '复制全部' }}
            </button>
          </div> -->

          <div class="space-y-3">
            <article
              v-for="item in renderedBlocks"
              :key="item.block.id || `block-${item.index}`"
              class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <div class="mb-2 flex items-center justify-between">
                <p class="text-xs text-gray-500">Block #{{ item.index + 1 }} · {{ item.block.type }}<span v-if="item.block.language"> · {{ item.block.language }}</span></p>
                <div v-if="item.block.type === 'code'" class="flex items-center gap-2">
                  <button
                    class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    @click="copyText(item.block.content, 'block', item.block.id, item.index)"
                  >
                    {{ copyButtonLabel(item.block.id, item.index) }}
                  </button>
                </div>
              </div>

              <div
                v-if="item.block.type === 'markdown'"
                class="livecode-markdown text-sm leading-7 text-gray-800 dark:text-gray-200"
              >
                <AstRenderer
                  v-for="(node, nodeIndex) in item.markdownNodes"
                  :key="nodeKey(node, nodeIndex)"
                  :node="node"
                />
              </div>
              <div v-else class="livecode-code">
                <AstRenderer
                  :key="`code-${item.block.language || 'text'}-${item.block.content}`"
                  :node="item.codeNode"
                />
              </div>
            </article>
          </div>
        </template>

        <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { livecodesApi, type LivecodeBlock, type LivecodeDocument, type LivecodeListItem } from '@/api/livecodes'
import AstRenderer from '@/components/AstRenderer.vue'

const files = ref<LivecodeListItem[]>([])
const selectedFileId = ref('')
const currentDoc = ref<LivecodeDocument | null>(null)
const loadingList = ref(false)
const loadingDetail = ref(false)
const error = ref('')
const copiedAll = ref(false)
const copiedBlockKey = ref('')
const isDark = ref(typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false)
let darkModeObserver: MutationObserver | null = null
let copyFeedbackTimer: ReturnType<typeof setTimeout> | null = null

provide('isDark', isDark)

const orderedBlocks = computed<LivecodeBlock[]>(() => {
  if (!currentDoc.value) return []

  const ids = currentDoc.value.blockIds || []
  if (ids.length === 0) return currentDoc.value.blocks || []

  const map = new Map((currentDoc.value.blocks || []).map((block) => [block.id, block]))
  return ids.map((id) => map.get(id)).filter((block): block is LivecodeBlock => Boolean(block))
})

const renderedBlocks = computed(() => {
  return orderedBlocks.value.map((block, index) => {
    if (block.type === 'markdown') {
      return {
        block,
        index,
        markdownNodes: parseMarkdownNodes(block.content),
      }
    }

    return {
      block,
      index,
      codeNode: toCodeNode(block),
    }
  })
})

const allContentText = computed(() => {
  return orderedBlocks.value
    .map((block) => {
      if (block.type === 'code') {
        return `\`\`\`${block.language || ''}\n${block.content}\n\`\`\``
      }
      return block.content
    })
    .join('\n\n')
})

function parseMarkdownNodes(content: string): any[] {
  try {
    const ast = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(content || '')
    return Array.isArray((ast as any).children) ? (ast as any).children : []
  } catch {
    return [{ type: 'paragraph', children: [{ type: 'text', value: content || '' }] }]
  }
}

function toCodeNode(block: LivecodeBlock) {
  return {
    type: 'code',
    lang: block.language || 'text',
    value: block.content || '',
  }
}

function nodeKey(node: any, index: number): string {
  const value = typeof node?.value === 'string' ? node.value : ''
  const lang = typeof node?.lang === 'string' ? node.lang : ''
  return `${index}-${node?.type || 'unknown'}-${lang}-${value}`
}

function blockCopyKey(blockId: string | undefined, index: number): string {
  return blockId || `block-${index}`
}

function copyButtonLabel(blockId: string | undefined, index: number): string {
  return copiedBlockKey.value === blockCopyKey(blockId, index) ? '已复制' : '复制'
}

function clearCopyFeedbackTimer() {
  if (copyFeedbackTimer) {
    clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = null
  }
}

function scheduleCopyFeedbackReset() {
  clearCopyFeedbackTimer()
  copyFeedbackTimer = setTimeout(() => {
    copiedAll.value = false
    copiedBlockKey.value = ''
  }, 1500)
}

function formatDate(date?: string): string {
  if (!date) return '未知日期'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date

  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  })
}

async function copyText(text: string, target: 'all' | 'block', blockId?: string, blockIndex?: number) {
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    error.value = ''
    if (target === 'all') {
      copiedAll.value = true
      copiedBlockKey.value = ''
    } else {
      copiedAll.value = false
      copiedBlockKey.value = blockCopyKey(blockId, blockIndex || 0)
    }
    scheduleCopyFeedbackReset()
  } catch {
    error.value = '复制失败，请手动复制'
  }
}

async function fetchFiles() {
  loadingList.value = true
  error.value = ''

  try {
    const { data } = await livecodesApi.list()
    files.value = Array.isArray(data.items) ? data.items : []

    if (files.value.length === 0) {
      selectedFileId.value = ''
      currentDoc.value = null
      return
    }

    const exists = files.value.some((item) => item.id === selectedFileId.value)
    const nextId = exists ? selectedFileId.value : files.value[0].id
    await selectFile(nextId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文件列表失败'
  } finally {
    loadingList.value = false
  }
}

async function selectFile(fileId: string) {
  if (!fileId) return
  selectedFileId.value = fileId
  loadingDetail.value = true
  error.value = ''

  try {
    const { data } = await livecodesApi.getById(fileId)
    currentDoc.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文件失败'
    currentDoc.value = null
  } finally {
    loadingDetail.value = false
  }
}

onMounted(async () => {
  if (typeof document !== 'undefined') {
    darkModeObserver = new MutationObserver(() => {
      isDark.value = document.documentElement.classList.contains('dark')
    })
    darkModeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  await fetchFiles()
})

onBeforeUnmount(() => {
  darkModeObserver?.disconnect()
  clearCopyFeedbackTimer()
})
</script>

<style scoped>
.livecode-markdown :deep(.ast-paragraph:last-child) {
  margin-bottom: 0;
}

.livecode-code :deep(.ast-code-block) {
  margin: 0;
}

.livecode-code :deep(.ast-code-frame) {
  border: 1px solid #dbe1ea;
  border-radius: 10px;
  overflow: hidden;
  background: #f9fafb;
}

.livecode-code :deep(.ast-code-meta) {
  border-bottom: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #6b7280;
}

.livecode-code :deep(.ast-code-content pre) {
  font-size: 13px;
  line-height: 1.6;
}

:global(.dark) .livecode-code :deep(.ast-code-frame) {
  border-color: #374151;
  background: #0f172a;
}

:global(.dark) .livecode-code :deep(.ast-code-meta) {
  border-bottom-color: #1f2937;
  background: #111827;
  color: #9ca3af;
}
</style>
