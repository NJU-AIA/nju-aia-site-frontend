import { ref, watch, onMounted } from 'vue'

// 使用全局单例模式，确保整个应用共享同一个状态
const isDark = ref(false)

export function useTheme() {
  // 初始化主题（优先读取 localStorage，其次读取系统偏好）
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark.value = true
      document.documentElement.classList.add('dark')
    } else {
      isDark.value = false
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题方法
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // 监听状态变化，同步到 DOM 和 localStorage
  watch(isDark, (newVal) => {
    if (newVal) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
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