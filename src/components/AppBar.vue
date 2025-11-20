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
            <v-avatar :class="[identity.avatar?.url ? '' : 'bg-secondary']" :title="identity.name" :alt="identity.name" color="white" v-if="identity">
                <v-img v-if="identity.avatar?.url" :src="identity.avatar?.url"></v-img>   
                <v-icon v-else color="warning" icon="mdi-account"></v-icon>
            </v-avatar>
            <v-avatar :class="[group.avatar?.url ? '' : 'bg-secondary', 'border-md', 'border-surface']" :title="group.name" :alt="group.name" color="white" class="ml-n5" v-if="group">
                <v-img v-if="group.avatar?.url"  :src="group.avatar?.url"></v-img>
                <v-icon v-else color="warning" icon="mdi-account-group"></v-icon>
            </v-avatar>
            <v-btn @click="switchIdentity" class="ml-1" title="Changer d'identité ou de groupe" v-if="identity" icon="mdi-account-switch"></v-btn>
            <v-btn class="ml-5" title="Se déconnecter de l'instance Mobilizon" v-if="isMobilizonUserAuthenticated" @click="logout" icon="mdi-logout"></v-btn>
        </template>            
    </v-app-bar>  
</template>