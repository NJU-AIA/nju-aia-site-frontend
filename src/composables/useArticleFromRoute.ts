import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { articlesApi, type Article } from '@/api/articles';

export function useArticleFromRoute() {
  const route = useRoute();
  const article = ref<Article | null>(null);
  const loading = ref(false);
  const error = ref('');

  const articleId = computed(() => {
    const raw = route.query.id;
    return Array.isArray(raw) ? raw[0] || '' : String(raw || '');
  });

  async function loadArticle() {
    article.value = null;
    error.value = '';

    if (!articleId.value) {
      error.value = '缺少文章 ID';
      return;
    }

    loading.value = true;
    try {
      const { data } = await articlesApi.getArticleById(articleId.value);
      article.value = data;
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '加载失败';
    } finally {
      loading.value = false;
    }
  }

  watch(articleId, loadArticle, { immediate: true });

  return {
    article,
    articleId,
    loading,
    error,
    reload: loadArticle,
  };
}
