<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import UrlForm from './UrlForm.vue'

const router = useRouter()
const store = useStore()
const url = ref(null)

store.dispatch('setPageTitle', 'URL du flux')

const register = async (url) => {    
    const success = await store.dispatch('registerFeed', { url, type: 'ics' })
    if (success) {
        store.dispatch('navigateTo', '/automations')
    }
}

</script>

<template>
    <UrlForm
        placeholder="https://example.com/feed.ics"
        label="Entrez l'URL d'un fichier ics ou ical"
        :default="url"
        buttonText="Enregistrer"
        :is-loading="store.getters.isRegisteringAutomation"
        @send="register"
    />
</template>