<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import { componentTranslate } from '../i18n/utils.js'
import { convertBytesToMegabytes, dataURLtoFile, mergeDateTime, timestampToDate, timestampToTime, blobToDataUrl, getFormattedAddress } from '../utils/utils'
import QuillEditor from './QuillEditor.vue'
import LocationSelect from './LocationSelect.vue'
import ImageSelect from './ImageSelect.vue'

const router = useRouter()
const store = useStore()
const $ct = componentTranslate('Event')

store.dispatch('setPageTitle', $ct('title'))

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
        store.dispatch('createErrorFromText', $ct('formErrors'))
        return
    }

    await store.dispatch('saveMobilizonEvent', data)
    const uuid = store.getters.getMobilizonEventUUID
    
    if (uuid) {
        store.dispatch('navigateTo', '/done')
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
            return event.value.startDate <= event.value.endDate || $ct('startDateSuperior')
        }
        return true
    },
    maxEndTime: value => {
        if (isStartDateSuperiorToEndDate()) {
            if (event.value.startDate <= event.value.endDate) {
                return event.value.startTime <= event.value.endTime || $ct('startTimeSuperior')
            }
        }
        return true
    },
    notEmpty: value => (value && value !== '') || $ct('emptyField'),
    titleLength: value => value.length <= 200 || $ct('titleTooLong')
}

const cancel = () => {
    store.dispatch('resetEvent')
    store.dispatch('resetEventScrapper')
    store.dispatch('navigateTo', '/scrapEvent')
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
            event.value.description += `<br><p>${$ct('organized_by')} ${getLinkOrJustName(hosts[0].name, hosts[0].url)}</p>`
        } else {
            event.value.description += `<br><p>${$ct('organized_by')} : <ul>`
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
            :text="$ct('checkInfoText')"
            :title="$ct('checkInfo')"
            type="info"
            class="mb-5"
            :closable="true"
        ></v-alert> 

        <h1 class="text-subtitle-2 mb-3">{{ $ct('dateAndTime') }}</h1>
        
        <v-text-field :rules="[rules.notEmpty]" class="required" required :label="$ct('startDate')" id="start-date" type="date" v-model="event.startDate" />
        
        <v-text-field :rules="[rules.notEmpty]" class="required" required :label="$ct('startTime')" id="start-time" type="time" v-model="event.startTime" />
        
        <v-checkbox :label="$ct('hasEndDate')" v-model="event.hasEndDate" id="has-end-date"></v-checkbox>

        <div v-if="event.hasEndDate">
            <v-text-field :rules="[rules.maxEndDate]" :label="$ct('endDate')" id="end-date" type="date" v-model="event.endDate"  />            
            <v-text-field :rules="[rules.maxEndTime]" :label="$ct('endTime')" id="end-time" type="time" v-model="event.endTime"  />    
        </div>

        <h1 class="text-subtitle-2 mb-3">{{ $ct('headerImage') }}</h1>

        <v-alert
            v-if="!getSelectedBanner()"
            :text="$ct('noCoverImageText')"
            :title="$ct('noCoverImage')"
            type="warning"
        />

        <ImageSelect
            :maxSize="uploadLimits.banner"
            :images="event.banners"
            :selected="event.selectedBannerId"
            :upload-button-label="$ct('uploadButton')"
            @display-error="dispatchError"
            @set-selected-image-index="setSelectedBanner"
        />

        <h1 class="text-subtitle-2 mt-5 mb-3">{{ $ct('description') }}</h1>

        <v-text-field :rules="[rules.notEmpty, rules.titleLength]" class="required" :label="$ct('title_label')" required id="title" v-model="event.title"/>        
        
        <QuillEditor :upload-limit="uploadLimits.default" contentType="html" v-model:content="event.description" id="description"  theme="snow" />

        <v-text-field class="mt-5" :label="$ct('url')" type="url" v-model="event.url"/>
        
        <v-text-field class="" :label="$ct('ticketsUrl')" type="url" v-model="event.ticketsUrl"/>
        
        <v-autocomplete
            :items="categories" 
            item-title="label" 
            item-value="id" 
            :label="$ct('category')" 
            v-model="event.selectedCategory"
            :clearable="true"
            :no-data-text="$ct('noDataText')"
        >
        </v-autocomplete>
        
        <h1 class="text-subtitle-2 mt-3 mb-3">{{ $ct('location') }}</h1>

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
            >{{ $ct('submit') }}</v-btn>
    
            <v-btn 
                class="mr-5 mb-5" 
                color="info" 
                type="submit"
                :loading="store.getters.isSavingEvent"
                @click="submit('submitAsDraft')"
            >{{ $ct('submitDraft') }}</v-btn>

            <v-btn 
                class="mb-5" 
                color="warning" 
                @click="cancel"
            >{{ $ct('cancel') }}</v-btn>            
        </div>
        
    </v-form>
</template>