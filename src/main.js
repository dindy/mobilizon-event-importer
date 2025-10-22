import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import 'unfonts.css'
import './style.css'
import App from './App.vue'
import store from './store'
import Callback from './components/Callback.vue'
import NotFound from './components/NotFound.vue' 
import Home from './components/Home.vue' 
import Scrapper from './components/Scrapper.vue' 
import Event from './components/Event.vue' 
import Done from './components/Done.vue' 

const routes = [
  { path: '/mobilizon/callback', component: Callback },
  { path: '/scrap', component: Scrapper },
  { path: '/create', component: Event },
  { path: '/done', component: Done },
  { path: '/', component: Home },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from) => {
  if (!store.getters.isConfigLoaded && to.path !== '/' && to.path !== '/mobilizon/callback') {
    router.replace('/')
  }
})
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme: {
        // dark: false,
        colors: {
          primary: 'rgb(0, 165, 207)',
          info: 'rgb(0, 165, 207)',
          warning: 'rgb(255, 203, 107)',
          success: 'rgb(37, 161, 142)',
        },
      },
    },
  },  
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },  
})
createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app')

store.dispatch('init')
 
