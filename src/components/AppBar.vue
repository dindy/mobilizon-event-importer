<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import IdentitySelect from './IdentitySelect.vue'
import GroupSelect from './GroupSelect.vue'
import Avatar from './Avatar.vue'
import state from '../store/state'

const store = useStore()
const router = useRouter()
const route = useRoute()
const title = computed(() => store.getters.getPageTitle)
const isMobilizonUserAuthenticated = computed(() => store.getters.isMobilizonUserAuthenticated)
const identity = computed(() => store.getters.getSelectedIdentity)
const group = computed(() => store.getters.getSelectedGroup)
const identities = computed(() => store.getters.getIdentities)
const identityGroups = computed(() => store.getters.getSelectedIdentityGroups)
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isIdentityMenuOpened = ref(false)
const closeIdentityMenu = () => isIdentityMenuOpened.value = false
const isMbzConnected = computed(() => store.getters.isMobilizonAppAuthorized)
const logout = () => {
    store.dispatch('logoutMobilizon')
    store.dispatch('navigateTo', '/')
}
const prevRoute = computed(() => store.getters.getPreviousPath)
const goPrev = () => {
    store.dispatch('navigateBack')
}
</script>

<template>
    <v-app-bar >
        <img class="logo" v-if="!isMbzConnected || route.path == '/home' || !prevRoute" src="/logo.svg" height="24px" width="24px"/>
        <v-btn v-else @click="goPrev" icon="mdi-arrow-left"></v-btn>
        <v-app-bar-title class="ms-0">{{ title }}</v-app-bar-title>
        <template v-slot:append>
            <Avatar :class="[identity.avatar?.url ? '' : 'bg-secondary']" :actor="identity" v-if="identity"></Avatar>
            <Avatar type="group" :class="[group.avatar?.url ? '' : 'bg-secondary', 'border-md', 'border-surface-light', 'border-opacity-100']" class="ml-n5"  :actor="group" v-if="group"></Avatar>
            <v-infinite-scroll class="flex-row" v-if="isLoadingGroups && identities.length == 0"></v-infinite-scroll>
            <v-menu
                v-model="isIdentityMenuOpened"
                :close-on-content-click="false"
                location="bottom end"   
                v-if="identities.length > 0"     
            >
                <template v-slot:activator="{ props }">
                    <v-btn
                        class="ml-3"
                        v-bind="props"
                        icon="mdi-dots-vertical" 
                    >
                    </v-btn>
                </template>

                <v-list min-width="300" >
                    <v-list-item v-if="identity && identities.length > 0">
                        <IdentitySelect/>          
                    </v-list-item>
                    <v-list-item v-if="identity">
                        <GroupSelect @closeMenu="closeIdentityMenu"/>          
                    </v-list-item>
                    <v-list-item value="1" prepend-icon="mdi-logout" title="Me déconnecter" v-if="isMobilizonUserAuthenticated" @click="logout"></v-list-item>
                </v-list>
            </v-menu>
        </template>
    </v-app-bar>  
</template>

<style scoped>
    .logo {
        margin-left:var(--sm-space);
        margin-right:var(--sm-space);
    }
</style>