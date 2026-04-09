import { ref, watch, onMounted } from 'vue'

const applyThemeToDom = (dark: boolean) => {
  const root = document.documentElement
  const body = document.body
  root.classList.toggle('dark', dark)
  body.classList.toggle('dark', dark)
  root.setAttribute('data-theme', dark ? 'dark' : 'light')
  body.setAttribute('data-theme', dark ? 'dark' : 'light')
  root.style.colorScheme = dark ? 'dark' : 'light'
}

// 使用全局单例模式，确保整个应用共享同一个状态
const isDark = ref(false)

export function useTheme() {
  // 初始化主题（优先读取 localStorage，其次读取系统偏好）
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark.value = true
    } else {
      isDark.value = false
    }
    applyThemeToDom(isDark.value)
  }

  // 切换主题方法
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // 监听状态变化，同步到 DOM 和 localStorage
  watch(isDark, (newVal) => {
    applyThemeToDom(newVal)
    if (newVal) {
      localStorage.setItem('theme', 'dark')
    } else {
      localStorage.setItem('theme', 'light')
    }
  })

  // 仅在客户端挂载时执行初始化
  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    toggleTheme
  }
}
