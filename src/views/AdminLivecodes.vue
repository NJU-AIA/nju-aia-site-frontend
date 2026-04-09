<template>
  <div class="h-[calc(100vh-3.5rem)] overflow-hidden bg-gray-50 dark:bg-gray-950">
    <div class="flex h-full">
      <aside class="flex w-[300px] flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div class="border-b border-gray-200 p-3 dark:border-gray-800">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100">代码文件</h2>
            <span class="text-xs text-gray-400">{{ files.length }}</span>
          </div>
          <div class="flex gap-2">
            <button
              class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="fetchFiles"
            >
              刷新
            </button>
            <button
              class="rounded-md bg-[#40B3FF] px-2 py-1 text-xs font-medium text-white hover:opacity-90"
              @click="startCreateFile"
            >
              新建文件
            </button>
          </div>
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
            <p class="mt-0.5 text-[11px] text-gray-400">{{ file.publishedAt || '未设置日期' }}</p>
          </button>
        </div>
      </aside>

      <main class="flex min-w-0 flex-1 flex-col">
        <div class="border-b border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h1 class="text-sm font-semibold text-gray-900 dark:text-gray-100">文件与 Block 编辑</h1>
            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                @click="resetCurrent"
              >
                重置
              </button>
              <button
                class="rounded-md bg-[#40B3FF] px-2 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                :disabled="saving"
                @click="saveFile"
              >
                {{ saving ? '保存中...' : '保存文件' }}
              </button>
              <button
                v-if="selectedFileId"
                class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
                :disabled="saving"
                @click="deleteFile"
              >
                删除文件
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs text-gray-500">Slug</label>
              <input
                v-model.trim="form.slug"
                type="text"
                placeholder="python-basic-demo"
                :disabled="Boolean(selectedFileId)"
                class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#40B3FF] disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs text-gray-500">发布日期</label>
              <input
                v-model="form.publishedAt"
                type="date"
                :disabled="Boolean(selectedFileId)"
                class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#40B3FF] disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <p class="mt-2 text-[11px] text-gray-400">文件层通过 `/livecodes` 接口保存，Block 层通过 `/blocks` 接口单独增删改。</p>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Block 列表</h3>
            <div class="flex items-center gap-2">
              <button
                class="rounded border px-2 py-1 text-xs"
                :class="
                  viewMode === 'edit'
                    ? 'border-blue-200 bg-blue-50 text-[#40B3FF] dark:border-blue-900/50 dark:bg-blue-950/30'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                "
                @click="viewMode = 'edit'"
              >
                编辑模式
              </button>
              <button
                class="rounded border px-2 py-1 text-xs"
                :class="
                  viewMode === 'preview'
                    ? 'border-blue-200 bg-blue-50 text-[#40B3FF] dark:border-blue-900/50 dark:bg-blue-950/30'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                "
                @click="viewMode = 'preview'"
              >
                预览模式
              </button>
              <button
                class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                @click="addDraftBlock('markdown')"
              >
                + Markdown
              </button>
              <button
                class="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                @click="addDraftBlock('code')"
              >
                + Code
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <article
              v-for="(block, index) in form.blocks"
              :key="block.id || `draft-${index}`"
              class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <div class="mb-2 flex items-center justify-between">
                <p class="text-xs text-gray-500">Block #{{ index + 1 }} <span v-if="block.id" class="text-gray-400">({{ block.id }})</span></p>
                <div class="flex gap-2">
                  <button
                    class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    :disabled="index === 0"
                    @click="moveBlock(index, -1)"
                  >
                    上移
                  </button>
                  <button
                    class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    :disabled="index === form.blocks.length - 1"
                    @click="moveBlock(index, 1)"
                  >
                    下移
                  </button>
                  <button
                    class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    :disabled="!selectedFileId"
                    @click="saveSingleBlock(index)"
                  >
                    {{ block.id ? '更新Block' : '创建Block' }}
                  </button>
                  <button
                    class="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20"
                    @click="removeSingleBlock(index)"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div v-if="viewMode === 'edit'" class="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <select
                  v-model="block.type"
                  class="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="markdown">markdown</option>
                  <option value="code">code</option>
                </select>
                <input
                  v-model.trim="block.language"
                  type="text"
                  :disabled="block.type !== 'code'"
                  placeholder="语言：python / js / cpp"
                  class="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#40B3FF] disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              <template v-if="block.type === 'code'">
                <div v-if="viewMode === 'edit'">
                  <p class="mb-2 text-[11px] text-gray-400">代码编辑</p>
                  <textarea
                    v-model="block.content"
                    rows="12"
                    placeholder="输入代码内容"
                    class="w-full rounded-md border border-gray-200 bg-white px-2 py-2 font-mono text-xs leading-relaxed outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>

                <div v-else class="admin-livecode-preview">
                  <p class="mb-2 text-[11px] text-gray-400">高亮预览</p>
                  <div class="rounded-md bg-gray-50 p-2 dark:bg-gray-950">
                    <AstRenderer
                      :key="`code-preview-${index}-${block.language || 'text'}-${block.content}`"
                      :node="toCodeNode(block)"
                    />
                  </div>
                </div>
              </template>

              <template v-else>
                <textarea
                  v-if="viewMode === 'edit'"
                  v-model="block.content"
                  rows="8"
                  placeholder="输入 block 内容"
                  class="w-full rounded-md border border-gray-200 bg-white px-2 py-2 font-mono text-xs leading-relaxed outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />

                <div v-else class="admin-livecode-preview border-t border-gray-100 pt-3 dark:border-gray-800">
                  <p class="mb-2 text-[11px] text-gray-400">实时预览</p>
                  <div
                    class="rounded-md bg-gray-50 p-3 text-sm leading-7 text-gray-800 dark:bg-gray-950 dark:text-gray-200"
                  >
                    <AstRenderer
                      v-for="(node, nodeIndex) in parseMarkdownNodes(block.content)"
                      :key="nodeKey(node, nodeIndex)"
                      :node="node"
                    />
                  </div>
                </div>
              </template>
            </article>

            <p v-if="form.blocks.length === 0" class="text-xs text-gray-400">暂无 block，点击上方按钮添加。</p>
          </div>
        </div>

        <div v-if="message || error" class="border-t border-gray-200 bg-white px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900">
          <p v-if="message" class="text-emerald-600 dark:text-emerald-400">{{ message }}</p>
          <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {
  livecodesApi,
  type LivecodeBlock,
  type LivecodeBlockRequest,
  type LivecodeBlockType,
  type LivecodeDocument,
  type LivecodeListItem,
  type LivecodeUpsertRequest,
} from '@/api/livecodes'
import AstRenderer from '@/components/AstRenderer.vue'

