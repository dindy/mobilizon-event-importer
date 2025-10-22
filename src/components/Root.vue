<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Toaster from './Toaster.vue'

const store = useStore()
const router = useRouter()
const isMobilizonUserAuthenticated = computed(() => store.getters.isMobilizonUserAuthenticated)
const title = computed(() => store.getters.getPageTitle)
const logout = () => {
    store.dispatch('logoutMobilizon')
    router.push('/')
}
</script>

<template>
    <v-app>
        <v-app-bar v-if="isMobilizonUserAuthenticated">
            <img src="/logo.svg" height="32px" width="32px"/>
            <v-app-bar-title>{{ title }}</v-app-bar-title>
            <template v-slot:append>
                <v-btn @click="logout" icon="mdi-logout"></v-btn>
            </template>            
        </v-app-bar>    
        
        <div class="main" :class="{'with-offset': isMobilizonUserAuthenticated}">
            <Toaster/>
            <router-view />    
        </div>
    </v-app>
</template>