<script setup>
import { computed, ref } from 'vue'
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
        maxCoverRatio.value = heightWidthRatio > maxCoverRatio.value ? heightWidthRatio : maxCoverRatio.value
    } 
    tempImage.src = src    
}

const getLinkOrJustName = (name, url) => url ? `<a href="${url}">${name}</a>` : name

const isValidSizeFile = file => file.size <= uploadLimits.value.banner

const setSelectedBanner = index => {

    selectedBannerTooBig.value = false

    if (index) {
        const image = banners.value[index]
        if (!isValidSizeFile(image.file)) {
            selectedBannerTooBig.value = true
            return
        }
    }
    selectedBannerId.value = index
}

const setUploadedImage = async e => {

    const files = e.target.files
    const file = files.length > 0 ? files[0] : null
    
    if (file) {
        uploadedBannerTooBig.value = false
        
        if (!isValidSizeFile(file)) {
            uploadedBannerTooBig.value = true
            store.dispatch('submitErrorFromText', `L'image est trop lourde (max ${convertBytesToMegabytes(uploadLimits.value.banner) } Mo)`)
            e.target.value = ""
            return
        }
        const uploadedImage = { file }
        try {
            const dataUrl = await blobToDataUrl(file)
            uploadedImage.src = dataUrl
            updateMaxCoveratio(dataUrl)
            banners.value.push(uploadedImage)
            selectedBannerId.value = banners.value.length - 1
        } catch (e) {
            console.error('Erreur lors de la conversion de l\'image en base 64')
        }
    }
}

const getSelectedBanner = () => selectedBannerId.value !== null ?
    banners.value[selectedBannerId.value] :
    null

const updateCoords = (coords, zoom = null) => {
    longitude.value = parseFloat(coords.longitude)
    latitude.value = parseFloat(coords.latitude)
}

const openCoverUpload = () => {
  uploadCoverInput.value?.click()
}



