export function resolveArticleAssetUrl(
  rawUrl: string | undefined,
  articleId?: string,
  assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || '/assets',
) {
  const value = String(rawUrl || '').trim();
  if (!value) return '';

  if (/^https?:\/\//i.test(value) || value.startsWith('data:image/')) return value;

  const base = assetBaseUrl.replace(/\/$/, '');
  const relative = value.replace(/^\.\//, '').replace(/^\//, '');
  const id = String(articleId || '').trim();

  if (value.startsWith('/')) return base ? `${base}/${relative}` : `/${relative}`;
  if (id) return base ? `${base}/${id}/${relative}` : `/${id}/${relative}`;
  return base ? `${base}/${relative}` : `/${relative}`;
}
