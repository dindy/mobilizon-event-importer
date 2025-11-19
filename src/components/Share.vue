<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()
store.dispatch('setPageTitle', 'Partager l\'événement')

const title = ref('')
const text = ref('')
const url = ref('')
const path = ref('')
const otitle = ref('')
const otext = ref('')
const ourl = ref('')
const opath = ref('')

onMounted(() => {
    const parsedUrl = new URL(window.location);
    otitle.value = parsedUrl.searchParams.get('title')
    otext.value = parsedUrl.searchParams.get('text')
    ourl.value = parsedUrl.searchParams.get('url')
    opath.value = window.location

    title.value = route.query.title
    text.value = route.query.text
    url.value = route.query.url 
    path.value = route.fullPath

    store.commit('setScrapperUrl', url)
})
</script>

<template>
    <h1>Import</h1>
    <h2>Vanilla JS</h2>
    <p>Titre: {{ otitle }}</p>
    <p>Text: {{ otext }}</p>
    <p>URL: {{ ourl }}</p>
    <p>Path: {{ opath }}</p>
    <h2>Router</h2>
    <p>Titre:{{ title }}</p>
    <p>Text:{{ text }}</p>
    <p>URL:{{ url }}</p>
    <p>Path:{{ path }}</p>
</template>

<style scoped>
    p {
        margin: 10px 0;
    }
</style>