<script setup>

import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { componentTranslate } from '../i18n/utils.js'
import { onMounted } from 'vue'
import { isValidUrl } from '../utils/utils.js'
const $ct = componentTranslate('SelectInstance')
const removeScheme = url => {

    if (url.startsWith('https://')) {
        url = url.slice(8)
    } else if (url.startsWith('http://')) {
        url = url.slice(7)
    }

    return url
}
const store = useStore()
const instanceUrl = ref(removeScheme(store.getters.getMobilizonInstanceUrl || ''))
const next = () => {
    if (instanceUrl.value.endsWith('/')) {
        instanceUrl.value = instanceUrl.value.slice(0, -1)
    }
    store.dispatch('registerApp', 'https://' + instanceUrl.value)
}

const isInstanceUrlValid = computed(() => isValidUrl(instanceUrl.value))
store.dispatch('setPageTitle', $ct('title'))
const paste = async () => {
    let value = await navigator.clipboard.readText()
    instanceUrl.value = removeScheme(value)
}

const rules = {
    notEmpty: value => value === '' ? $ct('emptyField') : true,
    validUrl: value => !isValidUrl('https://' + value) ? $ct('invalidUrl') : true,
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
            :text="$ct('alertText')"
            :title="$ct('alertTitle')"
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
            :label="$ct('label')"
            :placeholder="$ct('placeholder')"
            append-inner-icon="mdi-content-paste"
            @click:append-inner="paste" 
            prefix="https://" 
        ></v-text-field>
    
        <v-btn
            prepend-icon="mdi-login"
            type="submit"
            color="primary"
            :loading="store.getters.isRegisteringApp"
        >{{ $ct('loginButton') }}</v-btn>          
    </v-form>
</template>