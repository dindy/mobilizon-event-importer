<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import { componentTranslate } from '../i18n/utils.js'
import QuillEditor from './QuillEditor.vue'
import Map from './Map.vue'
import SearchAddressFromStringOverlay from './SearchAddressFromStringOverlay.vue'
import SearchAddressFromCoordsOverlay from './SearchAddressFromCoordsOverlay.vue'
import LocateFromMapOverlay from './LocateFromMapOverlay.vue'
import ImageSelect from './ImageSelect.vue'
import LocationSelect from './LocationSelect.vue'
import { hasSpecialCharOrNotUnderscore, removeSpecialChar, removeDiacritics } from '../utils/utils'

const router = useRouter()
const store = useStore()
const $ct = componentTranslate('Group')

store.dispatch('setPageTitle', $ct('title'))

const scrapped = store.getters.getScrappedGroup
const uploadLimits = computed(() => store.getters.getUploadLimits)
const form = ref()

const group = ref({
    url: null,
    name: null,
    federatedName: null,
    description: null,
    banners: null,
    logos: null,
    physicalAddress: {
        description: null,
        locality: null,
        postalCode: null,
        street: null,
        country: null
    },    
    latitude: null,
    longitude: null,     
    selectedBannerId: null,      
    selectedLogoId: null,      
})

if (scrapped) {
    group.value.url = scrapped.url
    group.value.name = scrapped.name
    group.value.description = scrapped.description
    group.value.banners = scrapped.banners.map(url => ({ src: url, file: null }))
    group.value.logos = scrapped.logos.map(url => ({ src: url, file: null }))
    group.value.longitude = scrapped.longitude
    group.value.latitude = scrapped.latitude
    if (scrapped.physicalAddress) {
        group.value.physicalAddress.description = scrapped.physicalAddress.description
        group.value.physicalAddress.street = scrapped.physicalAddress.street
        group.value.physicalAddress.postalCode = scrapped.physicalAddress.postalCode
        group.value.physicalAddress.locality = scrapped.physicalAddress.locality
        group.value.physicalAddress.country = scrapped.physicalAddress.country
    }
    group.value.federatedName = scrapped.name ? removeSpecialChar(removeDiacritics(scrapped.name.toLowerCase())) : null
    console.log(group.value);
}

const setSelectedBanner = index => {
    group.value.selectedBannerId = index
}

const getSelectedBanner = () => group.value.selectedBannerId !== null ?
    group.value.banners[group.value.selectedBannerId] :
    null

const setSelectedLogo = index => {
    group.value.selectedLogoId = index
}

const getSelectedLogo = () => group.value.selectedLogoId !== null ?
    group.value.logos[group.value.selectedLogoId] :
    null

const rules = {
    notEmpty: value => (value && value !== '') || $ct('emptyField'),
    nameLength: value => value.length <= 200 || $ct('nameLength'),
    federatedName: value => !hasSpecialCharOrNotUnderscore(value) || $ct('invalidFederatedName')
}

const dispatchError = (error) => {
    store.dispatch('createErrorFromText', error)
}

const getInstanceHostname = () => `@${(new URL(store.getters.getMobilizonInstanceUrl)).hostname}`

const useFoundAddress = (address) => {
    group.value.physicalAddress = address
}

const updateCoords = (coords, zoom = null) => {
    group.value.longitude = parseFloat(coords.longitude)
    group.value.latitude = parseFloat(coords.latitude)
}

const cancel = () => {
    store.dispatch('resetGroupScrapperData')
    store.dispatch('navigateTo', '/scrapEvent')
}

const submit = async () => {
    const logo = getSelectedLogo()
    const banner = getSelectedBanner()

    const data = {
        name: group.value.name,
        federatedName: group.value.federatedName,
        description: group.value.description.replaceAll('\n', '</br>'),
        physicalAddress: {
            ...group.value.physicalAddress,
            geom: group.value.longitude ?
                `${group.value.longitude};${group.value.latitude}` : null
        },
        banner: banner ? banner.file : null,
        logo: logo ? logo.file : null,
    }

    const { valid } = await form.value.validate()

    if (!valid) {
        store.dispatch('createErrorFromText', $ct('formErrors') || 'Le formulaire comporte des erreurs. Merci de vérifier les données.')
        return
    }

    await store.dispatch('saveMobilizonGroup', data)

    store.dispatch('navigateBack')
    store.dispatch('navigateBack')
}
</script>
<template>
    <v-form class="form" ref="form" validate-on="input eager" @submit.prevent="">
        <v-alert
            :text="$ct('checkInfoText') || 'Nous faisons de notre mieux pour récupérer les informations mais certaines données peuvent être manquantes ou erronées.'"
            :title="$ct('checkInfo') || 'Vérifiez les infos SVP !'"
            type="info"
            :closable="true"
        ></v-alert> 
        
        <h1 class="text-subtitle-2">{{ $ct('banner') }}</h1>
        
        <v-alert
            v-if="!getSelectedBanner()"
            :text="$ct('noCoverImageText') || 'Aucune image de couverture n\'a été trouvée. Vous pouvez en téléverser une vous-même.'"
            :title="$ct('noCoverImage') || 'Pas de d\'image de couverture'"
            type="warning"
        />

        <ImageSelect
            :maxSize="uploadLimits.banner"
            :images="group.banners"
            :selected="group.selectedBannerId"
            :upload-button-label="$ct('uploadButton')"
            @display-error="dispatchError"
            @set-selected-image-index="setSelectedBanner"
        />        

        <h1 class="text-subtitle-2">{{ $ct('logo') }}</h1>

        <v-alert
            v-if="!getSelectedLogo()"
            text="Aucun logo n'a été trouvé. Vous pouvez en téléverser un vous-même."
            title="Pas de logo"
            type="warning"
        />

        <ImageSelect
            :maxSize="uploadLimits.avatar"
            :images="group.logos"
            :selected="group.selectedLogoId"
            :upload-button-label="$ct('uploadButton')"
            @display-error="dispatchError"
            @set-selected-image-index="setSelectedLogo"
        />  

        <h1 class="text-subtitle-2">Nom</h1>

        <v-text-field :rules="[rules.notEmpty, rules.nameLength]" class="required" :label="$ct('name_label')" required id="name" v-model="group.name"/>    
        
        <v-text-field :rules="[rules.notEmpty, rules.federatedName]" class="required" :label="$ct('federatedName_label')" required id="federatedName" v-model="group.federatedName" :suffix="getInstanceHostname()" />   

        <h1 class="text-subtitle-2">{{ $ct('description') }}</h1>
        
        <div>
            <QuillEditor :upload-limit="uploadLimits.default" contentType="html" v-model:content="group.description" id="description" theme="snow" />
        </div>
        
        <h1 class="text-subtitle-2">{{ $ct('location') }}</h1>
        
        <LocationSelect 
            :address="group.physicalAddress"
            :longitude="group.longitude"
            :latitude="group.latitude"
            @selectAddress="useFoundAddress"
            @selectCoords="updateCoords"
        />     
        
        <div>
            <v-btn 
                class="mr-5" 
                color="success" 
                type="submit"
                :loading="store.getters.isSavingGroup"
                @click="submit('submit')"
            >{{ $ct('submit') }}</v-btn>
        
            <v-btn 
                class="" 
                color="warning" 
                @click="cancel"
            >{{ $ct('cancel') }}</v-btn>    
        </div>
    </v-form>
    

</template>

<style>
.form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>