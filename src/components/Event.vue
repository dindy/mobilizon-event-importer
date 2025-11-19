<script setup>
import { computed, ref, onMounted, watch, useTemplateRef } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import { convertBytesToMegabytes } from '../utils/utils';
import QuillEditor from './QuillEditor.vue'
import Map from './Map.vue'

const router = useRouter()
const store = useStore()
store.dispatch('setPageTitle', 'Détails de l\'événement')

const defaultMapCenter = [43.63421932550079, -1.1998593807220461] // Pey mon village <3
const scrapped = store.getters.getScrappedData
const banners = ref(scrapped.images.map(url => ({ src: url, file: null })))
let maxCoverRatio = ref(0)
const updateMaxCoveratio = src => {
    const tempImage = new Image
    tempImage.onload = () => {
        const heightWidthRatio = tempImage.height / tempImage.width
        maxCoverRatio.value = heightWidthRatio > maxCoverRatio.value ? heightWidthRatio : maxCoverRatio.value
    } 
    tempImage.src = src    
}
onMounted(() => {

    // Init scrapped covers
    banners.value.map((image) => {
        image.file = dataURLtoFile(image.src)
        updateMaxCoveratio(image.src)
    })
    // Select first cover
    setSelectedBanner(0)

})

let { hosts } = scrapped.metas

const ticketsUrl = ref(scrapped.metas.ticketsUrl)
const endTimestamp = ref(scrapped.metas.endTimestamp)
const startTimestamp = ref(scrapped.metas.startTimestamp)
const title = ref(scrapped.metas.title)
const description = ref(scrapped.metas.description)

const url = ref(scrapped.metas.url)
const physicalAddress = ref(scrapped.metas.physicalAddress)

const isLoadingAdressesFromCoords = computed(() => store.getters.isLoadingAdressesFromCoords)
const isLoadingAdressesFromString = computed(() => store.getters.isLoadingAddressesFromString)
const foundAddressesFromCoords = computed(() => store.getters.getAddressesFromCoords)
const foundAddressesFromString = computed(() => store.getters.getAddressesFromString)
const categories = computed(() => store.getters.getEventCategories)
const uploadLimits = computed(() => store.getters.getUploadLimits)
const uploadedCover = ref(null)
const selectedCategory = ref(null)
const groupAddress = computed(() => store.getters.getSelectedGroupAddress)

const getLinkOrJustName = (name, url) => url ? `<a href="${url}">${name}</a>` : name

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

// Merge date and time into ISO string (local timezone)
function mergeDateTime(date, time) {
  if (!date) return ''
  const t = time || '00:00'
  // Create a Date object in local time
  const [year, month, day] = date.split('-')
  const [hour, minute] = t.split(':')
  const localDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  )
  // Store as seconds since epoch (local time)
  return Math.floor(localDate.getTime() / 1000)
}

const dateGetter = ts => {
    if (!ts) return ''
    const date = new Date(ts * 1000).toLocaleDateString([], {timeZone: "Europe/Paris"})
    const year = date.substring(6, 10)
    const month = date.substring(3, 5)
    const day = date.substring(0, 2)
    return `${year}-${month}-${day}` 
}
const timeGetter = ts => ts ? new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''

const startDate = ref(dateGetter(startTimestamp.value))
const startTime = ref(timeGetter(startTimestamp.value))
const endDate = ref(dateGetter(endTimestamp.value))
const endTime = ref(timeGetter(endTimestamp.value))

const latitude = computed({
    get: () => physicalAddress.value.geom ? parseFloat(physicalAddress.value.geom.split(';')[1]) : '',
    set: (val) => physicalAddress.value.geom = `${longitude.value};${val}`
})

const longitude = computed({
    get: () => physicalAddress.value.geom ? parseFloat(physicalAddress.value.geom.split(';')[0]) : '',
    set: (val) => physicalAddress.value.geom = `${val};${latitude.value}`
})

const hasEndDate = ref(endTimestamp.value ? true : false)

const toolbarOptions = ref(
    [
        ['bold', 'italic', 'underline', 'strike'],
        ['link', 'image', 'video'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }]
    ]
)

const blobToDataUrl = blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)    
})

const uploadedBannerTooBig = ref(false)

