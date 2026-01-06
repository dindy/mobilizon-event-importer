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
import EventScrapper from './components/EventScrapper.vue' 
import GroupScrapper from './components/GroupScrapper.vue' 
import Event from './components/Event.vue' 
import Group from './components/Group.vue' 
import Done from './components/Done.vue' 
import SelectIdentity from './components/SelectIdentity.vue' 
import SelectInstance from './components/SelectInstance.vue' 
import Share from './components/Share.vue' 

const routes = [
  { path: '/', component: Home },
  { path: '/share', component: Share },
  { path: '/instance', component: SelectInstance },
  { path: '/identity', component: SelectIdentity },
  { path: '/mobilizon/callback', component: Callback },
  { path: '/scrapEvent', component: EventScrapper },
  { path: '/scrapGroup', component: GroupScrapper },
  { path: '/createEvent', component: Event },
  { path: '/createGroup', component: Group },
  { path: '/done', component: Done },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound } 
]

await store.dispatch('init')

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

  
router.beforeEach(async (to, from) => {
  
  console.log('Router - Before - ' + to.path);
    
  const selectedIdentity = store.getters.getSelectedIdentity
  const localEvent = store.getters.getLocalEvent
  const mobilizonConfig = store.getters.getMobilizonConfig
  const mobilizonInstanceUrl = store.getters.getMobilizonInstanceUrl
  const isInstanceConfigLoaded = store.getters.isInstanceConfigLoaded
  const scrappedData = store.getters.getScrappedEvent
  const scrapperUrl = store.getters.getEventScrapperUrl
  const lastUUID = store.getters.getMobilizonEventUUID
  const isMbzConnected = store.getters.isMobilizonAppAuthorized

  const notAuthenticatedAllowedPaths = [
    '/',
    '/instance',
    '/mobilizon/callback',
    '/share/',
  ]

  const isAllowedWithoutAuth = path => notAuthenticatedAllowedPaths.includes(path)

  if (!isMbzConnected && !isAllowedWithoutAuth(to.path)) {
    router.replace('/instance')
  }

  if ((to.path == '/scrapEvent' || to.path == '/createEvent') && !selectedIdentity) {
    router.replace('/identity')
  }

  if (to.path == '/scrapEvent' && localEvent && lastUUID === null && from.path !== '/createEvent') {
    router.replace('/createEvent')
  }

  if (to.path == '/createEvent' && !scrappedData && !localEvent) {
    router.replace('/scrapEvent')
  }

  if (to.path === '/' && isMbzConnected && mobilizonConfig) {
    if (selectedIdentity) {
      if (localEvent && lastUUID === null) {
        router.replace('/createEvent')
      } else {
        router.replace('/scrapEvent')
      }
    } else {
      router.replace('/identity')
    }
  }

})