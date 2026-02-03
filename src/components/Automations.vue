<script setup>

import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { componentTranslate } from '../i18n/utils.js'
import Avatar from './Avatar.vue'

const store = useStore()
const manageForGroup = computed(() => store.getters.getSelectedGroup)
const actor = computed(() => manageForGroup.value || store.getters.getSelectedIdentity)
const automations = computed(() => store.getters.getActorAutomations)
const isFetching = computed(() => store.getters.isFetchingAutomations)
const fabIsHidden = ref(true)
const $ct = componentTranslate(`Automations`)

store.dispatch('setPageTitle', $ct('title'))
onMounted(() => {
    fabIsHidden.value = false
    store.dispatch('fetchAutomations')
})
watch(actor, (newActor) => {
    if (store.getters.isMobilizonAppAuthorized) {
        store.dispatch('fetchAutomations')
    }
})
</script>

<template>
    <v-card
        v-if="actor"
        :title="actor.name"
        :subtitle="$ct('subtitle')" 
        :loading="isFetching">
        <template v-slot:prepend>
            <Avatar :type="manageForGroup ? 'group' : 'person'" :actor="actor"></Avatar>
        </template>
        <v-card-actions>
            <v-btn
                prepend-icon="mdi-plus"
                :text="$ct('add_automation')"
                @click="store.dispatch('navigateTo','/registerFeed')"
            ></v-btn>
        </v-card-actions>        
        <v-list>
            <v-list-subheader v-if="isFetching || (automations.length > 0)">
                {{ $ct('subtitle') }}
            </v-list-subheader>   
            <v-list-item 
                :value="automation.id" 
                v-for="automation in automations" 
                v-if="isFetching || (automations.length > 0)"
                prepend-icon="mdi-robot"
                :title="automation.type" 
                :subtitle="automation.url"
                :key="automation.id"
                @click="store.dispatch('navigateTo',`/automation/${automation.id}`)"
                >
            </v-list-item>
            <v-list-subheader v-else>{{ $ct('noAutomations') }}</v-list-subheader>
        </v-list>
    </v-card>
</template>