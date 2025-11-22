<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import { convertBytesToMegabytes, dataURLtoFile, mergeDateTime, timestampToDate, timestampToTime, blobToDataUrl, getFormattedAddress } from '../utils/utils';
import QuillEditor from './QuillEditor.vue'
import Map from './Map.vue'
import SearchAddressFromStringOverlay from './SearchAddressFromStringOverlay.vue'
import SearchAddressFromCoordsOverlay from './SearchAddressFromCoordsOverlay.vue'
import LocateFromMapOverlay from './LocateFromMapOverlay.vue'

const router = useRouter()
const store = useStore()
store.dispatch('setPageTitle', 'Détails de l\'événement')

/* Utils functions */

// Handle dimensions of cover carousel
const updateMaxCoveratio = src => {
    const tempImage = new Image
    tempImage.onload = () => {
        const heightWidthRatio = tempImage.height / tempImage.width
        event.value.maxCoverRatio = heightWidthRatio > event.value.maxCoverRatio ? heightWidthRatio : event.value.maxCoverRatio
    } 
    tempImage.src = src    
}

const getLinkOrJustName = (name, url) => url ? `<a href="${url}">${name}</a>` : name

const isValidSizeFile = file => file.size <= uploadLimits.value.banner

const setSelectedBanner = index => {

    event.value.selectedBannerTooBig = false

    if (index) {
        const image = event.value.banners[index]
        if (!isValidSizeFile(image.file)) {
            event.value.selectedBannerTooBig = true
            return
        }
    }
    event.value.selectedBannerId = index
}

const setUploadedImage = async e => {

    const files = e.target.files
    const file = files.length > 0 ? files[0] : null
    
    if (file) {
        event.value.uploadedBannerTooBig = false
        
        if (!isValidSizeFile(file)) {
            event.value.uploadedBannerTooBig = true
            store.dispatch('submitErrorFromText', `L'image est trop lourde (max ${convertBytesToMegabytes(uploadLimits.value.banner) } Mo)`)
            e.target.value = ""
            return
        }
        const uploadedImage = { file }
        try {
            const dataUrl = await blobToDataUrl(file)
            uploadedImage.src = dataUrl
            updateMaxCoveratio(dataUrl)
            event.value.banners.push(uploadedImage)
            event.value.selectedBannerId = event.value.banners.length - 1
        } catch (e) {
            console.error('Erreur lors de la conversion de l\'image en base 64')
        }
    }
}

const getSelectedBanner = () => event.value.selectedBannerId !== null ?
    event.value.banners[event.value.selectedBannerId] :
    null

const updateCoords = (coords, zoom = null) => {
    event.value.longitude = parseFloat(coords.longitude)
    event.value.latitude = parseFloat(coords.latitude)
}

const openCoverUpload = () => {
  uploadCoverInput.value?.click()
}

const submit = async action => {
    
    event.value.isDraft = action === 'submitAsDraft'

    const banner = getSelectedBanner()
    const data = {
        draft: event.value.isDraft,
        banner: banner ? banner.file : null,
        startDate: new Date(mergeDateTime(event.value.startDate, event.value.startTime) * 1000).toJSON(),
        endDate: event.value.hasEndDate && event.value.endDate ? new Date(mergeDateTime(event.value.endDate, event.value.endTime) * 1000).toJSON() : null,
        title: title.value,
        description: event.value.description.replaceAll('\n', '</br>'),
        url: event.value.url,
        physicalAddress: { ...event.value.physicalAddress, geom: event.value.longitude ? `${event.value.longitude};${event.value.latitude}` : null },
        category: event.value.selectedCategory,
        ticketsUrl: event.value.ticketsUrl
    }

    const { valid } = await form.value.validate()

    if (!valid) {
        store.dispatch('createErrorFromText', 'Le formulaire comporte des erreurs. Merci de vérifier les données.')
        return
    }

    await store.dispatch('saveMobilizonEvent', data)
    const uuid = store.getters.getMobilizonEventUUID
    
    if (uuid) {
        router.push('/done')
    }
}

