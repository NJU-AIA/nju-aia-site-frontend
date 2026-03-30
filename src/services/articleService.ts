// src/services/articleService.ts
import {
  articlesApi,
  type Article,
  type ArticleListResponse,
  type CreateArticleRequest,
  type CreateArticleResponse,
} from '@/api/articles';

export async function fetchArticles(): Promise<ArticleListResponse> {
  const { data } = await articlesApi.getArticles();
  return data;
}

export async function fetchArticleDetail(id: string): Promise<Article> {
  const { data } = await articlesApi.getArticleById(id);
  return data;
}

export async function publishArticle(
  payload: CreateArticleRequest
): Promise<CreateArticleResponse> {
  const { data } = await articlesApi.createArticle(payload);
  return data;
}

export async function editArticle(
  id: string,
  payload: CreateArticleRequest
): Promise<void> {
  await articlesApi.updateArticle(id, payload);
}

export async function removeArticle(id: string): Promise<void> {
  await articlesApi.deleteArticle(id);
}