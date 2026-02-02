<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { componentTranslate } from '../i18n/utils.js'
import UrlForm from './UrlForm.vue'

const store = useStore()
const url = ref(null)
const $ct = componentTranslate('GroupScrapper')

store.dispatch('setPageTitle', $ct('title'))

const scrap = async (url) => {    
    await store.dispatch('scrapGroup', url)
    store.dispatch('navigateTo', '/createGroup')
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