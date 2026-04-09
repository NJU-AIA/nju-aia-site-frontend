import { createRouter, createWebHistory } from 'vue-router'
import SiteLayout from '@/layouts/SiteLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getToken } from '@/api/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 前台
    {
      path: '/',
      component: SiteLayout,
      children: [
        {
          path: '',
          component: () => import('@/views/Home.vue'),
        },
        {
          path: 'activity-posts',
          component: () => import('@/views/ActivityPosts.vue'),
        },
        {
          path: 'tech-tutorials',
          component: () => import('@/views/TechTutorials.vue'),
        },
        {
          path: 'reader',
          component: () => import('@/views/Reader.vue'),
        },
        {
          path: 'about',
          component: () => import('@/views/About.vue'),
        },
        {
          path: 'honor-wall',
          component: () => import('@/views/HonorWall.vue'),
        },
        {
          path: 'member-wall',
          component: () => import('@/views/MemberWall.vue'),
        },
        {
          path: 'gallery/:entry(.*)*',
          component: () => import('@/views/Gallery.vue'),
        },
        {
          path: 'livecodes',
          component: () => import('@/views/Livecodes.vue'),
        },
      ],
    },

    // 后台登录页
    {
      path: '/admin/login',
      component: () => import('@/views/AdminLogin.vue'),
    },

    // 后台管理页
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/articles',
        },
        {
          path: 'articles',
          component: () => import('@/views/AdminReader.vue'),
        },
        {
          path: 'assets',
          component: () => import('@/views/AssetManager.vue'),
        },
        {
          path: 'livecodes',
          component: () => import('@/views/AdminLivecodes.vue'),
        },
      ],
    },

    // 兜底
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = getToken()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    next('/admin/login')
    return
  }

  if (to.path === '/admin/login' && token) {
    next('/admin/articles')
    return
  }

  next()
})

export default router
