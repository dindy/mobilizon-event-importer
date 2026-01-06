<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { getFormattedAddress } from '../utils/utils'


const emit = defineEmits('toggleShow', 'useAddress', 'searchAddress', 'foundAdresses', 'selectAddressById')

const props = defineProps({
    show: Boolean,
    groupAddress: Object,
    physicalAddress: Object,
    foundAddresses: Array,
    isLoading: Boolean
})

const groupAddress = ref(props.groupAddress)

onMounted(() => {

})
const physicalAddress = ref(() => JSON.parse(JSON.stringify(props.physicalAddress)))

const globalShow = computed(() => props.show)

watch(globalShow, async (newShow, oldShow) => { 
    physicalAddress.value = JSON.parse(JSON.stringify(props.physicalAddress))
})

const isOpen = computed(() => {
    return props.show
})

const toggleShow = () => emit('toggleShow')

const useGroupAddress = () => {
    toggleShow()
    emit('useAddress', props.groupAddress)
}

const searchAddress = () => {
    emit('searchAddress', physicalAddress.value)
}

const selectAddress = e => emit('selectAddressById', e.id)

const incompleteSearchCriterias = computed(() => {
    const pc = physicalAddress.value.postalCode
    const locality = physicalAddress.value.locality
    
    return ((!pc || pc == '') && (!locality || locality == ''))
})

const validate = () => {
    emit('useAddress', physicalAddress.value)
    emit('toggleShow')
}
</script>

<template>
    <v-overlay 
        scrim="white" 
        opacity="1" 
        :close-on-content-click="false" 
        v-model="isOpen" 
        scroll-strategy="block"
        content-class="overlay-content-wrapper"
        class="screen-overlay"
    >
        <div class="overlay-content">      
            <v-btn v-if="groupAddress" prepend-icon="mdi-map-marker-account" @click="useGroupAddress">Utiliser l'adresse du groupe</v-btn>
            <!-- <v-btn v-if="latitude && longitude" prepend-icon="mdi-map-marker" @click="openSearchAddressFromCoordsOverlay">Utiliser la position</v-btn> -->
            <div>
                <v-text-field @click:clear="searchAddress" @input="searchAddress" label="Nom du lieu" :clearable="true" v-model="physicalAddress.description"/>
                <v-text-field @click:clear="searchAddress" @input="searchAddress" label="N° et voie" :clearable="true" id="street" v-model="physicalAddress.street"/>    
                <v-text-field @click:clear="searchAddress" @input="searchAddress" label="Ville" :clearable="true" id="locality" v-model="physicalAddress.locality"/>    
                <v-text-field @click:clear="searchAddress" @input="searchAddress" label="Code postal" :clearable="true" id="zip" v-model="physicalAddress.postalCode"/>
            </div>
            <v-card 
                style="margin-top: -20px; overflow-y: scroll; z-index: initial"
                :loading="isLoading">
                <v-list 
                    v-if="isLoading || (foundAddresses && foundAddresses.length > 0)" 
                    lines="two"
                    @click:select="selectAddress">
                    <v-list-subheader>Résultats</v-list-subheader>
                    <v-list-item
                        v-for="address in foundAddresses"    
                        :value="address.id" 
                        :key="address.id" 
                        :title="address.description" 
                        :subtitle="getFormattedAddress(address)"
                    ></v-list-item>
                </v-list>                    
                <v-list v-else>
                    <v-list-subheader>Aucune adresse trouvée</v-list-subheader>
                </v-list>
            </v-card>
            <v-alert
                v-if="incompleteSearchCriterias && !isLoading && foundAddresses.length == 0" 
                text="Indiquez une ville ou un code postal pour améliorer la recherche."
                title="Pas de résultat"
                type="info"
                class=""
            ></v-alert>  
            <v-alert
                v-if="!incompleteSearchCriterias && !isLoading && foundAddresses.length == 0" 
                title="Créez le lieu"
                type="info"
                class=""
            >
                <template v-slot:default>
                    <p>Vous ne trouvez pas votre lieu ? </p>
                    <p>Créez le sur <a target="_blank" href="https://www.openstreetmap.org">Open Street Map</a> pour le rendre visible ici et pour des millions d'utilisateurs !</p>
                </template>
            </v-alert>      
            <v-btn color="" prepend-icon="mdi-close" @click="toggleShow">Annuler</v-btn>
            <v-btn @click="validate" prepend-icon="mdi-check" color="success">Valider</v-btn>                                           
        </div>
    </v-overlay>    
</template>