<template>
  <v-infinite-scroll></v-infinite-scroll>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()
onMounted(async () => {
    const code = route.query.code
    if (code) {
      store.dispatch('saveMobilizonCode', code)
      await store.dispatch('fetchMobilizonGroups')
      store.dispatch('loadMobilizonConfig')
      router.replace('/identity')
    }
})
</script> 