<template>
  <div class="h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-gray-950">
    <div class="grid h-full grid-cols-1 md:grid-cols-3">
      <aside class="border-r border-gray-100 p-3 dark:border-gray-800">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-xs text-gray-400">Livecodes ({{ items.length }})</p>
          <div class="flex items-center gap-1">
            <button
              class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="fetchList"
            >
              刷新
            </button>
            <button
              class="rounded bg-[#40B3FF] px-2 py-1 text-xs font-medium text-white hover:opacity-90"
              @click="createNew"
            >
              新建
            </button>
          </div>
        </div>
        <p v-if="loading" class="mb-2 text-xs text-gray-400">加载中...</p>

        <div class="space-y-1 overflow-y-auto">
          <button
            v-for="item in items"
            :key="item.id"
            class="w-full rounded-lg border px-3 py-2 text-left transition-colors"
            :class="
              selectedId === item.id
                ? 'border-blue-100 bg-blue-50 text-[#40B3FF] dark:border-blue-900/50 dark:bg-blue-950/30'
                : 'border-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
            "
            @click="selectItem(item.id)"
          >
            <p class="truncate text-sm font-medium">{{ item.slug }}</p>
            <p class="mt-0.5 text-[11px] text-gray-400">{{ item.publishedAt || '未设置日期' }}</p>
          </button>
        </div>
      </aside>

      <section class="border-r border-gray-100 p-4 dark:border-gray-800 md:col-span-1">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ isCreating ? '新建 livecode' : '编辑 livecode' }}
          </p>
          <div class="flex items-center gap-1">
            <button
              class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              @click="resetForm"
            >
              重置
            </button>
            <button
              class="rounded bg-[#40B3FF] px-2 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              :disabled="saving"
              @click="saveDocument"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>
            <button
              v-if="selectedId && !isCreating"
              class="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400"
              :disabled="saving"
              @click="deleteDocument"
            >
              删除
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs text-gray-500">Slug</label>
            <input
              v-model.trim="form.slug"
              type="text"
              placeholder="python-basic-demo"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs text-gray-500">发布日期</label>
            <input
              v-model="form.publishedAt"
              type="date"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div class="pt-1">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-xs text-gray-500">Blocks</p>
              <div class="flex items-center gap-1">
                <button
                  class="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  @click="addBlock('markdown')"
                >
                  + Markdown
                </button>
                <button
                  class="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  @click="addBlock('code')"
                >
                  + Code
                </button>
              </div>
            </div>

            <div class="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
              <article
                v-for="(block, index) in form.blocks"
                :key="`block-${index}`"
                class="rounded-lg border border-gray-100 p-2 dark:border-gray-800"
              >
                <div class="mb-2 grid grid-cols-3 gap-2">
                  <select
                    v-model="block.type"
                    class="rounded border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="markdown">markdown</option>
                    <option value="code">code</option>
                  </select>
                  <input
                    v-model.number="block.order"
                    type="number"
                    min="1"
                    class="rounded border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <button
                    class="rounded border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/20"
                    @click="removeBlock(index)"
                  >
                    删除
                  </button>
                </div>

                <input
                  v-model.trim="block.language"
                  type="text"
                  :disabled="block.type !== 'code'"
                  placeholder="语言：python / js / cpp"
                  class="mb-2 w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-[#40B3FF] disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <textarea
                  v-model="block.content"
                  rows="5"
                  placeholder="输入 block 内容"
                  class="w-full rounded border border-gray-200 bg-white px-2 py-1.5 font-mono text-xs leading-relaxed outline-none focus:border-[#40B3FF] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </article>
            </div>
          </div>

          <p v-if="message" class="text-xs text-emerald-500">{{ message }}</p>
          <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
        </div>
      </section>

      <section class="p-4 md:col-span-1">
        <div class="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">实时预览</p>
          <button
            class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="copyPreview"
          >
            复制整篇
          </button>
        </div>

        <div class="max-h-[72vh] space-y-2 overflow-y-auto">
          <article
            v-for="(block, index) in previewBlocks"
            :key="`preview-${index}`"
            class="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
          >
            <p class="mb-2 text-[11px] text-gray-400">
              #{{ block.order }} · {{ block.type }}<span v-if="block.language"> · {{ block.language }}</span>
            </p>
            <pre
              class="overflow-x-auto rounded bg-gray-50 p-2 text-xs leading-relaxed text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            ><code>{{ block.content }}</code></pre>
          </article>
          <p v-if="previewBlocks.length === 0" class="text-sm text-gray-400">暂无内容</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  livecodesApi,
  type LivecodeBlockRequest,
  type LivecodeBlockType,
  type LivecodeDocument,
  type LivecodeListItem,
  type LivecodeUpsertRequest,
} from '@/api/livecodes'

interface FormBlock extends LivecodeBlockRequest {
  id?: string
}

interface FormState {
  slug: string
  publishedAt: string
  blocks: FormBlock[]
}

const items = ref<LivecodeListItem[]>([])
const selectedId = ref('')
const isCreating = ref(false)
const saving = ref(false)
const error = ref('')
const message = ref('')
const loading = ref(false)

