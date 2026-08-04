import type { ArticleMode } from '@/api/articles';

export type ContentType = 'article' | 'slide';

export function contentTypeFromMode(mode?: ArticleMode | string): ContentType {
  return mode === 'slide' ? 'slide' : 'article';
}

export function routeForArticle(id: string, mode?: ArticleMode | string) {
  return {
    path: contentTypeFromMode(mode) === 'slide' ? '/slides' : '/article',
    query: { id },
  };
}

export function modeForContentType(type: ContentType): ArticleMode {
  return type === 'slide' ? 'slide' : 'article';
}
