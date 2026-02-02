<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import UrlForm from './UrlForm.vue'
import { componentTranslate } from '../i18n/utils.js'

const router = useRouter()
const store = useStore()
const url = ref(null)
const $ct = componentTranslate('RegisterFeed')

store.dispatch('setPageTitle', $ct('title'))

const register = async (url) => {    
    const success = await store.dispatch('registerFeed', { url, type: 'ics' })
    if (success) {
        store.dispatch('navigateTo', '/automations')
    }
}

</script>

<template>
    <UrlForm
        :placeholder="$ct('placeholder')"
        :label="$ct('label')"
        :default="url"
        :buttonText="$ct('button')"
        :is-loading="store.getters.isRegisteringAutomation"
        @send="register"
    />
</template>