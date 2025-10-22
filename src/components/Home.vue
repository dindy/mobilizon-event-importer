<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { MobilizonApi } from '../api/mobilizon'
import SelectGroup from './SelectGroup.vue'
import Welcome from './Welcome.vue'
const store = useStore()
const mobilizonAuthUrl = MobilizonApi.getAuthorizationUrl()
const mobilizonUserIsAuthenticated = computed(() => store.getters.getIdentities.length > 0)
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isConnectingToMobilizon = computed(() => store.getters.isConnectingToMobilizon)
</script>

<template>
    <v-infinite-scroll v-if="isConnectingToMobilizon || isLoadingGroups"></v-infinite-scroll>
    <div v-else>
        <Welcome :mobilizonAuthUrl="mobilizonAuthUrl" v-if="!mobilizonUserIsAuthenticated"/>
        <SelectGroup v-else/>
    </div>
</template>

<style scoped>

</style>
