<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()
store.dispatch('setPageTitle', 'Evenement importé')
const isDraft = store.getters.getMobilizonEventIsDraft

const seeEvent = () => {
    const uuid = store.getters.getMobilizonEventUUID
    const instanceUrl = store.getters.getMobilizonInstanceUrl
    /* Comment because there is a bug on Mobilizon when you access the edit page directly */
    // if (isDraft) {
    //     window.open(`${instanceUrl}/events/edit/${uuid}`)
    // } else {
    //     window.open(`${instanceUrl}/events/${uuid}`)
    // }
    window.open(`${instanceUrl}/events/${uuid}`)
}

const newEvent = () => {
    store.dispatch('resetEvent')
    router.push('/')
}

const seeEventText = () => isDraft ? "Page de l'événement (brouillon)" : "Page de l'événement"

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
    >{{ seeEventText() }}</v-btn>
    <br>
    <v-btn 
        prepend-icon="mdi-plus" 
        class="mt-5" 
        color="primary" 
        @click="newEvent" 
    >Importer un autre événement</v-btn>
</template>