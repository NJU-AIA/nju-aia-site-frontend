// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

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
      component: () => import('@/views/ActivityPosts.vue') 
    },
    { 
      path: '/tech-tutorials', 
      component: () => import('@/views/TechTutorials.vue') 
    },
    { 
      path: '/reader', 
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