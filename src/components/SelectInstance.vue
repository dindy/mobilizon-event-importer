<script setup>

import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { isValidUrl } from '../utils/utils.js'

const store = useStore()
const instanceUrl = ref("")
const next = () => {
    if (instanceUrl.value.endsWith('/')) {
        instanceUrl.value = instanceUrl.value.slice(0, -1)
    }
    store.dispatch('registerApp', 'https://' + instanceUrl.value)
}

const isInstanceUrlValid = computed(() => isValidUrl(instanceUrl.value))
store.dispatch('setPageTitle', 'Instance Mobilizon')
const paste = async () => {
    let value = await navigator.clipboard.readText()
    if (value.startsWith('https://')) {
        value = value.slice(8)
    }
    instanceUrl.value = value
}

const rules = {
    notEmpty: value => value === '' ? 'Le champ est vide.' : true,
    validUrl: value => !isValidUrl('https://' + value) ? 'L\'URL n\'est pas valide.' : true,
}
const updateUrl = (e) => {
    if (e.startsWith('https://')) {
        e = e.slice(8)
    }
    instanceUrl.value = e
}
</script>

<template>
    <v-form validate-on="submit" @submit.prevent="next">

        <v-alert
            text="C'est l'adresse web de la page d'accueil du site auquel vous souhaitez vous connecter. Par exemple https://mobilizon.fr ou https://keskonfait.fr."
            title="Quelle est l'URL de votre instance Mobilizon ?"
            type="info"
            class="mb-5"
            :closable="true"
        ></v-alert> 

        <v-text-field 
            type="url" 
            :model-value="instanceUrl"
            @update:model-value="updateUrl"
            :rules="[rules.notEmpty, rules.validUrl]"
            validate-on="input"
            label="URL de l'instance Mobilizon"
            placeholder="mobilizon.fr"
            append-inner-icon="mdi-content-paste"
            @click:append-inner="paste" 
            prefix="https://" 
        ></v-text-field>
    
        <v-btn
            type="submit"
            color="primary"
        >Confirmer</v-btn>          
    </v-form>
</template>