<script setup>

import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Avatar from './Avatar.vue'
import Group from './Group.vue'

const router = useRouter()
const store = useStore()
const manageForGroup = computed(() => store.getters.getSelectedGroup)
const actor = computed(() => manageForGroup.value || store.getters.getSelectedIdentity)
const automations = computed(() => store.getters.getActorAutomations)
const isFetching = computed(() => store.getters.isFetchingAutomations)
const fabIsHidden = ref(true)

store.dispatch('setPageTitle', 'Automatisations')
onMounted(() => {
    fabIsHidden.value = false
    store.dispatch('fetchAutomations')
})
watch(actor, (newActor) => {
    store.dispatch('fetchAutomations')
})
</script>

<template>
    <v-card
        :title="actor.name"
        subtitle="Automatisations enregistrées" 
        :loading="isFetching">
        <template v-slot:prepend>
            <Avatar :type="manageForGroup ? 'group' : 'person'" :actor="actor"></Avatar>
        </template>
        <v-list>
            <v-list-subheader v-if="isFetching || (automations.length > 0)">
                Automatisations enregistrées
            </v-list-subheader>   
            <v-list-item 
                :value="automation.id" 
                v-for="automation in automations" 
                v-if="isFetching || (automations.length > 0)"
                prepend-icon="mdi-lightning-bolt-circle"
                :title="automation.type" 
                :subtitle="automation.url"
                :key="automation.id"
                @click="store.dispatch('navigateTo',`/automation/${automation.id}`)"
                >
            </v-list-item>
            <v-list-subheader v-else>Aucune automatisation</v-list-subheader>
        </v-list>
    </v-card>
    <v-fade-transition>
        <v-fab
            v-show="!fabIsHidden"
            color="primary"
            class="fab-page"
            icon="mdi-plus"
            location="bottom end"
            size="large"
            absolute
            transition="slide-x-transition"
            @click="store.dispatch('navigateTo','/registerFeed')"
        ></v-fab>    

    </v-fade-transition>
</template>