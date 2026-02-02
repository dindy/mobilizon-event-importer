<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { componentTranslate } from '../i18n/utils.js'

const store = useStore()
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isLoadingConfig = computed(() => store.getters.isLoadingConfig)
const $ct = componentTranslate(`Home`)

store.dispatch('setPageTitle', $ct('title'))
</script>

<template>
    <v-infinite-scroll v-if="isLoadingConfig || isLoadingGroups"></v-infinite-scroll>
    <div v-else>
        <v-card
            prepend-icon="mdi-calendar-plus"
            color="secondary"
            variant="outlined"
            :title="$ct('occasional_import.title')" 
            :subtitle="$ct('occasional_import.subtitle')"
            class="bg-white"
        >
            <v-card-text>
                <p>{{ $ct('occasional_import.text') }}</p>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="store.dispatch('navigateTo', '/scrapEvent')" :text="$ct('occasional_import.btn')"></v-btn>
            </v-card-actions>
        </v-card>
        <v-card
            prepend-icon="mdi-calendar-multiple"
            color="secondary"
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
    </div>
</template>

<style scoped>

</style>
