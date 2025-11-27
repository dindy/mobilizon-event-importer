<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { isValidUrl } from '../utils/utils.js'
import UrlForm from './UrlForm.vue'

const router = useRouter()
const store = useStore()
const url = ref(null)

store.dispatch('setPageTitle', 'URL de l\'événement')

onMounted(() => {
    url.value = store.getters.getEventScrapperUrl
})

const scrap = async (url) => {    
    await store.dispatch('scrapEvent', url)
    router.push('createEvent')
}

</script>

<template>
    <UrlForm
        placeholder="https://www.facebook.com/events/123456789"
        label="Entrez une adresse web (facebook, instagram ou autre)"
        :default="url"
        buttonText="Importer"
        :is-loading="store.getters.isLoadingScrapper"
        @send="scrap"
    />
</template>