<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()
store.dispatch('setPageTitle', 'Evenement importé')
const seeEvent = () => {
    const uuid = store.getters.getMobilizonEventUUID
    const instanceUrl = store.getters.getMobilizonInstanceUrl
    window.open(`${instanceUrl}/events/${uuid}`)
}

const newEvent = () => {
    router.push('/')
}
</script>
<template>
    <v-alert
        text="Votre événement a été enregistré avec succès !"
        title="Evénement enregistré"
        type="success"
        class=""
    ></v-alert>       
    <v-btn
        prepend-icon="mdi-open-in-new" 
        class="mt-5" 
        @click="seeEvent" 
        href="#"
        >Page de l'événement</v-btn>
        <br><v-btn 
        prepend-icon="mdi-plus" 
        class="mt-5" 
        color="primary" 
        @click="newEvent" 
    >Importer un autre événement</v-btn>
</template>