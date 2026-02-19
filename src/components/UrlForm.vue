<script setup>
import { computed, ref, watch, useTemplateRef } from 'vue'
import { componentTranslate } from '../i18n/utils.js'
import { isValidUrl } from '../utils/utils.js'

const $ct = componentTranslate('UrlForm')
const props = defineProps({
    placeholder: String,
    label: String,
    default: String,
    buttonText: String,
    isLoading: Boolean,
    suffix: String || null,
    prefix: String || null
})
const form = useTemplateRef('form')
const emit = defineEmits('send', 'updated')
const url = ref(props.default || '')
const send = async (submitEventPromise) => {
    
    const { valid, errors } = await submitEventPromise
    
    if (valid)
    {
        if (props.prefix && props.prefix.endsWith('/') && url.value.startsWith('/')) {
            url.value = url.value.slice(1)
        }
        
        if (props.suffix && props.suffix.startsWith('/') && url.value.endsWith('/')) {
            url.value = url.value.slice(0, url.value.length - 1)
        }

        emit('send', `${props.prefix || ''}${url.value}${props.suffix || ''}`)
    }
}

const paste = async () => {
    const value = await navigator.clipboard.readText()
    updateUrl(value)
}

const rules = {
    notEmpty: value => value === '' ? $ct('emptyField') : true,
    validUrl: value => !isValidUrl(`${props.prefix || ''}${value}${props.suffix || ''}`) ? $ct('invalidUrl') : true,
}

const updateUrl = (e) =>
{    
    if (e && props.suffix && e.endsWith(props.suffix)) {
        e = e.slice(0, e.length - props.suffix.length)
    }
    
    if (e && props.prefix && e.startsWith(props.prefix)) {
        e = e.slice(props.prefix.length)
    }
    
    url.value = e    
    
    emit('updated', e)
}
// const suffix = computed(() => props.suffix)
// watch(suffix, (newSuffix, oldSuffix) => {
//     form.value.reset()
// })
// const prefix = computed(() => props.prefix)
// watch(prefix, (newSuffix, oldPrefix) => {
    
// })

const reset = (value) => {
    console.log('reset value received ', value);
        
    form.value.reset()
    url.value = value
}
defineExpose({ reset })
</script>

<template>
    <v-form ref="form" validate-on="submit" @submit.prevent="send">
        <v-text-field 
            type="url" 
            @update:model-value="updateUrl"
            :model-value="url"
            :rules="[rules.notEmpty, rules.validUrl]"
            validate-on="input"
            :placeholder="props.placeholder" 
            :label="props.label"
            append-inner-icon="mdi-content-paste"
            @click:append-inner="paste"
            :suffix="props.suffix"
            :prefix="props.prefix"
        ></v-text-field>
        <v-btn 
            :loading="props.isLoading" 
            type="submit"
            color="primary"
        >{{ props.buttonText }}</v-btn>
    </v-form>    
</template>