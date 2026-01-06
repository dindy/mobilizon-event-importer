<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Welcome from './Welcome.vue'
const store = useStore()
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isLoadingConfig = computed(() => store.getters.isLoadingConfig)
</script>

<template>
    <v-infinite-scroll v-if="isLoadingConfig || isLoadingGroups"></v-infinite-scroll>
    <Welcome v-else/>
</template>

<style scoped>

</style>
