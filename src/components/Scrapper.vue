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
    url.value = store.getters.getScrapperUrl
})

const scrap = async (url) => {
    console.log('wrap');
    
    await store.dispatch('scrap', url)
    router.push('/create')
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
        
        <!-- <v-form validate-on="submit" @submit.prevent="scrap">
            <v-text-field 
                type="url" 
                :model-value="url"
                @update:model-value="updateUrl"
                :rules="[rules.notEmpty, rules.validUrl]"
                validate-on="input"
                placeholder="" 
                label="Entrez une adresse web (facebook, instagram ou autre)"
                append-inner-icon="mdi-content-paste"
                @click:append-inner="paste"
            ></v-text-field>
            <v-btn 
                :loading="store.getters.isLoadingScrapper" 
                type="submit"
                color="primary"
            >Importer</v-btn>
        </v-form> -->
</template>