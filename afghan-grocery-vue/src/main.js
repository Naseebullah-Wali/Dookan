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

app.use(pinia)
app.use(router)
app.use(i18n)
app.mount('#app')
