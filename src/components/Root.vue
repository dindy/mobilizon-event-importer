<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import Toaster from './Toaster.vue'
import AppBar from './AppBar.vue'

const store = useStore()
const router = useRouter()
const route = useRoute()

store.dispatch('setPageTitle', 'Instance Mobilizon')
const displayAppBar = () => route.path != '/'
</script>

<template>
    <v-app>
        <AppBar v-if="displayAppBar()"/>
        <v-main>          
            <v-container>
                <Toaster/>
                <router-view />
            </v-container>
        </v-main>     
    </v-app>
</template>