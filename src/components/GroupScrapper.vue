<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { isValidUrl } from '../utils/utils.js'
import UrlForm from './UrlForm.vue'

const router = useRouter()
const store = useStore()
const url = ref(null)

store.dispatch('setPageTitle', 'URL du groupe')

const scrap = async (url) => {    
    await store.dispatch('scrapGroup', url)
    router.push('/createGroup')
}

</script>

<template>
    <UrlForm
        placeholder="https://www.facebook.com/nom_du_group"
        label="Entrez une adresse web (groupe facebook de préférence)"
        :default="url"
        buttonText="Importer"
        :is-loading="store.getters.isLoadingScrapper"
        @send="scrap"
    />
</template>