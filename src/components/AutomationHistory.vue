<script setup>
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const store = useStore()
const history = computed(() => store.getters.getAutomationHistory)
const logs = computed(() => store.getters.getAutomationLogs
    .sort((log1, log2) => log1.id < log2.id)
)
const events = computed(() => ([
    ...store.getters.getAutomationEvents.map(event => ({...event, type: 'created', eventDate: event.createdAt})),
    ...store.getters.getAutomationEvents
        .filter(event => event.createdAt !== event.updatedAt)
        .map(event => ({ ...event, type: 'updated', eventDate: event.updatedAt }))
        .sort((e1, e2) => e1.id < e2.id),
]))
const automation = computed(() => store.getters.getAutomationById(route.params.id))
const isExecuting = computed(() => store.getters.isExecutingAutomationById(route.params.id))
const isFetching = computed(() => store.getters.isFetchingAutomationHistory)
const load = () => store.dispatch('loadAutomation', route.params.id) 
const refresh = () => store.dispatch('fetchAutomationHistory', route.params.id) 
const manageForGroup = computed(() => store.getters.getSelectedGroup)
const actor = computed(() => manageForGroup.value || store.getters.getSelectedIdentity)
store.dispatch('setPageTitle', 'Détails de l\'automatisation')
onMounted(() => {
    load()
})
watch(actor, (newActor) => {
    router.replace('/automations')
    store.commit('removeLastPathsFromHistory', 2)
})
</script>
<template>
    <v-card :loading="isFetching || isExecuting">
        <v-card-title>Logs et événements importés</v-card-title>   
        <v-card-subtitle><span class="text-wrap">{{ automation.url }}</span></v-card-subtitle>
        <v-card-actions>
            <v-btn @click="store.dispatch('executeAutomation', automation.id)" class="float-right" text="Exécuter"></v-btn>
        </v-card-actions>
        <v-list>

            <v-list-subheader v-if="!isFetching && history.length == 0">Cette automatisation n'a pas encore été exécutée.</v-list-subheader>

            <v-list-group v-if="events.length > 0" value="events">
                <template v-slot:activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        title="Evénements"
                    ></v-list-item>
                </template>   

                <v-list-item
                    v-for="event in events"
                    v-if="events.length > 0"
                    lines="1"
                    :key="event.id"
                >
                    <template v-slot:default>
                        <div class="text-subtitle-2">
                            {{ (new Date(event.eventDate)).toLocaleString() }}
                        </div>
                        <div>
                            <span class="text-body-1">{{ event.type == 'created' ? 'Création' : 'Modification' }} de '{{ event.title }}'</span>
                        </div>
                    </template>
                </v-list-item>
            </v-list-group>

            <v-list-group v-if="logs.length > 0" value="logs">
                <template v-slot:activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        title="Logs"
                    ></v-list-item>
                </template>   

                <v-list-item
                    v-for="log in logs"
                    v-if="logs.length > 0"
                    lines="2"
                    :key="log.id"
                >
                    <template v-slot:default>
                        <div class="text-subtitle-2">
                            <v-avatar
                                :color="log.type"
                                border="thin opacity-25"
                                size="12"
                                start
                                class="mie-4"
                            ></v-avatar>
                            {{ (new Date(log.createdAt)).toLocaleString() }}
                        </div>
                        <div>
                            <span class="text-body-1">{{ log.message }}</span>
                        </div>
                    </template>
                </v-list-item>
            </v-list-group>

        </v-list>
    </v-card>
</template>