const submit = async action => {
    
    isDraft.value = action === 'submitAsDraft'

    const banner = getSelectedBanner()
    const data = {
        draft: isDraft.value,
        banner: banner ? banner.file : null,
        startDate: new Date(mergeDateTime(startDate.value, startTime.value) * 1000).toJSON(),
        endDate: hasEndDate.value ? new Date(mergeDateTime(endDate.value, endTime.value) * 1000).toJSON() : null,
        title: title.value,
        description: description.value.replaceAll('\n', '</br>'),
        url: url.value,
        physicalAddress: { ...physicalAddress.value, geom: longitude.value ? `${longitude.value};${latitude.value}` : null },
        category: selectedCategory.value,
        ticketsUrl: ticketsUrl.value
    }

    await store.dispatch('saveMobilizonEvent', data)
    const uuid = store.getters.getMobilizonEventUUID
    
    if (uuid) {
        router.push('/done')
    }
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
const altCoords = ref(null)
const searchAddressString = ref("")
const isLoadingGeolocation = ref(false)
const uploadCoverInput = ref(null)
const searchAddressFromStringOverlay = ref(false)
const locateFromMapOverlay = ref(false)
const validateMapLocationDialog = ref(false)
const searchAddressFromCoordsOverlay = ref(false)

/* Get initial event data either from scrapped data or from saved event */
const scrapped = store.getters.getScrappedData
const banners = ref(null)
const ticketsUrl = ref(null)
const title = ref(null)
const description = ref(null)
const isDraft = ref(null)
const url = ref(null)
const selectedBannerId = ref(null) 
const selectedBannerTooBig = ref(false)
const maxCoverRatio = ref(0)
const selectedCategory = ref(null)
const startDate = ref(null)
const startTime = ref(null)
const endDate = ref(null)
const endTime = ref(null)
const hasEndDate = ref(null)
const uploadedBannerTooBig = ref(false)
const physicalAddress = ref({
    description: null,
    locality: null,
    postalCode: null,
    street: null,
    country: null
})
const latitude = ref(null)
const longitude = ref(null)
const mapCenter = computed(() => latitude.value && longitude.value ? [latitude.value, longitude.value] : null)

if (scrapped) {

    // Raw data
    const localPhysicalAddress = scrapped.metas.physicalAddress 
    const endTimestamp = scrapped.metas.endTimestamp
    const startTimestamp = scrapped.metas.startTimestamp
    banners.value = scrapped.images.map(url => ({ src: url, file: null }))
    ticketsUrl.value = scrapped.metas.ticketsUrl
    title.value = scrapped.metas.title
    description.value = scrapped.metas.description
    isDraft.value = false
    url.value = scrapped.metas.url
    physicalAddress.value.description = localPhysicalAddress.description
    physicalAddress.value.locality = localPhysicalAddress.locality
    physicalAddress.value.postalCode = localPhysicalAddress.postalCode
    physicalAddress.value.street = localPhysicalAddress.street
    physicalAddress.value.country = localPhysicalAddress.country
    
    let { hosts } = scrapped.metas

    // Data processed
    if (localPhysicalAddress.geom) {
        latitude.value = parseFloat(localPhysicalAddress.geom.split(';')[1])
        longitude.value = parseFloat(localPhysicalAddress.geom.split(';')[0])      
    }
    startDate.value = timestampToDate(startTimestamp)
    startTime.value = timestampToTime(startTimestamp)
    endDate.value = timestampToDate(endTimestamp)
    endTime.value = timestampToTime(endTimestamp)    
    hasEndDate.value = endTimestamp ? true : false    
    if (hosts && hosts.length > 0) {
        if (hosts.length == 1) {
            description.value += `<br><p>Organisé par ${getLinkOrJustName(hosts[0].name, hosts[0].url)}</p>`
        } else {
            description.value += `<br><p>Organisateurs :<ul>`
            hosts.forEach((host) => {
                description.value += `<li>${getLinkOrJustName(host.name, host.url)}</li>`
            })
            description.value += `</ul></p>`
        }
    }    

    // Init scrapped covers
    banners.value.map((image) => {
        image.file = dataURLtoFile(image.src)
        updateMaxCoveratio(image.src)
    })
    // Select first cover
    setSelectedBanner(0)
}

const updateTempCoords  = (coords, zoom) => {
    store.dispatch('searchAddressFromCoords', coords, zoom)
}


const useFoundAddress = (address) => {
    physicalAddress.value.description = address.description
    physicalAddress.value.locality = address.locality
    physicalAddress.value.postalCode = address.postalCode
    physicalAddress.value.street = address.street
    physicalAddress.value.country = address.country
    latitude.value = address.geom.split(';')[1]
    longitude.value = address.geom.split(';')[0]
    console.log("useFoundAddress", address, latitude.value, longitude.value);
    
    altCoords.value = null
    mapCenter.value = [latitude.value, longitude.value]
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
    longitude.value = coords.longitude
    latitude.value = coords.latitude    
    closeLocateFromMapOverlay()
    mapCenter.value = [latitude.value, longitude.value]
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



</script>

<template>
    <form @submit.prevent="">
        
        <v-alert
            text="Nous faisons de notre mieux pour récupérer les informations mais certaines données peuvent être manquantes ou erronées."
            title="Vérifiez les infos SVP !"
            type="warning"
            class="mb-5"
            :closable="true"
        ></v-alert> 

        <h1 class="text-subtitle-2 mb-3">Date et heure</h1>
        
        <v-text-field class="required" required label="Date de début" id="start-date" type="date" v-model="startDate" />
        
        <v-text-field class="required" required label="Heure de début" id="start-time" type="time" v-model="startTime" />
        
        <v-checkbox label="L'événement a une date de fin" v-model="hasEndDate" id="has-end-date"></v-checkbox>

        <div v-if="hasEndDate">
            <v-text-field label="Date de fin" id="end-date" type="date" v-model="endDate"  />            
            <v-text-field label="Heure de fin" id="end-time" type="time" v-model="endTime"  />    
        </div>

        <h1 class="text-subtitle-2 mb-3">Image d'en-tête</h1>

        <v-carousel
            class="mb-5"
            selected-class="cover-selected"
            :show-arrows="banners.length > 1"
            :model-value="selectedBannerId"
            :height="`calc(100% * ${maxCoverRatio})`"
            :hide-delimiter-background="true"
            :hide-delimiters="true"
            :continuous="false"
        >
            <v-carousel-item
                v-for="(image, index) in banners"
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

        <v-text-field class="required" label="Titre" required id="title" v-model="title"/>        
        
        <QuillEditor :upload-limit="uploadLimits.default" contentType="html" v-model:content="description" id="description"  theme="snow" />

        <v-text-field class="mt-5" label="Adresse web" type="url" v-model="url"/>
        
        <v-text-field class="" label="Adresse web de la billetterie" type="url" v-model="ticketsUrl"/>
        
        <v-autocomplete
            :items="categories" 
            item-title="label" 
            item-value="id" 
            label="Catégorie" 
            v-model="selectedCategory"
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

        <div class="map mt-5" v-if="latitude && longitude">
            <Map 
                ref="map"
                @update-coords="updateCoords" 
                :coords="[ latitude, longitude ]" 
                :center="mapCenter"
                :alt-coords="altCoords"
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

        <!-- <v-checkbox class="mt-5" label="Enregistrer en tant que brouillon" v-model="isDraft" id="is-draft"></v-checkbox> -->
        <br/>
        
        <v-btn 
            class="mt-5 mr-5" 
            color="success" 
            type="submit"
            :loading="store.getters.isSavingEvent"
            @click="submit('submit')"
        >Enregistrer</v-btn>

        <v-btn 
            class="mt-5" 
            color="info" 
            type="submit"
            :loading="store.getters.isSavingEvent"
            @click="submit('submitAsDraft')"
        >Enregistrer comme brouillon</v-btn>

        
    </form>
</template>