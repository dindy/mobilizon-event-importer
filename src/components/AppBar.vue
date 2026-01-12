<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import IdentitySelect from './IdentitySelect.vue'
import GroupSelect from './GroupSelect.vue'

const store = useStore()
const router = useRouter()
const title = computed(() => store.getters.getPageTitle)
const isMobilizonUserAuthenticated = computed(() => store.getters.isMobilizonUserAuthenticated)
const identity = computed(() => store.getters.getSelectedIdentity)
const group = computed(() => store.getters.getSelectedGroup)
const identities = computed(() => store.getters.getIdentities)
const identityGroups = computed(() => store.getters.getSelectedIdentityGroups)
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isIdentityMenuOpened = ref(false)
const closeIdentityMenu = () => isIdentityMenuOpened.value = false
const logout = () => {
    store.dispatch('logoutMobilizon')
    router.push('/')
}
</script>

<template>
    <v-app-bar >
        <!-- <img src="/logo.svg" height="32px" width="32px"/> -->
        <v-app-bar-title class="ms-0">{{ title }}</v-app-bar-title>
        <template v-slot:append>
            <v-avatar :class="[identity.avatar?.url ? '' : 'bg-secondary']" :title="identity.name" :alt="identity.name" color="white" v-if="identity">
                <v-img v-if="identity.avatar?.url" :src="identity.avatar?.url"></v-img>   
                <v-icon v-else color="warning" icon="mdi-account"></v-icon>
            </v-avatar>
            <v-avatar :class="[group.avatar?.url ? '' : 'bg-secondary', 'border-md', 'border-surface']" :title="group.name" :alt="group.name" color="white" class="ml-n5" v-if="group">
                <v-img v-if="group.avatar?.url" :src="group.avatar?.url"></v-img>
                <v-icon v-else color="warning" icon="mdi-account-group"></v-icon>
            </v-avatar>
            <v-infinite-scroll class="flex-row" v-if="isLoadingGroups"></v-infinite-scroll>
            <v-menu
                v-model="isIdentityMenuOpened"
                :close-on-content-click="false"
                location="bottom end"   
                v-if="identities.length > 0 && !isLoadingGroups"     
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