const isStartDateSuperiorToEndDate = () => {

    if (event.value.hasEndDate) { 
        const startDate = new Date(mergeDateTime(event.value.startDate, event.value.startTime) * 1000)
        const endDate = new Date(mergeDateTime(event.value.endDate, event.value.endTime) * 1000)        
        return startDate > endDate
    }

    return false
}

const rules = {
    maxEndDate: value => {
        if (isStartDateSuperiorToEndDate()) {
            return event.value.startDate <= event.value.endDate || 'La date de début est supérieure à la date de fin.'
        }
        return true
    },
    maxEndTime: value => {
        if (isStartDateSuperiorToEndDate()) {
            if (event.value.startDate <= event.value.endDate) {
                return event.value.startTime <= event.value.endTime || 'L\'heure de début est supérieure à l\'heure de fin.'
            }
        }
        return true
    },
    notEmpty: value => (value && value !== '') || 'Le champ ne doit pas être vide.' 
}

const cancel = () => {
    store.dispatch('resetEvent')
    store.dispatch('resetScrapper')
    router.push('/scrap')
}

/* Initialize default variables */
const uploadLimits = computed(() => store.getters.getUploadLimits)
const isLoadingAdressesFromCoords = computed(() => store.getters.isLoadingAdressesFromCoords)
const isLoadingAdressesFromString = computed(() => store.getters.isLoadingAddressesFromString)
const foundAddressesFromCoords = computed(() => store.getters.getAddressesFromCoords)
const foundAddressesFromString = computed(() => store.getters.getAddressesFromString)
const categories = computed(() => store.getters.getEventCategories)
const groupAddress = computed(() => store.getters.getSelectedGroupAddress)
const uploadedCover = ref(null)
const searchAddressString = ref("")
const isLoadingGeolocation = ref(false)
const uploadCoverInput = ref(null)
const searchAddressFromStringOverlay = ref(false)
const locateFromMapOverlay = ref(false)
const validateMapLocationDialog = ref(false)
const searchAddressFromCoordsOverlay = ref(false)
const form = ref()

/* Get initial event data either from scrapped data or from saved event */
const scrapped = store.getters.getScrappedData
const saved = store.getters.getLocalEvent
const event = ref({
    banners: null,
    ticketsUrl: null,
    title: null,
    description: null,
    isDraft: false,
    url: null,
    selectedBannerId: null,
    selectedBannerTooBig: null,
    maxCoverRatio: 0,
    selectedCategory: null,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    hasEndDate: null,
    uploadedBannerTooBig: null,
    physicalAddress: {
        description: null,
        locality: null,
        postalCode: null,
        street: null,
        country: null
    },    
    latitude: null,
    longitude: null,    
})
const mapCenter = computed(() => event.value.latitude && event.value.longitude ? [event.value.latitude, event.value.longitude] : null)

watch(
    () => event,
    (event, prevEvent) => {
        if (form.value) {
            form.value.resetValidation()
            form.value.validate()
        }
        store.dispatch('saveLocalEvent', event.value)
    },
    {deep: true}
)

if (saved) {
    event.value = saved
    console.log(event.value);
    
} else if (scrapped) {

    // Raw data
    const localPhysicalAddress = scrapped.metas.physicalAddress 
    const endTimestamp = scrapped.metas.endTimestamp
    const startTimestamp = scrapped.metas.startTimestamp
    event.value.banners = scrapped.images.map(url => ({ src: url, file: null }))
    event.value.ticketsUrl = scrapped.metas.ticketsUrl
    event.value.title = scrapped.metas.title
    event.value.description = scrapped.metas.description
    event.value.url = scrapped.metas.url
    event.value.physicalAddress.description = localPhysicalAddress.description
    event.value.physicalAddress.locality = localPhysicalAddress.locality
    event.value.physicalAddress.postalCode = localPhysicalAddress.postalCode
    event.value.physicalAddress.street = localPhysicalAddress.street
    event.value.physicalAddress.country = localPhysicalAddress.country
    
    let { hosts } = scrapped.metas

    // Data processed
    if (localPhysicalAddress.geom) {
        event.value.latitude = parseFloat(localPhysicalAddress.geom.split(';')[1])
        event.value.longitude = parseFloat(localPhysicalAddress.geom.split(';')[0])      
    }
    event.value.startDate = timestampToDate(startTimestamp)
    event.value.startTime = timestampToTime(startTimestamp)
    event.value.endDate = timestampToDate(endTimestamp)
    event.value.endTime = timestampToTime(endTimestamp)    
    event.value.hasEndDate = endTimestamp ? true : false    
    if (hosts && hosts.length > 0) {
        if (hosts.length == 1) {
            event.value.description += `<br><p>Organisé par ${getLinkOrJustName(hosts[0].name, hosts[0].url)}</p>`
        } else {
            event.value.description += `<br><p>Organisateurs :<ul>`
            hosts.forEach((host) => {
                event.value.description += `<li>${getLinkOrJustName(host.name, host.url)}</li>`
            })
            event.value.description += `</ul></p>`
        }
    }    

    // Select first cover
    setSelectedBanner(0)
}

