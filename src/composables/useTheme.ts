import { ref, watch } from 'vue'

const applyThemeToDom = (dark: boolean) => {
  const root = document.documentElement
  const body = document.body
  root.classList.toggle('dark', dark)
  body.classList.toggle('dark', dark)
  root.setAttribute('data-theme', dark ? 'dark' : 'light')
  body.setAttribute('data-theme', dark ? 'dark' : 'light')
  root.style.colorScheme = dark ? 'dark' : 'light'
}

const isDark = ref(false)
let initialized = false
let watchBound = false

const initTheme = () => {
  if (typeof window === 'undefined') return

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
  } else {
    isDark.value = false
  }

  applyThemeToDom(isDark.value)
}

const ensureInitialized = () => {
  if (initialized) return
  initialized = true
  initTheme()
}

const bindWatchOnce = () => {
  if (watchBound) return
  watchBound = true

  watch(isDark, (newVal) => {
    if (typeof window === 'undefined') return
    applyThemeToDom(newVal)
    localStorage.setItem('theme', newVal ? 'dark' : 'light')
  })
}

export function useTheme() {
  ensureInitialized()
  bindWatchOnce()

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleTheme,
  }
}
