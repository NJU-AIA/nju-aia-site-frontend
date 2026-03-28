// src/main.ts
import { createApp } from 'vue'
import './style.css' // 或者是 './index.css' (Tailwind 的入口)
import App from './App.vue'
import router from './router' // 引入我们在前面步骤创建的路由实例

const app = createApp(App)

// 关键步骤：告诉 Vue 使用路由
app.use(router)

app.mount('#app')