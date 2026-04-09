<template>
  <main class="min-h-screen bg-gray-50 px-4 pb-8 pt-20 dark:bg-gray-950 md:px-8">
    <section class="mx-auto mb-6 flex max-w-7xl items-end justify-between">
      <div>
        <p class="mb-2 text-xs font-medium uppercase tracking-widest text-[#40B3FF]">Livecodes</p>
        <h1 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">代码实时预览区</h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">查看并复制最新代码片段。</p>
      </div>
      <button
        class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        @click="fetchList"
      >
        刷新
      </button>
    </section>

    <section class="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-3">
      <aside class="rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <p class="px-2 pb-2 text-xs text-gray-400">共 {{ items.length }} 条</p>
        <p v-if="loadingList" class="px-2 pb-2 text-xs text-gray-400">正在加载列表...</p>

        <div class="max-h-[70vh] space-y-1 overflow-y-auto">
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
            <p class="mt-0.5 text-[11px] text-gray-400">{{ formatDate(item.publishedAt) }}</p>
          </button>
        </div>
      </aside>

      <article class="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
        <div v-if="loadingDetail" class="py-12 text-center text-sm text-gray-400">加载中...</div>
        <div v-else-if="!currentDoc" class="py-12 text-center text-sm text-gray-400">请选择一条代码记录</div>
        <template v-else>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-50">{{ currentDoc.slug }}</h2>
              <p class="text-xs text-gray-400">{{ formatDate(currentDoc.publishedAt) }}</p>
            </div>
            <button
              class="rounded-lg bg-[#40B3FF] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              @click="copyText(fullText)"
            >
              复制整篇
            </button>
          </div>

          <div class="space-y-3">
            <section
              v-for="(block, index) in orderedBlocks"
              :key="block.id || `${block.type}-${index}-${block.order}`"
              class="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
            >
              <div class="mb-2 flex items-center justify-between">
                <p class="text-xs text-gray-400">
                  #{{ block.order }} · {{ block.type }}<span v-if="block.language"> · {{ block.language }}</span>
                </p>
                <button
                  v-if="block.type === 'code'"
                  class="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  @click="copyText(block.content)"
                >
                  复制
                </button>
              </div>
              <pre
                class="overflow-x-auto rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-800 dark:bg-gray-950 dark:text-gray-200"
              ><code>{{ block.content }}</code></pre>
            </section>
          </div>
        </template>

        <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { livecodesApi, type LivecodeBlock, type LivecodeDocument, type LivecodeListItem } from '@/api/livecodes'

const items = ref<LivecodeListItem[]>([])
const selectedId = ref('')
const currentDoc = ref<LivecodeDocument | null>(null)
const loadingList = ref(false)
const loadingDetail = ref(false)
const error = ref('')

const orderedBlocks = computed<LivecodeBlock[]>(() => {
  if (!currentDoc.value) return []
  return [...currentDoc.value.blocks].sort((a, b) => a.order - b.order)
})

const fullText = computed(() => {
  return orderedBlocks.value
    .map((block) => {
      if (block.type === 'code') {
        return `\`\`\`${block.language || ''}\n${block.content}\n\`\`\``
      }
      return block.content
    })
    .join('\n\n')
})

function formatDate(date?: string) {
  if (!date) return '未知日期'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  })
}

async function copyText(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    error.value = '复制失败，请手动复制'
  }
}

async function fetchList() {
  loadingList.value = true
  error.value = ''

  try {
    const { data } = await livecodesApi.list()
    items.value = Array.isArray(data.items) ? data.items : []

    if (items.value.length === 0) {
      currentDoc.value = null
      selectedId.value = ''
      return
    }

    const nextId = selectedId.value || items.value[0].id
    await selectItem(nextId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载列表失败'
  } finally {
    loadingList.value = false
  }
}

async function selectItem(id: string) {
  if (!id) return
  selectedId.value = id
  loadingDetail.value = true
  error.value = ''

  try {
    const { data } = await livecodesApi.getById(id)
    currentDoc.value = data
  } catch (err) {
    currentDoc.value = null
    error.value = err instanceof Error ? err.message : '加载详情失败'
  } finally {
    loadingDetail.value = false
  }
}

onMounted(async () => {
  await fetchList()
})
</script>
