<script setup>
import { computed, ref, onMounted } from 'vue'
import { convertBytesToMegabytes, blobToDataUrl, dataURLtoFile } from '../utils/utils'
import { componentTranslate } from '../i18n/utils.js'

const $ct = componentTranslate('ImageSelect')

const props = defineProps({
    maxSize: Number,
    images: Array,
    selected: Number,
    uploadButtonLabel: String
})

const emit = defineEmits('displayError', 'setSelectedImageIndex')

const images = ref(props.images)
const selected = ref(props.selected)
const tooBig = ref(false)
const maxHeightRatio = ref(null)
const maxHeight = ref(null)
const uploadInput = ref()
const openUpload = () => {
  uploadInput.value?.click()
}
onMounted(() => {
    images.value = props.images
    if (images.value) {
        images.value.map((image) => {
            image.file = dataURLtoFile(image.src)
            updateMaxRatio(image.src)
        })    
    }
})
const setUploadedImage = async e => {

    const files = e.target.files
    const file = files.length > 0 ? files[0] : null
    
    if (file) {
        tooBig.value = false
        
        if (!isValidSizeFile(file)) {
            tooBig.value = true
            emit('displayError', $ct('too_big_error', { max: convertBytesToMegabytes(props.maxSize)}))
            e.target.value = ""
            return
        }
        const uploadedImage = { file }
        try {
            const dataUrl = await blobToDataUrl(file)
            uploadedImage.src = dataUrl
            updateMaxRatio(dataUrl)
            images.value.push(uploadedImage)
            const index = images.value.length - 1
            updateSelected(index)
            emit('setSelectedImageIndex', index)
        } catch (e) {
            emit('displayError', $ct('conversion_error'))
        }
    }
}

// Handle dimensions of cover carousel
const updateMaxRatio = src => {
    const tempImage = new Image
    tempImage.onload = () => {
        maxHeight.value = tempImage.height > maxHeight.value ? tempImage.height : maxHeight.value  
        const heightWidthRatio = tempImage.height / tempImage.width
        maxHeightRatio.value = heightWidthRatio > maxHeightRatio.value ?
            heightWidthRatio :
            maxHeightRatio.value
    } 
    tempImage.src = src    
}

const isValidSizeFile = file => file.size <= props.maxSize

const updateSelected = (index) => {
    emit('setSelectedImageIndex', index)
    selected.value = index
}

</script>

<template>
    <div>
        <v-carousel
            v-if="images"
            crossfade
            selected-class="cover-selected"
            :show-arrows="images.length > 1"
            :model-value="selected"
            @update:model-value="updateSelected"
            :hide-delimiter-background="true"
            :hide-delimiters="true"
            :continuous="false"
            :height="`min(${maxHeight}px, 50vh, (min(100vw, var(--max-content-width))) * ${maxHeightRatio})`"
        >
            <v-carousel-item
                v-for="(image, index) in images"
                :key="image.url"
                :value="index"
                :data-image-index="index" 
                :src="image.src"
                max-width="100%"
                max-height="100%"
            >
            </v-carousel-item>            
        </v-carousel>
    
        <v-btn class="mt-5" @click="openUpload" prepend-icon="mdi-upload">{{ props.uploadButtonLabel || $ct('uploadButton') }}</v-btn>
        
        <input ref="uploadInput" type="file" style="display: none;" v-on:change="setUploadedImage">
    </div>
</template>