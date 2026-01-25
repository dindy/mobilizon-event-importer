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
import SelectInstance from './components/SelectInstance.vue' 
import Share from './components/Share.vue' 
import Welcome from './components/Welcome.vue' 
import RegisterFeed from './components/RegisterFeed.vue' 
import Automations from './components/Automations.vue' 
import AutomationHistory from './components/AutomationHistory.vue' 

const routes = [
  { path: '/', component: Welcome },
  { path: '/home', component: Home },
  { path: '/share', component: Share },
  { path: '/instance', component: SelectInstance },
  { path: '/mobilizon/callback', component: Callback },
  { path: '/scrapEvent', component: EventScrapper },
  { path: '/scrapGroup', component: GroupScrapper },
  { path: '/createEvent', component: Event },
  { path: '/createGroup', component: Group },
  { path: '/registerFeed', component: RegisterFeed },
  { path: '/automations', component: Automations },
  { path: '/automation/:id', name: 'automationHistory', component: AutomationHistory },
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

  store.commit('addPathToHistory', to.path)

  const startPath = to.path
  const entryPaths = [
    '/',
    '/home',
    '/instance',
    '/mobilizon/callback',
    '/share/',
  ]

  if (store.getters.isFirstRoute) {
    if (!entryPaths.includes(startPath)) {
      const isMbzConnected = store.getters.isMobilizonAppAuthorized
      if (isMbzConnected) {
        router.replace('/home')
      } else {
        router.replace('/')
      }
    }
    store.commit('setIsFirstRoute', false)
  }
})