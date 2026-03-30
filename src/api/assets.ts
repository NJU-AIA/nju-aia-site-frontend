import axios from 'axios';

export type AssetKind = 'article' | 'shared';

export interface AssetRecord {
  contentType?: string;
  ext?: string;
  filename?: string;
  kind?: AssetKind | string;
  markdownValue?: string;
  name?: string;
  path?: string;
  scope?: string;
  size?: number;
  uploadedAt?: string;
  url?: string;
}

export interface AssetsListResponse {
  items?: AssetRecord[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface AssetErrorResponse {
  error: string;
}

export interface GetAssetsParams {
  scope?: string;
  kind?: AssetKind;
  page?: number;
}

export interface UploadAssetRequest {
  scope: string;
  name: string;
  file: File;
  overwrite?: boolean;
}

const http = axios.create({
  baseURL: '/api',
  timeout: 20000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const assetsApi = {
  /**
   * 获取静态资源列表
   * GET /assets
   */
  getAssets(params?: GetAssetsParams) {
    return http.get<AssetsListResponse | AssetRecord[]>('/assets', {
      params,
    });
  },

  /**
   * 上传静态资源
   * POST /assets
   * multipart/form-data
   */
  uploadAsset(data: UploadAssetRequest, onUploadProgress?: (percent: number) => void) {
    const formData = new FormData();
    formData.append('scope', data.scope);
    formData.append('name', data.name);
    formData.append('file', data.file);

    if (typeof data.overwrite === 'boolean') {
      formData.append('overwrite', String(data.overwrite));
    }

    return http.post<AssetRecord>('/assets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!onUploadProgress) return;
        const total = event.total ?? 0;
        if (!total) return;
        const percent = Math.round((event.loaded / total) * 100);
        onUploadProgress(percent);
      },
    });
  },

  /**
   * 删除静态资源
   * DELETE /assets?path=...
   */
  deleteAsset(path: string) {
    return http.delete<void>('/assets', {
      params: { path },
    });
  },
};