interface EditableBlock {
  id?: string
  type: LivecodeBlockType
  language?: string
  content: string
}

interface LivecodeForm {
  slug: string
  publishedAt: string
  blocks: EditableBlock[]
}

const files = ref<LivecodeListItem[]>([])
const selectedFileId = ref('')
const saving = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')
const original = ref<LivecodeDocument | null>(null)
const viewMode = ref<'edit' | 'preview'>('edit')
const isDark = ref(typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false)
let darkModeObserver: MutationObserver | null = null

provide('isDark', isDark)

const form = ref<LivecodeForm>(createEmptyForm())

function createEmptyForm(): LivecodeForm {
  return {
    slug: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    blocks: [],
  }
}

function resetStatus() {
  message.value = ''
  error.value = ''
}

function startCreateFile() {
  selectedFileId.value = ''
  original.value = null
  form.value = createEmptyForm()
  resetStatus()
}

function toPayload(block: EditableBlock): LivecodeBlockRequest {
  return {
    type: block.type,
    language: block.type === 'code' ? block.language?.trim() || undefined : undefined,
    content: block.content.trim(),
  }
}

function parseMarkdownNodes(content: string): any[] {
  try {
    const ast = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(content || '')
    return Array.isArray((ast as any).children) ? (ast as any).children : []
  } catch {
    return [{ type: 'paragraph', children: [{ type: 'text', value: content || '' }] }]
  }
}

