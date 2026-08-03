import { createRouter, createWebHistory } from 'vue-router'
import SiteLayout from '@/layouts/SiteLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getCurrentUser } from '@/api/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    {
      path: '/admin/login',
      component: () => import('@/views/AdminLogin.vue'),
    },
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
          meta: { adminLayout: 'workspace' },
        },
        {
          path: 'assets',
          component: () => import('@/views/AssetManager.vue'),
          meta: { adminLayout: 'wide' },
        },
        {
          path: 'livecodes',
          component: () => import('@/views/AdminLivecodes.vue'),
          meta: { adminLayout: 'workspace' },
        },
        {
          path: 'users',
          component: () => import('@/views/AdminUsers.vue'),
          meta: { requiresOwner: true, adminLayout: 'wide' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresOwner = to.matched.some((record) => record.meta.requiresOwner)
  const isLoginPage = to.path === '/admin/login'

  if (!requiresAuth && !isLoginPage) {
    return true
  }

  const user = await getCurrentUser()
  if (requiresAuth && !user) {
    return {
      path: '/admin/login',
      query: { redirect: to.fullPath },
    }
  }
  if (requiresOwner && user?.role !== 'owner') {
    return '/admin/articles'
  }
  if (isLoginPage && user) {
    return '/admin/articles'
  }
  return true
})

export default router
