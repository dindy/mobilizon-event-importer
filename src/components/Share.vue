<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { isValidUrl } from '../utils/utils'

const route = useRoute()
const store = useStore()
const router = useRouter()
store.dispatch('setPageTitle', 'Partager l\'événement')

const title = ref('')
const text = ref('')
const url = ref('')
const toImport = ref(null)

onMounted(() => {
    title.value = route.query.title
    text.value = route.query.text
    url.value = route.query.url
    
    if (url.value && isValidUrl(url.value)) {
        toImport.value = url.value
    } else if (text.value && isValidUrl(text.value)) {
        toImport.value = text.value
    }
})

const getText = () => `Vous allez importer l'évènement à l'URL ${toImport.value}`

const go = () => {
    store.commit('setScrapperUrl', toImport.value)
    router.push('/identity')
}
</script>

<template>
    <v-alert title="Partager l'évènement" variant="outlined" type="info" v-if="toImport" :text="getText()"></v-alert>
    <v-alert title="Partage impossible"  type="warning" v-else text="Nous sommes désolés mais aucune URL valide n'a été détectée."></v-alert>
    <v-btn
        class="mt-5"
        color="primary"
        @click="go"
    >Confirmer</v-btn>   
</template>

<style scoped>
</style>