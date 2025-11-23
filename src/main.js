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

await store.dispatch('init')
  
router.beforeEach(async (to, from) => {
  
  console.log('Router - Before - ' + to.path);
    
  const hasTokenData = store.getters.hasMobilizonTokenData
  const selectedIdentity = store.getters.getSelectedIdentity
  const localEvent = store.getters.getLocalEvent
  const mobilizonConfig = store.getters.getMobilizonConfig
  const mobilizonInstanceUrl = store.getters.getMobilizonInstanceUrl
  const isInstanceConfigLoaded = store.getters.isInstanceConfigLoaded
  const scrappedData = store.getters.getScrappedData
  const scrapperUrl = store.getters.getScrapperUrl

  const notAuthenticatedAllowedPaths = [
    '/',
    '/instance',
    '/mobilizon/callback',
    '/share/',
  ]

  const isAllowedWithoutAuth = path => notAuthenticatedAllowedPaths.includes(path)

  if (!hasTokenData && !isAllowedWithoutAuth(to.path)) {
    router.replace('/instance')
  }

  if ((to.path == '/scrap' || to.path == '/create') && !selectedIdentity) {
    router.replace('/identity')
  }

  if (to.path == '/scrap' && localEvent && from.path !== '/create') {
    router.replace('/create')
  }

  if (to.path == '/create' && !scrappedData && !localEvent) {
    router.replace('/scrap')
  }

  if (to.path === '/' && hasTokenData && mobilizonConfig) {
    if (selectedIdentity) {
    //   if (scrappedData || localEvent) {
    //     router.replace('/create')
    //   } else {
        router.replace('/scrap')
    //   }
    } else {
      router.replace('/identity')
    }
  }

})