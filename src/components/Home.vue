<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { componentTranslate } from '../i18n/utils.js'
import { info } from 'autoprefixer'

const store = useStore()
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isLoadingConfig = computed(() => store.getters.isLoadingConfig)
const $ct = componentTranslate(`Home`)

store.dispatch('setPageTitle', $ct('title'))
</script>

<template>
    <v-infinite-scroll v-if="isLoadingConfig || isLoadingGroups"></v-infinite-scroll>
    <div v-else>
        <v-alert 
            :title="$ct('facebook_alert.title')" 
            type="warning" 
            :text="$ct('facebook_alert.text')"
            class="mb-5 mt-1"
        ></v-alert>
        <v-card
            prepend-icon="mdi-calendar-plus"
            color="primary"
            variant="outlined"
            :title="$ct('occasional_import.title')" 
            :subtitle="$ct('occasional_import.subtitle')"
            class="bg-white"
        >
            <v-card-text>
                <p>{{ $ct('occasional_import.text') }}</p>
                <p class="mt-3">{{ $ct('occasional_import.mobile_tutorial_txt') }}
                    <v-icon @click="store.dispatch('navigateTo', '/shareTutorial')" icon="mdi-help-circle" size="medium"></v-icon>
                </p>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="store.dispatch('navigateTo', '/scrapEvent')" :text="$ct('occasional_import.btn')"></v-btn>
            </v-card-actions>
        </v-card>
        <v-card
            prepend-icon="mdi-calendar-multiple"
            color="primary"
            variant="outlined"        
            class="mt-5" 
            :title="$ct('automation.title')" 
            :subtitle="$ct('automation.subtitle')"
        >
            <v-card-text>
                <p>{{ $ct('automation.text.0') }}</p>
                <p class="mt-3">{{ $ct('automation.text.1') }}</p>
            </v-card-text>        
            <v-card-actions>
                <v-btn @click="store.dispatch('navigateTo', '/automations')" :text="$ct('automation.btn')"></v-btn>
            </v-card-actions>        
        </v-card>
        <v-card
            prepend-icon="mdi-bug"
            color="grey-darken-1"
            variant="outlined"        
            class="mt-5" 
            :title="$ct('bug.title')" 
            :subtitle="$ct('bug.subtitle')"
        >
            <v-card-text>
                <p>{{ $ct('bug.text') }} <a class="color: blue;" href="mailto:contact@webworkers.agency" target="_blank">contact@webworkers.agency</a></p>
            </v-card-text>
        </v-card> 
        <v-card
            prepend-icon="mdi-github"
            color="grey-darken-1"
            variant="outlined"        
            class="mt-5" 
            :title="$ct('contribute.title')" 
            :subtitle="$ct('contribute.subtitle')"
        >
            <v-card-text>
                <p>{{ $ct('contribute.text') }}</p>
                <ul>
                    <li><a href="https://github.com/dindy/mobilizon-event-importer" target="_blank">Front-end</a></li>
                    <li><a href="https://github.com/dindy/event-parser" target="_blank">Back-end</a></li>
                </ul>
            </v-card-text>
        </v-card>                 
    </div>
</template>

<style scoped>
    ul {
        list-style-position: inside;
    }
    a {
        color: rgb(var(--v-grey-darken-1)) !important;
    }
</style>
