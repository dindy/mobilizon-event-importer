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

const hasTokenData = store.getters.hasMobilizonTokenData
const selectedIdentity = store.getters.getSelectedIdentity
const localEvent = store.getters.getLocalEvent
const mobilizonConfig = store.getters.getMobilizonConfig
const mobilizonInstanceUrl = store.getters.getMobilizonInstanceUrl
const isInstanceConfigLoaded = store.getters.isInstanceConfigLoaded
const scrappedData = store.getters.getScrappedData
const scrapperUrl = store.getters.getScrapperUrl

onMounted(async () => {
    store.dispatch('resetEvent')
    title.value = route.query.title
    text.value = route.query.text
    url.value = route.query.url
    
    if (url.value && isValidUrl(url.value)) {
        toImport.value = url.value
    } else if (text.value && isValidUrl(text.value)) {
        toImport.value = text.value
    }

    if (toImport.value) {
        if (hasTokenData && selectedIdentity && mobilizonConfig) {
            await store.dispatch('scrapEvent', toImport.value)
            router.push('/create')            
        }
    }
})

const getText = () => `Vous allez importer l'évènement à l'URL ${toImport.value}`

const go = () => {
    store.dispatch('shareUrl', toImport.value)
    router.push('/identity')
}

const scrap = () => {
    router.push('/scrap')
}
</script>

<template>
    <div v-if="!store.getters.isLoadingScrapper">
        <v-alert title="Partager l'évènement" variant="outlined" type="info" v-if="toImport" :text="getText()"></v-alert>
        <v-alert title="Partage impossible"  type="warning" v-else text="Nous sommes désolés mais aucune URL valide n'a été détectée."></v-alert>
        <v-btn
            v-if="toImport"
            class="mt-5"
            color="primary"
            @click="go"
        >Confirmer</v-btn>   
        <v-btn
            v-else
            class="mt-5"
            color="primary"
            @click="scrap"
        >Indiquer une URL</v-btn>       
    </div>
    <div v-else>
        <v-infinite-scroll class="text-center">Chargement de l'événement en cours</v-infinite-scroll>
    </div>
</template>

<style scoped>
</style>