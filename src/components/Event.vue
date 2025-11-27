<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import { convertBytesToMegabytes, dataURLtoFile, mergeDateTime, timestampToDate, timestampToTime, blobToDataUrl, getFormattedAddress } from '../utils/utils'
import QuillEditor from './QuillEditor.vue'
import LocationSelect from './LocationSelect.vue'
import ImageSelect from './ImageSelect.vue'

const router = useRouter()
const store = useStore()
store.dispatch('setPageTitle', 'Détails de l\'événement')

const dispatchError = (error) => {
    store.dispatch('createErrorFromText', error)
}

const getLinkOrJustName = (name, url) => url ? `<a href="${url}">${name}</a>` : name

const setSelectedBanner = index => {
    event.value.selectedBannerId = index
}

const getSelectedBanner = () => event.value.selectedBannerId !== null ?
    event.value.banners[event.value.selectedBannerId] :
    null

const updateCoords = (coords, zoom = null) => {
    event.value.longitude = parseFloat(coords.longitude)
    event.value.latitude = parseFloat(coords.latitude)
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
    notEmpty: value => (value && value !== '') || 'Le champ ne doit pas être vide.',
    titleLength: value => value.length <= 200 || 'Le titre ne peut pas comporter plus de 200 caractères.'
}

const cancel = () => {
    store.dispatch('resetEvent')
    store.dispatch('resetEventScrapper')
    router.push('/scrapEvent')
}

/* Initialize default variables */
const uploadLimits = computed(() => store.getters.getUploadLimits)
const categories = computed(() => store.getters.getEventCategories)
const groupAddress = computed(() => store.getters.getSelectedGroupAddress)
const uploadedCover = ref(null)
const uploadCoverInput = ref(null)
const form = ref()

/* Get initial event data either from scrapped data or from saved event */
const scrapped = store.getters.getScrappedEvent
const saved = store.getters.getLocalEvent
const event = ref({
    banners: null,
    ticketsUrl: null,
    title: null,
    description: null,
    isDraft: false,
    url: null,
    selectedBannerId: null,
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
    
} else if (scrapped) {

    // Raw data
    const localPhysicalAddress = scrapped.metas.physicalAddress 
    const endTimestamp = scrapped.metas.endTimestamp
    const startTimestamp = scrapped.metas.startTimestamp
    event.value.banners = scrapped.images.map(url => ({ src: url, file: null }))
    event.value.ticketsUrl = scrapped.metas.ticketsUrl
    event.value.title = scrapped.metas.title ? scrapped.metas.title.substring(0, 200) : null
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

const useFoundAddress = (address) => {
    event.value.physicalAddress = address
}

</script>

<template>
    <v-form ref="form" validate-on="input eager" @submit.prevent="">
        
        <v-alert
            text="Nous faisons de notre mieux pour récupérer les informations mais certaines données peuvent être manquantes ou erronées."
            title="Vérifiez les infos SVP !"
            type="info"
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

        <v-alert
            v-if="!getSelectedBanner()"
            text="Aucune image de couverture n'a été trouvée. Vous pouvez en téléverser une vous-même."
            title="Pas de d'image de couverture"
            type="warning"
        />

        <ImageSelect
            :maxSize="uploadLimits.banner"
            :images="event.banners"
            :selected="event.selectedBannerId"
            upload-button-label="Téléverser"
            @display-error="dispatchError"
            @set-selected-image-index="setSelectedBanner"
        />

        <h1 class="text-subtitle-2 mt-5 mb-3">Description</h1>

        <v-text-field :rules="[rules.notEmpty, rules.titleLength]" class="required" label="Titre" required id="title" v-model="event.title"/>        
        
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

        <LocationSelect 
            :address="event.physicalAddress"
            :longitude="event.longitude"
            :latitude="event.latitude"
            :groupAddress="groupAddress"
            @selectAddress="useFoundAddress"
            @selectCoords="updateCoords"
        />
        
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