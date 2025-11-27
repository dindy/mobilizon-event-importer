<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex';
import { getFormattedAddress } from '../utils/utils'
import Map from './Map.vue'
import SearchAddressFromStringOverlay from './SearchAddressFromStringOverlay.vue'
import SearchAddressFromCoordsOverlay from './SearchAddressFromCoordsOverlay.vue'
import LocateFromMapOverlay from './LocateFromMapOverlay.vue'

const store = useStore()

const props = defineProps({
    address: Object,
    latitude: Number,
    longitude: Number,
    groupAddress: Object
})

const emit = defineEmits('selectAddress', 'selectCoords')

const physicalAddress = ref(props.address)
const latitude = ref(props.latitude)
const longitude = ref(props.longitude)
const groupAddress = ref(props.groupAddress)

const isLoadingAdressesFromCoords = computed(() => store.getters.isLoadingAdressesFromCoords)
const isLoadingAdressesFromString = computed(() => store.getters.isLoadingAddressesFromString)
const foundAddressesFromCoords = computed(() => store.getters.getAddressesFromCoords)
const foundAddressesFromString = computed(() => store.getters.getAddressesFromString)
const searchAddressString = ref("")
const isLoadingGeolocation = ref(false)
const searchAddressFromStringOverlay = ref(false)
const locateFromMapOverlay = ref(false)
const validateMapLocationDialog = ref(false)
const searchAddressFromCoordsOverlay = ref(false)

const useFoundAddress = address => {
    physicalAddress.value = {
        description: address.description,
        locality: address.locality,
        postalCode: address.postalCode,
        street: address.street,
        country: address.country,        
    }
    emit('selectAddress', physicalAddress)
    if (address.geom) {
        latitude.value = address.geom.split(';')[1]
        longitude.value = address.geom.split(';')[0]
        updateCoords(latitude.value, longitude.value)
    }    
}
const updateCoords = (lat, lng) => {
    console.log('upadte coords from Locationselect');
    
    latitude.value = lat
    longitude.value = lng
    emit('selectCoords', { latitude: parseFloat(lat), longitude: parseFloat(lng) })
}

const searchAddress = (address) => {
    store.commit('clearAddressesFromString')
    store.dispatch('searchAddressFromString', getFormattedAddress(address))
}

const toggleSearchAddressFromStringOverlay = () => {    
    searchAddressFromStringOverlay.value = !searchAddressFromStringOverlay.value
    if (searchAddressFromStringOverlay.value) {
        store.commit('clearAddressesFromString') 
        searchAddressString.value = getFormattedAddress(physicalAddress.value)
        searchAddress(physicalAddress.value)
    }
}

const openLocateFromMapOverlay = () => {
    locateFromMapOverlay.value = true
}

const closeLocateFromMapOverlay = () => {
    locateFromMapOverlay.value = false
}

const toggleLocateFromMapOverlay = () => {    
    if (locateFromMapOverlay.value) {
        closeLocateFromMapOverlay()
    } else {
        openLocateFromMapOverlay()
    }
}

const validateMapLocation = (coords) => {
    updateCoords(coords.latitude, coords.longitude)  
    closeLocateFromMapOverlay()
    validateMapLocationDialog.value = true
    store.dispatch('searchAddressFromCoords', { lng: longitude.value, lat: latitude.value })
}

const acceptSearchAddressFromCoordsOverlay = () => {
    searchAddressFromCoordsOverlay.value = true
    validateMapLocationDialog.value = false
} 

const openSearchAddressFromCoordsOverlay = () => {
    searchAddressFromCoordsOverlay.value = true
    store.dispatch('searchAddressFromCoords', { lng: longitude.value, lat: latitude.value })
}

const toggleSearchAddressFromCoordsOverlay = () => {    
    if (!searchAddressFromCoordsOverlay.value) {
        openSearchAddressFromCoordsOverlay()
    } else {
        searchAddressFromCoordsOverlay.value = false
    }
}