const setUploadedImage = async e => {

    const files = e.target.files
    const file = files.length > 0 ? files[0] : null
    
    if (file) {
        uploadedBannerTooBig.value = false
        
        if (!isValidSizeFile(file)) {
            uploadedBannerTooBig.value = true
            store.dispatch('createErrorFromText', `L'image est trop lourde (max ${convertBytesToMegabytes(uploadLimits.value.banner) } Mo)`)
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

const imageUrlToFile = async url => {
    const response = await fetch(url)
    const blob = await response.blob()
    // Try to get filename from URL
    const urlFilename = url.split('/').pop() || 'image'
    // Robust regexp to extract extension (e.g. .jpg, .jpeg, .png, .webp, .gif, .svg, .tiff, .bmp, .ico)
    const extMatch = urlFilename.match(/\.(jpe?g|png|webp|gif|svg|tiff?|bmp|ico)(?=$|\?)/i)
    let ext = extMatch ? extMatch[0] : ''
    // Try to get extension from Content-Type header if not found in filename
    if (!ext) {
        const contentType = response.headers.get('Content-Type')
        if (contentType && contentType.startsWith('image/')) {
            ext = '.' + contentType.split('/')[1].split(';')[0]
        } else if (blob.type && blob.type.startsWith('image/')) {
            ext = '.' + blob.type.split('/')[1]
        } else {
            ext = '.png'
        }
    }
    const filename = 'header' + ext
    
    return new File([blob], filename, {
        type: blob.type
    })
}

function dataURLtoFile(dataUrl) {
    var arr = dataUrl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    const filename = 'image.' + dataUrl.substring("data:image/".length, dataUrl.indexOf(";base64"))
    
    return new File([u8arr], filename, {type:mime});
}

const isValidSizeFile = file => file.size <= uploadLimits.value.banner

const getSelectedBanner = () => selectedBannerId.value !== null ? banners.value[selectedBannerId.value] : null

const selectedBannerId = ref(null) 

const selectedBannerTooBig = ref(false)

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

const toggleSelectBanner = e => {
    setSelectedBanner(e)
}

const updateCoords = (coords, zoom) => {
    longitude.value = coords.lng
    latitude.value = coords.lat
    // store.dispatch('searchAddressFromCoords', coords, zoom)
}

const tempLongitude = ref(null)
const tempLatitude = ref(null)

const updateTempCoords  = (coords, zoom) => {
    tempLongitude.value = coords.lng
    tempLatitude.value = coords.lat
    store.dispatch('searchAddressFromCoords', coords, zoom)
}

const mapCenter = ref(latitude.value && longitude.value ? [latitude.value, longitude.value] : defaultMapCenter)

const showPosition = (e) => {
    const address = store.getters.getAddressFromCoordsById(e.originalTarget.value)    
    altCoords.value = [address.geom.split(';')[1], address.geom.split(';')[0]]    
}

const selectedFoundAddress = ref("")

const altCoords = ref(null)

const useFoundAddress = (address) => {
    physicalAddress.value.description = address.description
    physicalAddress.value.locality = address.locality
    physicalAddress.value.postalCode = address.postalCode
    physicalAddress.value.street = address.street
    physicalAddress.value.country = address.country
    latitude.value = address.geom.split(';')[1]
    longitude.value = address.geom.split(';')[0]
    tempLatitude.value = latitude.value
    tempLongitude.value = longitude.value
    altCoords.value = null
    mapCenter.value = [physicalAddress.value.geom.split(';')[1], physicalAddress.value.geom.split(';')[0]]
}
const submit = async e => {

    const banner = getSelectedBanner()
    const data = {
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

const getFormattedAddress = (address) => {
    const hasPostalCode = address.postalCode && address.postalCode.trim() != '' 
    const hasLocality = address.locality && address.locality.trim() != ''
    const region = address.region && address.region.trim() !== '' ? address.region : null
    const locality = hasPostalCode && hasLocality ? 
        `${address.postalCode} ${address.locality}` :
        hasPostalCode ? address.postalCode :
        hasLocality ? address.locality :
        null
    const description = address.description && address.description.trim() != '' ? address.description : null
    const street = address.street && address.street.trim() != '' ? address.street : null
    let elements = [street,locality,region].filter(el => el)
    if (description && description !== street) {
        elements.unshift(description)
    }

    return elements.join(', ')
}

const searchAddressString = ref("")

const searchAddress = () => {
    const searchAddressString = getFormattedAddress(physicalAddress.value)
    store.commit('clearAddressesFromString')
    store.dispatch('searchAddressFromString', searchAddressString)
    
}
const uploadCoverInput = ref(null)
const openCoverUpload = () => {
  uploadCoverInput.value?.click()
}

const searchAddressFromStringOverlay = ref(false)
const toggleSearchAddressFromStringOverlay = () => {    
    searchAddressFromStringOverlay.value = !searchAddressFromStringOverlay.value
    if (searchAddressFromStringOverlay.value) {
        store.commit('clearAddressesFromString') 
        searchAddressString.value = getFormattedAddress(physicalAddress.value)
        searchAddress()
    }
}

const locateFromMapOverlay = ref(false)
const openLocateFromMapOverlay = () => {
    tempLatitude.value = latitude.value
    tempLongitude.value = longitude.value
    locateFromMapOverlay.value = true
}
const closeLocateFromMapOverlay = () => {
    locateFromMapOverlay.value = false
    // mapCenter.value = [physicalAddress.value.geom.split(';')[1], physicalAddress.value.geom.split(';')[0]] 

}
const toggleLocateFromMapOverlay = () => {    
    if (locateFromMapOverlay.value) {
        closeLocateFromMapOverlay()
    } else {
        openLocateFromMapOverlay()
    }
}
const validateMapLocationDialog = ref(false)

const validateMapLocation = () => {
    longitude.value = tempLongitude.value
    latitude.value = tempLatitude.value    
    closeLocateFromMapOverlay()
    mapCenter.value = [physicalAddress.value.geom.split(';')[1], physicalAddress.value.geom.split(';')[0]]
    validateMapLocationDialog.value = true
    store.dispatch('searchAddressFromCoords', { lng: longitude.value, lat: latitude.value })
}

const acceptSearchAddressFromCoordsOverlay = () => {
    searchAddressFromCoordsOverlay.value = true
    validateMapLocationDialog.value = false
} 

const searchAddressFromCoordsOverlay = ref(false)
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

const goBackToMap = () => {
    searchAddressFromCoordsOverlay.value = false
    openLocateFromMapOverlay()
}

const selectFoundAddressFromString = (e) => {
    const address = store.getters.getAddressFromStringById(e.id)
    useFoundAddress(address)
    // mapCenter.value = [latitude.value, longitude.value] 
    searchAddressFromStringOverlay.value = false
    store.dispatch('searchAddressFromCoords', { lng: longitude.value, lat: latitude.value })
}

const selectFoundAddressFromCoords = (e) => {
    const address = store.getters.getAddressFromCoordsById(e.id)
    useFoundAddress(address)
    // mapCenter.value = [latitude.value, longitude.value] 
    searchAddressFromCoordsOverlay.value = false   
    searchAddressFromStringOverlay.value = false 
}
const address = computed(() => getFormattedAddress(physicalAddress.value).split(', ').join('\n'))

const hasAddress = computed(() => getFormattedAddress(physicalAddress.value) && getFormattedAddress(physicalAddress.value) !== '')

const isLoadingGeolocation = ref(false)
const geolocateUser = () => {
    if ("geolocation" in navigator) {
        isLoadingGeolocation.value = true
        navigator.geolocation.getCurrentPosition((position) => {
            isLoadingGeolocation.value = false
            tempLatitude.value = position.coords.latitude
            tempLongitude.value = position.coords.longitude
            mapCenter.value = [tempLatitude.value, tempLongitude.value]
        }, (e) => {
            isLoadingGeolocation.value = false            
            store.dispatch('createErrorFromText', e.message)
        });        
    }    
}

const incompleteSearchCriterias = computed(() => {
    const pc = physicalAddress.value.postalCode
    const locality = physicalAddress.value.locality
    
    return ((!pc || pc == '') && (!locality || locality == ''))
})

const useGroupAddress = () => {
    toggleSearchAddressFromStringOverlay()
    useFoundAddress(groupAddress.value)
}

</script>

<template>
    <form @submit.prevent="submit">
        
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
        
        <QuillEditor :upload-limit="uploadLimits.default" contentType="html" v-model:content="description" id="description" :toolbar="toolbarOptions" theme="snow" />

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

        <v-overlay 
            scrim="white" 
            opacity="1" 
            :close-on-content-click="false" 
            v-model="searchAddressFromStringOverlay" 
            scroll-strategy="block"
            content-class="overlay-content-wrapper"
            class="screen-overlay"
        >
            <div class="overlay-content">
                <v-btn color="secondary" prepend-icon="mdi-close" @click="toggleSearchAddressFromStringOverlay">Fermer</v-btn>
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
                    :loading="isLoadingAdressesFromString">
                    <v-list 
                        v-if="isLoadingAdressesFromString || (foundAddressesFromString && foundAddressesFromString.length > 0)" 
                        lines="two"
                        @click:select="selectFoundAddressFromString">
                        <v-list-subheader>Résultats</v-list-subheader>
                        <v-list-item
                            v-for="address in foundAddressesFromString"    
                            :value="address.id" 
                            :key="address.id" 
                            :title="address.description" 
                            :subtitle="getFormattedAddress(address)"
                        ></v-list-item>
                    </v-list>                    
                    <v-list v-else>
                        <!-- <v-list-subheader v-if="isLoadingAdressesFromString">Recherche en cours</v-list-subheader> -->
                        <v-list-subheader>Aucune adresse trouvée</v-list-subheader>
                    </v-list>
                </v-card>
                <v-alert
                    v-if="incompleteSearchCriterias && !isLoadingAdressesFromString && foundAddressesFromString.length == 0" 
                    text="Indiquez une ville ou un code postal pour améliorer la recherche."
                    title="Pas de résultat"
                    type="info"
                    class=""
                ></v-alert>  
                <v-alert
                    v-if="!incompleteSearchCriterias && !isLoadingAdressesFromString && foundAddressesFromString.length == 0" 
                    title="Créez le lieu"
                    type="info"
                    class=""
                >
                    <template v-slot:default>
                        <p>Vous ne trouvez pas votre lieu ? </p>
                        <p>Créez le sur <a target="_blank" href="https://www.openstreetmap.org">Open Street Map</a> pour le rendre visible ici et pour des millions d'utilisateurs !</p>
                    </template>
                </v-alert>                                     
            </div>
        </v-overlay>

        <v-overlay 
            class="screen-overlay"
            scrim="white" 
            opacity="1" 
            :close-on-content-click="false" 
            v-model="locateFromMapOverlay" 
            scroll-strategy="block"
            content-class="overlay-content-wrapper"
        >
            <div class="overlay-content">
                <v-btn color="secondary" prepend-icon="mdi-close" @click="toggleLocateFromMapOverlay">Fermer</v-btn>
                <!-- <v-btn prepend-icon="mdi-magnify" @click="toggleSearchAddressFromStringOverlay">Centrer sur un lieu</v-btn>   -->
                <v-btn 
                    :loading="isLoadingGeolocation" 
                    prepend-icon="mdi-crosshairs-gps" 
                    @click="geolocateUser"
                >Me géolocaliser</v-btn>                
                <div class="map-select">
                    <Map 
                        ref="map2"
                        @update-coords="updateTempCoords" 
                        :coords="[ tempLatitude, tempLongitude ]" 
                        :center="mapCenter"
                        :alt-coords="altCoords"
                        :zoom="15"
                        :canUpdateCoords="true"
                    />         
                </div>              
                <div class="map-select-caption text-caption font-italic">Cliquez sur la carte ou glissez-déposez le marqueur pour modifier la position.</div>       
                <v-btn 
                    @click="validateMapLocation" 
                    prepend-icon="mdi-check" 
                    color="primary"
                >Valider</v-btn>
            </div>
        </v-overlay>

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

        <v-overlay 
            scrim="white" 
            opacity="1" 
            :close-on-content-click="false" 
            v-model="searchAddressFromCoordsOverlay" 
            scroll-strategy="block"
            content-class="overlay-content-wrapper"
            class="screen-overlay"
        >
            <div class="overlay-content">
                <v-btn color="secondary" prepend-icon="mdi-close" @click="toggleSearchAddressFromCoordsOverlay">Fermer</v-btn>

                <!-- <v-btn prepend-icon="mdi-map-marker" @click="goBackToMap">Modifier la position</v-btn> -->

                <v-card style="overflow-y: scroll; z-index: initial">
                    <v-list 
                        v-if="!isLoadingAdressesFromCoords && foundAddressesFromCoords && foundAddressesFromCoords.length > 0" 
                        lines="two"
                        @click:select="selectFoundAddressFromCoords">
                        <v-list-subheader>Addresses à proximité de la position</v-list-subheader>
                        <v-list-item
                            v-for="address in foundAddressesFromCoords"    
                            :value="address.id" 
                            :key="address.id" 
                            :title="address.description" 
                            :subtitle="getFormattedAddress(address)"
                        ></v-list-item>
                    </v-list>
                    <v-list v-else>
                        <v-list-subheader v-if="isLoadingAdressesFromCoords">Recherche en cours</v-list-subheader>
                        <v-list-subheader v-else>Aucun résultat</v-list-subheader>
                    </v-list>
                </v-card>
            </div>
        </v-overlay>

        <v-btn 
            class="mt-5" 
            color="success" 
            type="submit"
            :loading="store.getters.isSavingEvent"
            style="display: block;"
        >Enregistrer</v-btn>
    </form>
</template>