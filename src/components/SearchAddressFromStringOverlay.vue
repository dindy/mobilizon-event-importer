<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { componentTranslate } from '../i18n/utils.js'
import { getFormattedAddress } from '../utils/utils'

const $ct = componentTranslate('SearchAddressFromStringOverlay')

const emit = defineEmits('toggleShow', 'useAddress', 'searchAddress', 'foundAdresses', 'selectAddressById')

const props = defineProps({
    show: Boolean,
    groupAddress: Object,
    physicalAddress: Object,
    foundAddresses: Array,
    isLoading: Boolean,
})

const groupAddress = computed(() => props.groupAddress)

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
    emit('useAddress', groupAddress.value)
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
            <v-btn v-if="groupAddress" prepend-icon="mdi-map-marker-account" @click="useGroupAddress">{{ $ct('useGroupAddress') }}</v-btn>
            <!-- <v-btn v-if="latitude && longitude" prepend-icon="mdi-map-marker" @click="openSearchAddressFromCoordsOverlay">Utiliser la position</v-btn> -->
            <div>
                <v-text-field @click:clear="searchAddress" @input="searchAddress" :label="$ct('placeName')" :clearable="true" v-model="physicalAddress.description"/>
                <v-text-field @click:clear="searchAddress" @input="searchAddress" :label="$ct('street')" :clearable="true" id="street" v-model="physicalAddress.street"/>    
                <v-text-field @click:clear="searchAddress" @input="searchAddress" :label="$ct('city')" :clearable="true" id="locality" v-model="physicalAddress.locality"/>    
                <v-text-field @click:clear="searchAddress" @input="searchAddress" :label="$ct('postalCode')" :clearable="true" id="zip" v-model="physicalAddress.postalCode"/>
            </div>
            <v-card 
                style="margin-top: -20px; overflow-y: scroll; z-index: initial"
                :loading="isLoading">
                <v-list 
                    v-if="isLoading || (foundAddresses && foundAddresses.length > 0)" 
                    lines="two"
                    @click:select="selectAddress">
                    <v-list-subheader>{{ $ct('results') }}</v-list-subheader>
                    <v-list-item
                        v-for="address in foundAddresses"    
                        :value="address.id" 
                        :key="address.id" 
                        :title="address.description" 
                        :subtitle="getFormattedAddress(address)"
                    ></v-list-item>
                </v-list>                    
                <v-list v-else>
                    <v-list-subheader>{{ $ct('noAddressFound') }}</v-list-subheader>
                </v-list>
            </v-card>
            <v-alert
                v-if="incompleteSearchCriterias && !isLoading && foundAddresses.length == 0" 
                :text="$ct('incompleteCriteria')"
                :title="$ct('noResultTitle')"
                type="info"
                class=""
            ></v-alert>  
            <v-alert
                v-if="!incompleteSearchCriterias && !isLoading && foundAddresses.length == 0" 
                :title="$ct('createPlaceTitle')"
                type="info"
                class=""
            >
                <template v-slot:default>
                    <p>{{ $ct('createPlaceQuestion') }}</p>
                    <p>{{ $ct('createPlaceDescription') }}<a target="_blank" href="https://www.openstreetmap.org">Open Street Map</a> {{ $ct('createPlaceDescriptionEnd') }}</p>
                </template>
            </v-alert>      
            <v-btn color="" prepend-icon="mdi-close" @click="toggleShow">{{ $ct('cancel') }}</v-btn>
            <v-btn @click="validate" prepend-icon="mdi-check" color="success">{{ $ct('validate') }}</v-btn>                                           
        </div>
    </v-overlay>    
</template>