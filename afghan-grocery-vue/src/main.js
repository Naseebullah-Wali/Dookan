import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles/main.css'

// Make Bootstrap available globally
window.bootstrap = bootstrap

const app = createApp(App)
const pinia = createPinia()

import i18n from './i18n'
import { useAuthStore } from './stores/auth'

app.use(pinia)
app.use(router)
app.use(i18n)

// Initialize auth state from Supabase
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