const form = ref<FormState>(createEmptyForm())

function today() {
  return new Date().toISOString().slice(0, 10)
}

function createBlock(type: LivecodeBlockType, order: number): FormBlock {
  return {
    type,
    order,
    language: type === 'code' ? 'python' : '',
    content: '',
  }
}

function createEmptyForm(): FormState {
  return {
    slug: '',
    publishedAt: today(),
    blocks: [createBlock('code', 1)],
  }
}

const previewBlocks = computed(() => {
  return [...form.value.blocks].sort((a, b) => a.order - b.order)
})

function resetMessage() {
  error.value = ''
  message.value = ''
}

function createNew() {
  selectedId.value = ''
  isCreating.value = true
  form.value = createEmptyForm()
  resetMessage()
}

function resetForm() {
  if (isCreating.value || !selectedId.value) {
    form.value = createEmptyForm()
    return
  }
  void selectItem(selectedId.value)
}

function addBlock(type: LivecodeBlockType) {
  const order = form.value.blocks.length + 1
  form.value.blocks.push(createBlock(type, order))
}

function removeBlock(index: number) {
  form.value.blocks.splice(index, 1)
  normalizeBlockOrder()
}

function normalizeBlockOrder() {
  const sorted = [...form.value.blocks].sort((a, b) => a.order - b.order)
  form.value.blocks = sorted.map((block, index) => ({
    ...block,
    order: index + 1,
  }))
}

function applyDetail(detail: LivecodeDocument) {
  form.value = {
    slug: detail.slug || '',
    publishedAt: detail.publishedAt || today(),
    blocks: Array.isArray(detail.blocks) && detail.blocks.length > 0
      ? detail.blocks
          .map((block) => ({
            id: block.id,
            type: block.type,
            order: block.order,
            language: block.language || '',
            content: block.content || '',
          }))
          .sort((a, b) => a.order - b.order)
      : [createBlock('code', 1)],
  }
}

async function fetchList() {
  loading.value = true
  resetMessage()

  try {
    const { data } = await livecodesApi.list()
    items.value = Array.isArray(data.items) ? data.items : []

    if (items.value.length === 0) {
      createNew()
      return
    }

    if (!selectedId.value || !items.value.some((item) => item.id === selectedId.value)) {
      await selectItem(items.value[0].id)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载列表失败'
  } finally {
    loading.value = false
  }
}

async function selectItem(id: string) {
  if (!id) return

  selectedId.value = id
  isCreating.value = false
  resetMessage()

  try {
    const { data } = await livecodesApi.getById(id)
    applyDetail(data)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载详情失败'
  }
}

function buildPayload(): LivecodeUpsertRequest | null {
  const slug = form.value.slug.trim()
  const publishedAt = form.value.publishedAt.trim()
  const blocks = [...form.value.blocks]
    .map((block) => ({
      type: block.type,
      order: Number(block.order),
      language: block.type === 'code' ? block.language?.trim() || undefined : undefined,
      content: block.content,
    }))
    .filter((block) => block.content.trim().length > 0)
    .sort((a, b) => a.order - b.order)
    .map((block, index) => ({
      ...block,
      order: index + 1,
    }))

  if (!slug) {
    error.value = 'slug 不能为空'
    return null
  }

  if (!publishedAt) {
    error.value = '发布日期不能为空'
    return null
  }

  if (blocks.length === 0) {
    error.value = '至少需要一个非空 block'
    return null
  }

  return {
    slug,
    publishedAt,
    blocks,
  }
}

async function saveDocument() {
  resetMessage()

  const payload = buildPayload()
  if (!payload) return

  saving.value = true

  try {
    if (selectedId.value && !isCreating.value) {
      await livecodesApi.update(selectedId.value, payload)
      message.value = '更新成功'
      await selectItem(selectedId.value)
    } else {
      const { data } = await livecodesApi.create(payload)
      message.value = '创建成功'
      await fetchList()

      const createdId = typeof data?.id === 'string' ? data.id : ''
      if (createdId) {
        await selectItem(createdId)
      } else {
        const matched = items.value.find((item) => item.slug === payload.slug)
        if (matched) {
          await selectItem(matched.id)
        }
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    saving.value = false
  }
}

async function deleteDocument() {
  if (!selectedId.value || isCreating.value) return

  const confirmed = window.confirm(`确认删除 livecode "${form.value.slug}" 吗？`)
  if (!confirmed) return

  resetMessage()
  saving.value = true

  try {
    await livecodesApi.remove(selectedId.value)
    message.value = '删除成功'
    createNew()
    await fetchList()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除失败'
  } finally {
    saving.value = false
  }
}

async function copyPreview() {
  const text = previewBlocks.value
    .map((block) => {
      if (block.type === 'code') {
        return `\`\`\`${block.language || ''}\n${block.content}\n\`\`\``
      }
      return block.content
    })
    .join('\n\n')

  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    message.value = '已复制'
  } catch {
    error.value = '复制失败，请手动复制'
  }
}

onMounted(async () => {
  await fetchList()
})
</script>
