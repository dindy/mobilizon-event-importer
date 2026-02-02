<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { componentTranslate } from '../i18n/utils.js'
import Map from './Map.vue'
const defaultMapCenter = [43.63421932550079, -1.1998593807220461] // Pey mon village <3
const $ct = componentTranslate('LocateFromMapOverlay')
const emit = defineEmits('toggleShow', 'validate')
const props = defineProps({
    show: Boolean,
    isLoading: Boolean,
    latitude: Number,
    longitude: Number
})
const globalLatitude = computed(() => props.latitude)
const globalLongitude = computed(() => props.longitude)
const globalShow = computed(() => props.show)
const latitude = ref(globalLatitude.value || defaultMapCenter[0])
const longitude = ref(globalLongitude.value || defaultMapCenter[1])

watch(globalLatitude, async (newLatitude, oldLatitude) => { 
    latitude.value = newLatitude
})
watch(globalLongitude, async (newLongitude, oldLongitude) => { 
    longitude.value = newLongitude
})
watch(globalShow, async (newShow, oldShow) => { 
    if (globalLatitude.value && globalLongitude.value) {
        latitude.value = globalLatitude.value
        longitude.value = globalLongitude.value
    }
})

const isLoadingGeolocation = ref(false)
const mapCenter = computed(() => [latitude.value, longitude.value])
const altCoords = ref(null)

const isOpen = computed(() => {
    return props.show
})

const toggleShow = () => emit('toggleShow')

const geolocateUser = () => {
    if ("geolocation" in navigator) {
        isLoadingGeolocation.value = true
        navigator.geolocation.getCurrentPosition((position) => {
            isLoadingGeolocation.value = false
            latitude.value = position.coords.latitude
            longitude.value = position.coords.longitude
            mapCenter.value = [latitude.value, longitude.value]
        }, (e) => {
            isLoadingGeolocation.value = false            
            store.dispatch('submitErrorFromText', e.message)
        });        
    }    
}

const updateCoords = (coords, zoom = null) => {
    longitude.value = coords.lng
    latitude.value = coords.lat
}

const validateMapLocation = () => emit('validate', {
    longitude: longitude.value,
    latitude: latitude.value
})

</script>

<template>
    <v-overlay 
        class="screen-overlay"
        scrim="white" 
        opacity="1" 
        :close-on-content-click="false" 
        v-model="isOpen" 
        scroll-strategy="block"
        content-class="overlay-content-wrapper"
    >
        <div class="overlay-content">
            <!-- <v-btn prepend-icon="mdi-magnify" @click="toggleSearchAddressFromStringOverlay">Centrer sur un lieu</v-btn>   -->
            <v-btn 
                :loading="isLoading" 
                prepend-icon="mdi-crosshairs-gps" 
                @click="geolocateUser"
            >{{ $ct('geolocateButton') }}</v-btn>                
            <div class="map-select">
                <Map 
                    ref="map2"
                    @update-coords="updateCoords" 
                    :coords="[ latitude, longitude ]" 
                    :center="[ latitude, longitude ]"
                    :alt-coords="altCoords"
                    :zoom="15"
                    :canUpdateCoords="true"
                />         
            </div>              
            <div class="map-select-caption text-caption font-italic">{{ $ct('mapCaption') }}</div>       
            <v-btn color="" prepend-icon="mdi-close" @click="toggleShow">{{ $ct('cancel') }}</v-btn>            
            <v-btn class="" @click="validateMapLocation" prepend-icon="mdi-check" color="success">{{ $ct('validate') }}</v-btn>
        </div>
    </v-overlay>    
</template>