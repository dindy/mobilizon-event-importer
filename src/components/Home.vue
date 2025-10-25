<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { MobilizonApi } from '../api/mobilizon'
import Welcome from './Welcome.vue'
const store = useStore()
const mobilizonUserIsAuthenticated = computed(() => store.getters.getIdentities.length > 0)
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isConnectingToMobilizon = computed(() => store.getters.isConnectingToMobilizon)
</script>

<template>
    <v-infinite-scroll v-if="isConnectingToMobilizon || isLoadingGroups"></v-infinite-scroll>
    <Welcome v-else/>
</template>

<style scoped>

</style>
