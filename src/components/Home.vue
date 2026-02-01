<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useStore()
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isLoadingConfig = computed(() => store.getters.isLoadingConfig)
store.dispatch('setPageTitle', t('title.home'))
</script>

<template>
    <v-infinite-scroll v-if="isLoadingConfig || isLoadingGroups"></v-infinite-scroll>
    <div v-else>
        <v-card
            prepend-icon="mdi-calendar-plus"
            color="secondary"
            variant="outlined"
            :title="$t('tpl.occasional_import.title')" 
            :subtitle="$t('tpl.occasional_import.subtitle')"
            class="bg-white"
        >
            <v-card-text>
                <p>{{ $t('tpl.occasional_import.text') }}</p>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="store.dispatch('navigateTo', '/scrapEvent')" :text="$t('tpl.occasional_import.btn')"></v-btn>
            </v-card-actions>
        </v-card>
        <v-card
            prepend-icon="mdi-calendar-multiple"
            color="secondary"
            variant="outlined"        
            class="mt-5" 
            :title="$t('tpl.automation.title')" 
            :subtitle="$t('tpl.automation.subtitle')"
        >
            <v-card-text>
                <p>{{ $t('tpl.automation.text.0') }}</p>
                <p class="mt-3">{{ $t('tpl.automation.text.1') }}</p>
            </v-card-text>        
            <v-card-actions>
                <v-btn @click="store.dispatch('navigateTo', '/automations')" :text="$t('tpl.automation.btn')"></v-btn>
            </v-card-actions>        
        </v-card>
    </div>
</template>

<style scoped>

</style>
