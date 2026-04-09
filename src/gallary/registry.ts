export interface GalleryEntry {
  routePath: string
  filePath: string
  title: string
  html: string
}

const htmlModules = import.meta.glob('./**/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function formatFallbackTitle(filePath: string): string {
  const fileName = filePath.split('/').pop() ?? filePath
  const withoutExt = fileName.replace(/\.html$/i, '')
  return withoutExt.replace(/[_-]+/g, ' ')
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title>(.*?)<\/title>/is)
  if (!match) return null

  return match[1].replace(/\s+/g, ' ').trim() || null
}

const galleryEntriesUnsorted = Object.entries(htmlModules).map(([modulePath, html]) => {
  const relativePath = modulePath.replace(/^\.\//, '')

  return {
    routePath: relativePath.replace(/\.html$/i, ''),
    filePath: relativePath,
    title: extractTitle(html) ?? formatFallbackTitle(relativePath),
    html,
  } satisfies GalleryEntry
})

export const galleryEntries = galleryEntriesUnsorted.sort((a, b) =>
  a.routePath.localeCompare(b.routePath, 'zh-Hans-CN'),
)

export const galleryEntryMap = new Map(galleryEntries.map((entry) => [entry.routePath, entry]))
