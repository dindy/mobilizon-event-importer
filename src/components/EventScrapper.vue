<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { componentTranslate } from '../i18n/utils.js'
import UrlForm from './UrlForm.vue'

const router = useRouter()
const store = useStore()
const url = ref(null)
const $ct = componentTranslate('EventScrapper')

store.dispatch('setPageTitle', $ct('title'))

onMounted(() => {
    url.value = store.getters.getEventScrapperUrl
})

const scrap = async (url) => {    
    await store.dispatch('scrapEvent', url)
    store.dispatch('navigateTo', '/createEvent')
}

</script>

<template>
    <UrlForm
        :placeholder="$ct('placeholder')"
        :label="$ct('label')"
        :default="url"
        :buttonText="$ct('button')"
        :is-loading="store.getters.isLoadingScrapper"
        @send="scrap"
    />
</template>