function nodeKey(node: any, index: number): string {
  const value = typeof node?.value === 'string' ? node.value : ''
  const lang = typeof node?.lang === 'string' ? node.lang : ''
  return `${index}-${node?.type || 'unknown'}-${lang}-${value}`
}

function toCodeNode(block: EditableBlock) {
  return {
    type: 'code',
    lang: block.language || 'text',
    value: block.content || '',
  }
}

function orderBlocks(doc: LivecodeDocument): LivecodeBlock[] {
  const ids = doc.blockIds || []
  if (ids.length === 0) return doc.blocks || []

  const map = new Map((doc.blocks || []).map((block) => [block.id, block]))
  return ids.map((id) => map.get(id)).filter((block): block is LivecodeBlock => Boolean(block))
}

function applyDocument(doc: LivecodeDocument) {
  const ordered = orderBlocks(doc)
  form.value = {
    slug: doc.slug || '',
    publishedAt: doc.publishedAt || new Date().toISOString().slice(0, 10),
    blocks: ordered.map((block) => ({
      id: block.id,
      type: block.type,
      language: block.language || '',
      content: block.content || '',
    })),
  }
}

async function fetchFiles() {
  loading.value = true
  resetStatus()

  try {
    const { data } = await livecodesApi.list()
    files.value = Array.isArray(data.items) ? data.items : []

    if (files.value.length === 0) {
      startCreateFile()
      return
    }

    const exists = files.value.some((item) => item.id === selectedFileId.value)
    const nextId = exists ? selectedFileId.value : files.value[0].id

    if (nextId) {
      await selectFile(nextId)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文件列表失败'
  } finally {
    loading.value = false
  }
}

async function selectFile(id: string) {
  if (!id) return
  resetStatus()

  try {
    const { data } = await livecodesApi.getById(id)
    selectedFileId.value = id
    original.value = data
    applyDocument(data)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载文件详情失败'
  }
}

function resetCurrent() {
  if (!original.value) {
    startCreateFile()
    return
  }
  applyDocument(original.value)
  resetStatus()
}

function ensureFileMeta(): LivecodeUpsertRequest | null {
  const slug = form.value.slug.trim()
  const publishedAt = form.value.publishedAt.trim()

  if (!slug) {
    error.value = 'slug 不能为空'
    return null
  }

  if (!publishedAt) {
    error.value = '发布日期不能为空'
    return null
  }

  return { slug, publishedAt }
}

async function syncOrder(fileId: string) {
  const ids = form.value.blocks.map((block) => block.id).filter((id): id is string => Boolean(id))
  await livecodesApi.updateBlockIds(fileId, { blockIds: ids })
}

function validateBlock(block: EditableBlock): string {
  if (!block.content.trim()) return 'block content 不能为空'
  if (block.type === 'code' && !block.language?.trim()) return 'code block 必须填写 language'
  return ''
}

async function saveFile() {
  resetStatus()

  const meta = ensureFileMeta()
  if (!meta) return

  saving.value = true

  try {
    if (!selectedFileId.value) {
      const createRes = await livecodesApi.createDocument(meta)
      const fileId = createRes.data?.id || ''

      if (!fileId) {
        throw new Error('文件创建成功，但未获取到文件 ID')
      }

      selectedFileId.value = fileId

      for (let i = 0; i < form.value.blocks.length; i += 1) {
        const block = form.value.blocks[i]
        if (!block.content.trim()) continue

        const invalidMessage = validateBlock(block)
        if (invalidMessage) {
          throw new Error(`Block #${i + 1}: ${invalidMessage}`)
        }

        const res = await livecodesApi.createBlock(fileId, toPayload(block))
        form.value.blocks[i].id = res.data.id
      }

      form.value.blocks = form.value.blocks.filter((block) => block.id)
      await syncOrder(fileId)

      await fetchFiles()
      await selectFile(fileId)
      message.value = '文件创建并保存完成'
      return
    }

    for (let i = 0; i < form.value.blocks.length; i += 1) {
      const block = form.value.blocks[i]
      if (!block.content.trim()) {
        if (block.id) {
          throw new Error(`Block #${i + 1}: 已有 block 内容不能为空，请删除该 block 或填写内容`)
        }
        continue
      }

      const invalidMessage = validateBlock(block)
      if (invalidMessage) {
        throw new Error(`Block #${i + 1}: ${invalidMessage}`)
      }

      if (block.id) {
        await livecodesApi.updateBlock(selectedFileId.value, block.id, toPayload(block))
      } else {
        const res = await livecodesApi.createBlock(selectedFileId.value, toPayload(block))
        form.value.blocks[i].id = res.data.id
      }
    }

    form.value.blocks = form.value.blocks.filter((block) => block.id)
    await syncOrder(selectedFileId.value)
    await selectFile(selectedFileId.value)
    message.value = '文件已保存'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    saving.value = false
  }
}

function addDraftBlock(type: LivecodeBlockType) {
  form.value.blocks.push({
    type,
    language: type === 'code' ? 'python' : undefined,
    content: '',
  })
}

async function moveBlock(index: number, direction: -1 | 1) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= form.value.blocks.length) return

  const [target] = form.value.blocks.splice(index, 1)
  form.value.blocks.splice(nextIndex, 0, target)

  const fileId = selectedFileId.value
  if (!fileId) return

  try {
    await syncOrder(fileId)
    message.value = 'Block 顺序已更新'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '更新顺序失败'
  }
}

