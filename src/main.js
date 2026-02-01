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
            
            console.log(`Router - Before - Not an entry path`)
            console.log(`Router - Before - Is mobilizon connected ?`, isMbzConnected)
            
            if (isMbzConnected) {
                store.dispatch('navigateTo', '/home')
            } else {
                store.dispatch('navigateTo', '/')
            }
            
        } else {

            console.log(`Router - Before - It's an entry path`)
            console.log(`Router - Before - Is mobilizon connected ?`, isMbzConnected)
            
            // Redirect to home
            if ((startPath == '/' || startPath == '/instance') && isMbzConnected) {
                store.dispatch('navigateTo', '/home')
            // Redirect to root
            } else if (startPath == '/home' && !isMbzConnected) {
                store.dispatch('navigateTo', '/')
            // No redirection but set /home in history
            } else if (isMbzConnected) {
                store.commit('addPathToHistory', '/home')
            }
        }
        store.commit('setIsFirstRoute', false)
    }
})