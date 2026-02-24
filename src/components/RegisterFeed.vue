<script setup>
import { ref, computed, watch, useTemplateRef, onMounted } from 'vue'
import { useStore } from 'vuex'
import UrlForm from './UrlForm.vue'
import { componentTranslate } from '../i18n/utils.js'

const store = useStore()
const url = ref(null)
const $ct = componentTranslate('RegisterFeed')
const prefix = ref(null)
const suffix = ref(null)
const placeholder = ref(null)
const label = ref(null)
const types = [{
    value: 'auto',
    title: $ct('title_auto'),
    placeholder: $ct('placeholder_auto'),
    label: $ct('label_auto'),
},{
    value: 'ics',
    title: $ct('title_ics'),
    placeholder: $ct('placeholder_ics'),
    label: $ct('label_ics'),
}, {
    value: 'fb_group',
    title: $ct('title_fb_group'),
    placeholder: $ct('placeholder_fb_group'),
    label: $ct('label_fb_group'),
    prefix: 'https://www.facebook.com/groups/',
    suffix: '/events',
}, {
    value: 'fb_community',
    title: $ct('title_fb_community'),
    placeholder: $ct('placeholder_fb_community'),
    label: $ct('label_fb_community'),
    prefix: 'https://www.facebook.com/',
    suffix: '/events',
}, {
    value: 'fb_profile',
    title: $ct('title_fb_profile'),
    placeholder: $ct('placeholder_fb_profile'),
    label: $ct('label_fb_profile'),
    prefix: 'https://www.facebook.com/profile.php?id=',
    suffix: '&sk=events',
}]
const urlForm = ref()
const updateType = (value) =>
{
    const type = types.filter(type => type.value == value)?.[0]

    if (type) {
        prefix.value = type.prefix || null        
        suffix.value = type.suffix || null   
        placeholder.value = type.placeholder     
        label.value = type.label
    }
}

const selectedType = ref(types[0].value)
const detectedType = ref(null)
const humanDetectedType = computed(() => types.filter(type => type.value == detectedType.value)?.[0]?.title || null)

watch(selectedType, (newVal, oldVal) => {
    urlForm.value.reset()
    updateType(newVal)
})
store.dispatch('setPageTitle', $ct('title'))

const register = async (url) => 
{
    let type = selectedType.value

    if (type === 'auto') {
        const detected = getTypeAndUrl(url)
        type = detected.type
        url = detected.url
    } 
    if (type !== 'ics') {
        type = 'fb'
    }
    
    const success = await store.dispatch('registerFeed', { url, type })

    if (success) {
        store.dispatch('navigateTo', '/automations')
    }
}

const getTypeAndUrl = value => 
{
    const fbGroupRegex = /[\S]?facebook\.com\/(groups\/)?([^\/w]+)/g
    const fbGroupMatch = [...value.matchAll(fbGroupRegex)]

    const fbProfileRegex = /[\S]?facebook\.com\/profile\.php\?id=([0-9]+)/g
    const fbProfileMatch = [...value.matchAll(fbProfileRegex)]

    let type = null
    let url = null
    let id = null
    if (fbProfileMatch[0] && fbProfileMatch[0][1]) {
        type = 'fb_profile'       
        id = fbProfileMatch[0][1]
    } else if (fbGroupMatch[0]) {
        if (fbGroupMatch[0][1]) {
            id = fbGroupMatch[0][1]
            type = 'fb_group'
        } else {
            id = fbGroupMatch[0][0]
            type = 'fb_community'
        }
    } else {
        type = 'ics'
        id = value
    }
    const { prefix, suffix } = types.filter(lType => lType.value == type)?.[0] || null
    url = `${prefix || ''}${id}${suffix || ''}`     
    console.log(type, id, url);
    
    return { type, url }
}

const updatedUrl = value => 
{
    if (value && selectedType.value == 'auto') 
    {
        detectedType.value = getTypeAndUrl(value).type
    }
}

onMounted(() => {
    updateType(types[0].value)
})
</script>

<template>

    <v-select
        label="Sélectionnez un type de source"
        :items="types"
        v-model="selectedType"
        @update:model-value="updateType"
    ></v-select>

    <label v-if="selectedType === 'auto'">{{ humanDetectedType }}</label>
    
    <UrlForm
        ref="urlForm"
        :placeholder="placeholder"
        :label="label"
        :default="url"
        :buttonText="$ct('button')"
        :is-loading="store.getters.isRegisteringAutomation"
        @send="register"
        @updated="updatedUrl"
        :suffix="suffix"
        :prefix="prefix"
    />
</template>