async function saveSingleBlock(index: number) {
  resetStatus()

  const fileId = selectedFileId.value
  if (!fileId) {
    error.value = '请先保存文件，再保存单个 block'
    return
  }

  const block = form.value.blocks[index]
  if (!block || !block.content.trim()) {
    error.value = 'block 内容不能为空'
    return
  }

  const invalidMessage = validateBlock(block)
  if (invalidMessage) {
    error.value = `Block #${index + 1}: ${invalidMessage}`
    return
  }

  try {
    if (block.id) {
      await livecodesApi.updateBlock(fileId, block.id, toPayload(block))
      message.value = `Block #${index + 1} 更新成功`
    } else {
      const res = await livecodesApi.createBlock(fileId, toPayload(block))
      form.value.blocks[index].id = res.data.id
      await syncOrder(fileId)
      message.value = `Block #${index + 1} 创建成功`
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存 block 失败'
  }
}

async function removeSingleBlock(index: number) {
  resetStatus()

  const fileId = selectedFileId.value
  const block = form.value.blocks[index]
  if (!block) return

  try {
    if (fileId && block.id) {
      await livecodesApi.removeBlock(fileId, block.id)
    }

    form.value.blocks.splice(index, 1)

    if (fileId) {
      await syncOrder(fileId)
    }

    message.value = `Block #${index + 1} 已删除`
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除 block 失败'
  }
}

async function deleteFile() {
  const id = selectedFileId.value
  if (!id) return

  const confirmed = window.confirm(`确认删除文件 ${form.value.slug} 吗？`)
  if (!confirmed) return

  resetStatus()

  try {
    await livecodesApi.remove(id)
    startCreateFile()
    await fetchFiles()
    message.value = '文件已删除'
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除文件失败'
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
})
</script>

<style scoped>
.admin-livecode-preview :deep(.ast-code-block) {
  margin: 0;
}

.admin-livecode-preview :deep(.ast-code-frame) {
  border: 1px solid #dbe1ea;
  border-radius: 10px;
  overflow: hidden;
  background: #f9fafb;
}

.admin-livecode-preview :deep(.ast-code-meta) {
  border-bottom: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #6b7280;
}

.admin-livecode-preview :deep(.ast-code-content pre) {
  font-size: 13px;
  line-height: 1.6;
}

:global(.dark) .admin-livecode-preview :deep(.ast-code-frame) {
  border-color: #374151;
  background: #0f172a;
}

:global(.dark) .admin-livecode-preview :deep(.ast-code-meta) {
  border-bottom-color: #1f2937;
  background: #111827;
  color: #9ca3af;
}
</style>
