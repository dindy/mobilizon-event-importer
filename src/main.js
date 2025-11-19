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
import SelectIdentity from './components/SelectIdentity.vue' 
import SelectInstance from './components/SelectInstance.vue' 
import Share from './components/Share.vue' 
import { useRoute } from 'vue-router'

const routes = [
  { path: '/', component: Home },
  { path: '/share', component: Share },
  { path: '/instance', component: SelectInstance },
  { path: '/identity', component: SelectIdentity },
  { path: '/mobilizon/callback', component: Callback },
  { path: '/scrap', component: Scrapper },
  { path: '/create', component: Event },
  { path: '/done', component: Done },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
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
router.beforeEach((to, from) => {
  
  const hasTokenData = store.getters.hasMobilizonTokenData

  // if (to.path == '/share/' || to.path == '/share') {
  //   console.log('Router - /share path detected')
  //   if (to.query.url) {
  //     store.commit('setScrapperUrl', to.query.url)
  //   }
  //   router.replace('/identity')
  // }

  if (hasTokenData && to.path === '/') {
    console.log('Router - Redirect to /identity')
    router.replace('/identity')
  }

  if (!hasTokenData && to.path == '/identity') {
    router.replace('/')
  }

  if (!store.getters.isConfigLoaded && to.path !== '/share/' && to.path !== '/instance' && to.path !== '/' && to.path !== '/mobilizon/callback' && to.path !== '/identity') {
    console.log('Router - Redirect to /')
    router.replace('/')
  }
})