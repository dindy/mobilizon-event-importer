<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { componentTranslate } from '../i18n/utils.js'
import { isValidUrl } from '../utils/utils'

const route = useRoute()
const store = useStore()
const $ct = componentTranslate('Share')

store.dispatch('setPageTitle', $ct('title'))

const title = ref('')
const text = ref('')
const url = ref('')
const toImport = ref(null)

const isAppAuth = store.getters.isMobilizonAppAuthorized

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
        if (isAppAuth) {
            await store.dispatch('scrapEvent', toImport.value)
            store.dispatch('navigateTo', '/createEvent')            
        } else {
            const mbzInstanceUrl = store.getters.getMobilizonInstanceUrl
            store.dispatch('saveSharingUrl', toImport.value)
            store.dispatch('informUser', $ct('login_to_share'))
            if (mbzInstanceUrl) {
                store.dispatch('navigateTo', '/instance')
            } else {
                store.dispatch('navigateTo', '/')
            }            
        }
    }
})

const go = () => {
    store.dispatch('shareUrl', toImport.value)
    store.dispatch('navigateTo', '/scrapEvent')
}

const scrap = () => {
    store.dispatch('navigateTo', '/scrapEvent')
}
</script>

<template>
    <div v-if="!store.getters.isLoadingScrapper">
        <v-alert :title="$ct('invalid_url_title')"  type="warning" v-if="!toImport" :text="$ct('invalid_url_text')"></v-alert>
        <v-btn
            v-if="toImport"
            class="mt-5"
            color="primary"
            @click="go"
        >{{$ct('confirm')}}</v-btn>   
        <v-btn
            v-else
            class="mt-5"
            color="primary"
            @click="scrap"
        >{{$ct('indicate_url')}}</v-btn>       
    </div>
    <div v-else>
        <v-infinite-scroll class="text-center">{{$ct('loading_event')}}</v-infinite-scroll>
    </div>
</template>

<style scoped>
</style>