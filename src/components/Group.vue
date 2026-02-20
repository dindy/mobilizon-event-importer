<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import { componentTranslate } from '../i18n/utils.js'
import QuillEditor from './QuillEditor.vue'
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
    if (scrapped.physicalAddress?.geom) {
        group.value.latitude = parseFloat(scrapped.physicalAddress.geom.split(';')[1])
        group.value.longitude = parseFloat(scrapped.physicalAddress.geom.split(';')[0])
    } else {
        group.value.latitude = null
        group.value.longitude = null
    }
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
        store.dispatch('createErrorFromText', $ct('formErrors'))
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
            :text="$ct('checkInfoText')"
            :title="$ct('checkInfo')"
            type="info"
            :closable="true"
        ></v-alert> 
        
        <h1 class="text-subtitle-2">{{ $ct('banner') }}</h1>
        
        <v-alert
            v-if="!getSelectedBanner()"
            :text="$ct('noCoverImageText')"
            :title="$ct('noCoverImage')"
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
            :text="$ct('noLogoText')"
            :title="$ct('noLogo')"
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

        <h1 class="text-subtitle-2">{{ $ct('nameSection') }}</h1>

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