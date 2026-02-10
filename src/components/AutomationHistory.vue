<script setup>
import { computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { componentTranslate } from '../i18n/utils.js'

const { t } = useI18n()
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
const isDeleting = computed(() => store.getters.isDeletingAutomationById(route.params.id))
const isFetching = computed(() => store.getters.isFetchingAutomationHistory)
const load = () => store.dispatch('loadAutomation', route.params.id) 
const refresh = () => store.dispatch('fetchAutomationHistory', route.params.id) 
const manageForGroup = computed(() => store.getters.getSelectedGroup)
const actor = computed(() => manageForGroup.value || store.getters.getSelectedIdentity)
const $ct = componentTranslate(`AutomationHistory`)
const instanceUrl = store.getters.getMobilizonInstanceUrl
const getMbzEventUrl = uid => `${instanceUrl}/events/${uid}`
store.dispatch('setPageTitle', $ct('title'))

onMounted(() => {
    load()
})

watch(actor, (newActor) => {
    store.dispatch('navigateToAndReplace', '/automations')
})

const deleteAutomation = async () => {
    await store.dispatch('deleteAutomation', automation.value.id)
    store.dispatch('navigateToAndReplace', '/automations')
    store.commit('addMessage', { text: $ct('automation_deleted'), type: 'success' })
}
</script>

<template>
    <v-card v-if="automation" :loading="isFetching || isExecuting || isDeleting">
        <v-card-title>{{ $ct('logsAndEvents') }}</v-card-title>   
        <v-card-subtitle>
            <span class="custom-text-wrap">{{ automation.url }}</span>
        </v-card-subtitle>
        <v-card-actions>
            <v-btn 
                @click="store.dispatch('executeAutomation', automation.id)" 
                class="float-right" 
                :text="$ct('execute')"
                prepend-icon="mdi-lightning-bolt"
            ></v-btn>
            <v-btn
                prepend-icon="mdi-delete"
                :text="$ct('delete_automation')"
                @click="deleteAutomation"
            ></v-btn>            
        </v-card-actions>
        <v-list>
            <v-list-subheader v-if="!isFetching && history.length == 0">
                <span class="custom-text-wrap">{{ $ct('noHistory') }}</span>
            </v-list-subheader>

            <v-list-group v-if="events.length > 0" value="events">
                <template v-slot:activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        :title="$ct('events')"
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
                            <span class="text-body-1">{{ event.type == 'created' ? $ct('created') : $ct('updated') }} <a target="_blank" :href="getMbzEventUrl(event.mbzUid)">{{ event.title }}</a></span>
                        </div>
                    </template>
                </v-list-item>
            </v-list-group>

            <v-list-group v-if="logs.length > 0" value="logs">
                <template v-slot:activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        :title="$ct('logs')"
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

<style scoped>
.custom-text-wrap {
    -ms-word-break: break-all;
    word-break: break-all;

    /* Non standard for webkit */
     word-break: break-word;

    -webkit-hyphens: auto;
    -moz-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;      
    white-space: normal !important;  
}
</style>