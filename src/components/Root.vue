<script setup>
import { computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import Toaster from './Toaster.vue'

const store = useStore()
const router = useRouter()
const route = useRoute()
const isMobilizonUserAuthenticated = computed(() => store.getters.isMobilizonUserAuthenticated)
const identity = computed(() => store.getters.getSelectedIdentity)
const group = computed(() => store.getters.getSelectedGroup)

const title = computed(() => store.getters.getPageTitle)
const logout = () => {
    store.dispatch('logoutMobilizon')
    router.push('/')
}
store.dispatch('setPageTitle', 'Instance Mobilizon')
const displayAppBar = () => route.path != '/'

const switchIdentity = () => {
    store.dispatch('selectMobilizonIdentityAndGroup', {
        identity: null,
        group: null,
    })    
    router.push('/identity')
}

</script>

<template>
    <v-app>
        <v-app-bar v-if="displayAppBar()">
            <img src="/logo.svg" height="32px" width="32px"/>
            <v-app-bar-title>{{ title }}</v-app-bar-title>
            <template v-slot:append>
                <v-avatar color="white" v-if="identity">
                    <v-img :title="identity.name" :alt="identity.name" :src="identity.avatar?.url || 'account-circle.svg'"></v-img>                    
                </v-avatar>
                <v-avatar color="white" class="ml-n5" v-if="group">
                    <v-img :title="group.name" :alt="group.name" :src="group.avatar?.url || 'group.svg'"></v-img>
                </v-avatar>
                <v-btn @click="switchIdentity" class="ml-1" title="Changer d'identité" v-if="identity" icon="mdi-account-switch"></v-btn>
                <v-btn class="ml-5" title="Se déconnecter de l'instance Mobilizon" v-if="isMobilizonUserAuthenticated" @click="logout" icon="mdi-logout"></v-btn>
            </template>            
        </v-app-bar>    
        
        <div class="main" :class="{'with-offset': displayAppBar()}">
            <Toaster/>
            <router-view />    
        </div>
    </v-app>
</template>