// Init scrapped covers
event.value.banners.map((image) => {
    image.file = dataURLtoFile(image.src)
    updateMaxCoveratio(image.src)
})

const updateTempCoords  = (coords, zoom) => {
    store.dispatch('searchAddressFromCoords', coords, zoom)
}

const useFoundAddress = (address) => {
    event.value.physicalAddress.description = address.description
    event.value.physicalAddress.locality = address.locality
    event.value.physicalAddress.postalCode = address.postalCode
    event.value.physicalAddress.street = address.street
    event.value.physicalAddress.country = address.country
    if (address.geom) {
        event.value.latitude = address.geom.split(';')[1]
        event.value.longitude = address.geom.split(';')[0]
    }
}

const searchAddress = (address) => {
    store.commit('clearAddressesFromString')
    store.dispatch('searchAddressFromString', getFormattedAddress(address))
}

const toggleSearchAddressFromStringOverlay = () => {    
    searchAddressFromStringOverlay.value = !searchAddressFromStringOverlay.value
    if (searchAddressFromStringOverlay.value) {
        store.commit('clearAddressesFromString') 
        searchAddressString.value = getFormattedAddress(event.value.physicalAddress)
        searchAddress(event.value.physicalAddress)
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
    event.value.longitude = coords.longitude
    event.value.latitude = coords.latitude    
    closeLocateFromMapOverlay()
    validateMapLocationDialog.value = true
    store.dispatch('searchAddressFromCoords', { lng: event.value.longitude, lat: event.value.latitude })
}

const acceptSearchAddressFromCoordsOverlay = () => {
    searchAddressFromCoordsOverlay.value = true
    validateMapLocationDialog.value = false
} 


const openSearchAddressFromCoordsOverlay = () => {
    searchAddressFromCoordsOverlay.value = true
    store.dispatch('searchAddressFromCoords', { lng: event.value.longitude, lat: event.value.latitude })
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
    store.dispatch('searchAddressFromCoords', { lng: event.value.longitude, lat: event.value.latitude })
}

const selectFoundAddressFromCoordsById = (id) => {
    const address = store.getters.getAddressFromCoordsById(id)
    useFoundAddress(address)
    searchAddressFromCoordsOverlay.value = false   
    searchAddressFromStringOverlay.value = false 
}

const address = computed(() => getFormattedAddress(event.value.physicalAddress).split(', ').join('\n'))

const hasAddress = computed(() => getFormattedAddress(event.value.physicalAddress) && getFormattedAddress(event.value.physicalAddress) !== '')

</script>

<template>
    <v-form ref="form" validate-on="input eager" @submit.prevent="">
        
        <v-alert
            text="Nous faisons de notre mieux pour récupérer les informations mais certaines données peuvent être manquantes ou erronées."
            title="Vérifiez les infos SVP !"
            type="warning"
            class="mb-5"
            :closable="true"
        ></v-alert> 

        <h1 class="text-subtitle-2 mb-3">Date et heure</h1>
        
        <v-text-field :rules="[rules.notEmpty]" class="required" required label="Date de début" id="start-date" type="date" v-model="event.startDate" />
        
        <v-text-field :rules="[rules.notEmpty]" class="required" required label="Heure de début" id="start-time" type="time" v-model="event.startTime" />
        
        <v-checkbox label="L'événement a une date de fin" v-model="event.hasEndDate" id="has-end-date"></v-checkbox>

        <div v-if="event.hasEndDate">
            <v-text-field :rules="[rules.maxEndDate]" label="Date de fin" id="end-date" type="date" v-model="event.endDate"  />            
            <v-text-field :rules="[rules.maxEndTime]" label="Heure de fin" id="end-time" type="time" v-model="event.endTime"  />    
        </div>

        <h1 class="text-subtitle-2 mb-3">Image d'en-tête</h1>

        <v-carousel
            class="mb-5"
            selected-class="cover-selected"
            :show-arrows="event.banners.length > 1"
            :model-value="event.selectedBannerId"
            :height="`calc(100% * ${event.maxCoverRatio})`"
            :hide-delimiter-background="true"
            :hide-delimiters="true"
            :continuous="false"
        >
            <v-carousel-item
                v-for="(image, index) in event.banners"
                :key="image.url"
                :value="index"
                :data-image-index="index" 
                :src="image.src"
                max-width="100%"
                max-height="100%"
            >
            </v-carousel-item>            
        </v-carousel>

        <v-btn class="" @click="openCoverUpload" prepend-icon="mdi-upload">Téléverser une image d'en-tête</v-btn>
        
        <input ref="uploadCoverInput" type="file" style="display: none;" v-on:change="setUploadedImage">

        <h1 class="text-subtitle-2 mt-5 mb-3">Description</h1>

        <v-text-field :rules="[rules.notEmpty]" class="required" label="Titre" required id="title" v-model="event.title"/>        
        
        <QuillEditor :upload-limit="uploadLimits.default" contentType="html" v-model:content="event.description" id="description"  theme="snow" />

        <v-text-field class="mt-5" label="Adresse web" type="url" v-model="event.url"/>
        
        <v-text-field class="" label="Adresse web de la billetterie" type="url" v-model="event.ticketsUrl"/>
        
        <v-autocomplete
            :items="categories" 
            item-title="label" 
            item-value="id" 
            label="Catégorie" 
            v-model="event.selectedCategory"
            :clearable="true"
            no-data-text="Aucun résultat correspondant"
        >
        </v-autocomplete>
        
        <h1 class="text-subtitle-2 mt-3 mb-3">Localisation</h1>

        <v-textarea 
            v-if="hasAddress" 
            class="mb-5" 
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
            class="mb-5"
        ></v-alert>        

        <v-btn prepend-icon="mdi-pencil" @click="toggleSearchAddressFromStringOverlay">Modifier l'adresse</v-btn>

        <div class="map mt-5" v-if="event.latitude && event.longitude">
            <Map 
                ref="map"
                @update-coords="updateCoords" 
                :coords="[ event.latitude, event.longitude ]" 
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
            class="mt-5"
        ></v-alert>          

        <v-btn class="mt-5" prepend-icon="mdi-map-marker" @click="toggleLocateFromMapOverlay">Modifier la position</v-btn>

        <SearchAddressFromStringOverlay 
            :show="searchAddressFromStringOverlay"
            :group-address="groupAddress"
            :physical-address="event.physicalAddress"
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
            :latitude="event.latitude"
            :longitude="event.longitude"
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

        <!-- <v-checkbox class="mt-5" label="Enregistrer en tant que brouillon" v-model="isDraft" id="is-draft"></v-checkbox> -->
        <br/>
        
        <div class="mt-5">

            <v-btn 
                class="mr-5 mb-5" 
                color="success" 
                type="submit"
                :loading="store.getters.isSavingEvent"
                @click="submit('submit')"
            >Enregistrer</v-btn>
    
            <v-btn 
                class="mr-5 mb-5" 
                color="info" 
                type="submit"
                :loading="store.getters.isSavingEvent"
                @click="submit('submitAsDraft')"
            >Enregistrer comme brouillon</v-btn>

            <v-btn 
                class="mb-5" 
                color="warning" 
                @click="cancel"
            >Annuler</v-btn>            
        </div>

        
    </v-form>
</template>