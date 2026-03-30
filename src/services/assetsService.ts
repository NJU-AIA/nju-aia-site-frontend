import {
  assetsApi,
  type AssetRecord,
  type AssetKind,
  type GetAssetsParams,
  type UploadAssetRequest,
} from '@/api/assets';

export async function fetchAssets(params?: GetAssetsParams): Promise<AssetRecord[] | { items?: AssetRecord[] }> {
  const { data } = await assetsApi.getAssets(params);
  return data;
}

export async function uploadAsset(
  payload: UploadAssetRequest,
  onProgress?: (percent: number) => void
): Promise<AssetRecord> {
  const { data } = await assetsApi.uploadAsset(payload, onProgress);
  return data;
}

export async function removeAsset(path: string): Promise<void> {
  await assetsApi.deleteAsset(path);
}

export async function fetchArticleAssets(scope: string): Promise<AssetRecord[] | { items?: AssetRecord[] }> {
  return fetchAssets({
    scope,
    kind: 'article',
  });
}

export async function fetchSharedAssets(scope?: string): Promise<AssetRecord[] | { items?: AssetRecord[] }> {
  return fetchAssets({
    scope,
    kind: 'shared',
  });
}