import { createApp } from 'vue'

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
import router from './router.js'

await store.dispatch('init')

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
    
    const startPath = to.path
    const entryPaths = [
        '/',
        '/home',
        '/instance',
        '/mobilizon/callback',
        '/share/',
    ]
    
    if (store.getters.isFirstRoute) {
        
        console.log('Router - Before - First route : ' + startPath);
        
        if (!entryPaths.includes(startPath)) {
            
            const isMbzConnected = store.getters.isMobilizonAppAuthorized
            console.log(`Router - Before - Not an entry path`)
            console.log(`Router - Before - Is mobilizon connected ?`, isMbzConnected)
            
            if (isMbzConnected) {
                store.dispatch('navigateTo', '/home')
            } else {
                store.dispatch('navigateTo', '/')
            }
            
        } else {
            // Redirect to home
            if ((startPath == '/' || startPath == '/instance') && isMbzConnected) {
                store.dispatch('navigateTo', '/home')
            // Redirect to root
            } else if (startPath == '/home' && !isMbzConnected) {
                store.dispatch('navigateTo', '/')
            // No redirection but set /home in history
            } else {
                store.commit('addPathToHistory', '/home')
            }
        }
        store.commit('setIsFirstRoute', false)
    }
})