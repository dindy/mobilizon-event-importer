<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()
store.dispatch('setPageTitle', 'URL de l\'événement')
const url = ref(null)
const isValidUrl = (testUrl) => {
    try {
        if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) return false 
        testUrl = new URL(testUrl)
        return true
    } catch (_) {
        return false
    }    
} 

// const updateUrl = (event) => {
//     const newValue = event.target.value
//     if (newValue == '') {
//         emptyUrl.value = true
//         return
//     }
//     emptyUrl.value = false
//     validUrl.value = isValidUrl(newValue) 
//     url.value = newValue
// }
// const validUrl = ref(false)
// const emptyUrl = ref(true)

const scrap = async (submitEventPromise) => {

    const { valid, errors } = await submitEventPromise

    if (valid) {
        await store.dispatch('scrap', url.value)
        router.push('/create')
    }
}

const scrapped = computed(() => store.getters.getScrappedData)

const paste = async () => {
    const value = await navigator.clipboard.readText()
    url.value = value
}

const rules = {
    notEmpty: value => value === '' ? 'Le champ est vide.' : true,
    validUrl: value => !isValidUrl(value) ? 'L\'URL n\'est pas valide.' : true,
}
const updateUrl = (e) => {
    url.value = e
}
</script>

<template>
    <div>
        <v-form validate-on="submit" @submit.prevent="scrap">
            <v-text-field 
                type="url" 
                :model-value="url"
                @update:model-value="updateUrl"
                :rules="[rules.notEmpty, rules.validUrl]"
                validate-on="input"
                placeholder="https://www.facebook.com/events/123456789" 
                label="Entrez une adresse web (facebook, instagram ou autre)"
                append-inner-icon="mdi-content-paste"
                @click:append-inner="paste"
            ></v-text-field>
            <v-btn 
                :loading="store.getters.isLoadingScrapper" 
                type="submit"
                color="primary"
            >Importer</v-btn>
        </v-form>
    </div>
</template>