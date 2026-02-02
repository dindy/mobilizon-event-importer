<script setup>
import { computed, ref, onMounted } from 'vue'
import { componentTranslate } from '../i18n/utils.js'
import { getFormattedAddress } from '../utils/utils'

const $ct = componentTranslate('SearchAddressFromCoordsOverlay')

const emit = defineEmits('toggleShow', 'select-address-by-id')
const props = defineProps({
    show: Boolean,
    isLoading: Boolean,
    foundAddresses: Array,
})

const isOpen = computed(() => {
    return props.show
})

const toggleShow = () => emit('toggleShow')

const selectAddress = e => emit('selectAddressById', e.id)
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
            <v-card style="overflow-y: scroll; z-index: initial">
                <v-list 
                    v-if="!isLoading && foundAddresses && foundAddresses.length > 0" 
                    lines="two"
                    @click:select="selectAddress">
                    <v-list-subheader>{{ $ct('nearbyAddresses') }}</v-list-subheader>
                    <v-list-item
                        v-for="address in foundAddresses"    
                        :value="address.id" 
                        :key="address.id" 
                        :title="address.description" 
                        :subtitle="getFormattedAddress(address)"
                    ></v-list-item>
                </v-list>
                <v-list v-else>
                    <v-list-subheader v-if="isLoading">{{ $ct('searching') }}</v-list-subheader>
                    <v-list-subheader v-else>{{ $ct('noResults') }}</v-list-subheader>
                </v-list>
            </v-card>
            <v-btn class="float-right" color="" prepend-icon="mdi-close" @click="toggleShow">{{ $ct('close') }}</v-btn>
        </div>
    </v-overlay>    
</template>