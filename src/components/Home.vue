<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const isLoadingConfig = computed(() => store.getters.isLoadingConfig)
const isConnected = computed(() => store.getters.isMobilizonAppAuthorized)
store.dispatch('setPageTitle', 'Accueil')
</script>

<template>
    <v-infinite-scroll v-if="isLoadingConfig || isLoadingGroups"></v-infinite-scroll>
    <div v-else>
        <v-card
            prepend-icon="mdi-calendar-plus"
            color="secondary"
            variant="outlined"
            title="Importer un événement" 
            subtitle="Importez un événement depuis son URL"
        >
            <v-card-text>
                <p>Importez un événement depuis son adresse Facebook, Instagram, HelloAsso, Dice, Shotgun, Eventbrite ou toute autre plateforme qui utilise des metadonnées standards.</p>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="router.push('/scrapEvent')" text="Ajouter un événement"></v-btn>
            </v-card-actions>
        </v-card>
        <v-card
            prepend-icon="mdi-calendar-multiple"
            color="secondary"
            variant="outlined"        
            class="mt-5" 
            title="Imports automatiques" 
            subtitle="Importez automatiquement les événements d'un flux"
        >
            <v-card-text>
                <p>L'application enregistre l'URL du flux et importera automatiquement les nouveaux événements à interval régulier.</p>
                <p class="mt-3">Seuls les flux ICS (iCalendar) sont actuellement supportés.</p>
            </v-card-text>        
            <v-card-actions>
                <v-btn @click="router.push('/registerFeed')" text="Ajouter un flux"></v-btn>
                <!-- <v-btn text="Gérer les flux"></v-btn> -->
            </v-card-actions>        
        </v-card>
    </div>
</template>

<style scoped>

</style>
