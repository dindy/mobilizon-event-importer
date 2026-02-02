<script setup>
import { componentTranslate } from '../i18n/utils.js'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()
const $ct = componentTranslate('Done')

store.dispatch('setPageTitle', $ct('title'))
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
    store.dispatch('resetEventScrapper')
    store.dispatch('navigateTo','/scrapEvent')
}

const seeEventText = () => isDraft ? $ct('seeEventDraft') : $ct('seeEvent')

</script>
<template>
    <v-alert
        :text="$ct('successText')"
        :title="$ct('success')"
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
    >{{ $ct('importAnother') }}</v-btn>
</template>