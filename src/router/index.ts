import { createRouter, createWebHistory } from 'vue-router'

// 1. 首页通常不建议懒加载，因为它是用户进入网站的第一个页面，直接加载能最快渲染。
import Home from '@/views/Home.vue' 

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      component: Home 
    },
    { 
      path: '/activity-posts', 
      // 2. 使用动态导入：只有用户点击“活动推文”时，浏览器才会下载该页面的 JS
      component: () => import('@/views/ActivityPosts.vue') 
    },
    { 
      path: '/tech-tutorials', 
      component: () => import('@/views/TechTutorials.vue') 
    },
    { 
      path: '/reader', 
      // 特别推荐：Reader 逻辑最重，懒加载收益最高
      component: () => import('@/views/Reader.vue') 
    },
    { 
      path: '/about',
      component: () => import('@/views/About.vue') 
    },
    { 
      path: '/honor-wall',
      component: () => import('@/views/HonorWall.vue') 
    },
    { 
      path: '/member-wall',
      component: () => import('@/views/MemberWall.vue') 
    },
    { 
      path: '/admin', 
      component: () => import('@/views/AdminEditor.vue'),
    },
    { 
      path: '/:pathMatch(.*)*', 
      redirect: '/' 
    }
  ]
})

export default router