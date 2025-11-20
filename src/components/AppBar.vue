<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

const store = useStore()
const router = useRouter()
const route = useRoute()

const title = computed(() => store.getters.getPageTitle)
const isMobilizonUserAuthenticated = computed(() => store.getters.isMobilizonUserAuthenticated)
const identity = computed(() => store.getters.getSelectedIdentity)
const group = computed(() => store.getters.getSelectedGroup)

const switchIdentity = () => {
    store.dispatch('selectMobilizonIdentityAndGroup', {
        identity: null,
        group: null,
    })    
    router.push('/identity')
}

const logout = () => {
    store.dispatch('logoutMobilizon')
    router.push('/')
}
</script>

<template>
    <v-app-bar >
        <img src="/logo.svg" height="32px" width="32px"/>
        <v-app-bar-title>{{ title }}</v-app-bar-title>
        <template v-slot:append>
            <v-avatar color="white" v-if="identity">
                <v-img :title="identity.name" :alt="identity.name" :src="identity.avatar?.url || 'account-circle.svg'"></v-img>                    
            </v-avatar>
            <v-avatar color="white" class="ml-n5" v-if="group">
                <v-img :title="group.name" :alt="group.name" :src="group.avatar?.url || 'group.svg'"></v-img>
            </v-avatar>
            <v-btn @click="switchIdentity" class="ml-1" title="Changer d'identité ou de groupe" v-if="identity" icon="mdi-account-switch"></v-btn>
            <v-btn class="ml-5" title="Se déconnecter de l'instance Mobilizon" v-if="isMobilizonUserAuthenticated" @click="logout" icon="mdi-logout"></v-btn>
        </template>            
    </v-app-bar>  
</template>