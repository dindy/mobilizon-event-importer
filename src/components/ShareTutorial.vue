<script setup>
import { componentTranslate } from '../i18n/utils.js'
import { useStore } from 'vuex'

const store = useStore()
const $ct = componentTranslate('ShareTutorial')
store.dispatch('setPageTitle', $ct('title'))

</script>

<template>
    <v-card>
        <v-card-title>
            <v-icon icon="mdi-help-circle" size="large" class="me-3"></v-icon>
            {{ $ct('subtitle') }}
        </v-card-title>
        <v-card-subtitle>{{ $ct('notabene') }}</v-card-subtitle>
        <v-card-text>
            <p>1. {{ $ct('step1') }}</p>
            <img class="w-100" src="/share-tutorial-screens/share-tuto-1.jpg"/>
            <p class="mt-5">2. {{ $ct('step2') }}</p>
            <img class="w-100" src="/share-tutorial-screens/share-tuto-2.jpg"/>
            <p class="mt-5">3. {{ $ct('step3') }}</p>
            <img class="w-100" src="/share-tutorial-screens/share-tuto-3.jpg"/>
            <p class="mt-5">4. {{ $ct('step4') }}</p>
            <p class="mt-5">5. {{ $ct('step5') }}</p>
            <img class="w-100" src="/share-tutorial-screens/share-tuto-4.jpg"/>
            <p class="mt-5">6. {{ $ct('step6') }}</p>
            <img class="w-100" src="/share-tutorial-screens/share-tuto-5.jpg"/>
            <p class="mt-5">7. {{ $ct('step7') }}</p>
            <img class="w-100" src="/share-tutorial-screens/share-tuto-6.jpg"/>
            <p class="mt-5">8. {{ $ct('step8') }}</p>
            <img class="w-100" src="/share-tutorial-screens/share-tuto-7.jpg"/>
        </v-card-text>
    </v-card>
</template>