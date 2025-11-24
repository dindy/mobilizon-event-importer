<script setup>
import { ref, computed, onMounted } from 'vue'
import { isValidUrl } from '../utils/utils.js'

const props = defineProps({
    placeholder: String,
    label: String,
    default: String,
    buttonText: String,
    isLoading: Boolean
})

const emit = defineEmits('send')

const url = ref(props.default || '')

const send = async (submitEventPromise) => {
    
    const { valid, errors } = await submitEventPromise
    
    if (valid) {
        emit('send', url.value)
    }
}

const paste = async () => {
    const value = await navigator.clipboard.readText()
    url.value = value
}

const rules = {
    notEmpty: value => value === '' ? 'Le champ est vide.' : true,
    validUrl: value => !isValidUrl(value) ? 'L\'URL n\'est pas valide.' : true,
}

</script>

<template>
    <v-form validate-on="submit" @submit.prevent="send">
        <v-text-field 
            type="url" 
            v-model="url"
            :rules="[rules.notEmpty, rules.validUrl]"
            validate-on="input"
            :placeholder="props.placeholder" 
            :label="props.label"
            append-inner-icon="mdi-content-paste"
            @click:append-inner="paste"
        ></v-text-field>
        <v-btn 
            :loading="props.isLoading" 
            type="submit"
            color="primary"
        >Importer</v-btn>
    </v-form>    
</template>