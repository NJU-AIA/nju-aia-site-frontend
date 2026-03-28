// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css' // 或者是 './index.css' (Tailwind 的入口)
import App from './App.vue'
import router from './router' // 引入我们在前面步骤创建的路由实例

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')