const selectFoundAddressFromStringById = (id) => {
    const address = store.getters.getAddressFromStringById(id)
    useFoundAddress(address)
    searchAddressFromStringOverlay.value = false
    store.dispatch('searchAddressFromCoords', { lng: longitude.value, lat: latitude.value })
}

const selectFoundAddressFromCoordsById = (id) => {
    const address = store.getters.getAddressFromCoordsById(id)
    useFoundAddress(address)
    searchAddressFromCoordsOverlay.value = false   
    searchAddressFromStringOverlay.value = false 
}

const address = computed(() => getFormattedAddress(physicalAddress.value).split(', ').join('\n'))

const hasAddress = computed(() => getFormattedAddress(physicalAddress.value) && getFormattedAddress(physicalAddress.value) !== '')

const mapCenter = computed(() => latitude.value && longitude.value ? [latitude.value, longitude.value] : null)
</script>

<template>
    <div class="location-select">
        <v-textarea 
            v-if="hasAddress" 
            class="" 
            :hide-details="true" 
            label="Adresse" 
            rows="1" 
            auto-grow 
            v-model="address" 
            :disabled="true" 
        />
        
        <v-alert
            v-if="!hasAddress" 
            text="Il n'y a pas d'adresse renseignée pour cet événement !"
            title="Pas d'adresse"
            type="warning"
            class=""
        ></v-alert>        

        <div>
            <v-btn prepend-icon="mdi-pencil" @click="toggleSearchAddressFromStringOverlay">Modifier l'adresse</v-btn>
        </div>

        <div class="map" v-if="latitude && longitude">
            <Map 
                ref="map"
                @update-coords="updateCoords" 
                :coords="[ latitude, longitude ]" 
                :center="mapCenter"
                :alt-coords="null"
                :zoom="15"
                :canUpdateCoords="false"
                />
        </div>

        <v-alert
            v-else 
            text="Il n'y a pas de localisation GPS renseignée pour cet événement !"
            title="Pas de localisation"
            type="warning"
            class=""
        ></v-alert>          

        <div>
            <v-btn class="" prepend-icon="mdi-map-marker" @click="toggleLocateFromMapOverlay">Modifier la position</v-btn>
        </div>

        <SearchAddressFromStringOverlay 
            :show="searchAddressFromStringOverlay"
            :group-address="groupAddress"
            :physical-address="physicalAddress"
            :found-addresses="foundAddressesFromString"
            :is-loading="isLoadingAdressesFromString"
            @select-address-by-id="selectFoundAddressFromStringById"
            @toggle-show="toggleSearchAddressFromStringOverlay"
            @use-address="useFoundAddress"
            @search-address="searchAddress"
        />

        <LocateFromMapOverlay
            :show="locateFromMapOverlay"
            :isLoading="isLoadingGeolocation"
            :latitude="latitude"
            :longitude="longitude"
            @toggle-show="toggleLocateFromMapOverlay"
            @validate="validateMapLocation"
        />

        <v-dialog
            v-model="validateMapLocationDialog"
            width="auto"
        >
            <v-card
                max-width="400"
                prepend-icon="mdi-magnify"
                text="Voulez-vous également mettre à jour l'adresse de l'événement avec une adresse à proximité de la localisation ?"
                title="Mettre à jour l'adresse"
            >
                <template v-slot:actions>
                <v-btn
                    class="ms-auto"
                    color="primary"
                    text="Oui"
                    @click="acceptSearchAddressFromCoordsOverlay"
                ></v-btn>
                <v-btn
                    class="ms-auto"
                    text="Non"
                    @click="validateMapLocationDialog = false"
                ></v-btn>
                </template>
            </v-card>
        </v-dialog>
        
        <SearchAddressFromCoordsOverlay 
            :show="searchAddressFromCoordsOverlay"
            :isLoading="isLoadingAdressesFromCoords"
            :foundAddresses="foundAddressesFromCoords"
            @select-address-by-id="selectFoundAddressFromCoordsById"
            @toggle-show="toggleSearchAddressFromCoordsOverlay"
        />
    </div>
</template>

<style>
.location-select {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>