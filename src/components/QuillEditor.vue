<template>
  <QuillEditor :modules="modules" :toolbar="toolbarOptions" :options="options"/>
</template>

<script setup>
import { ref, defineComponent } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import ImageUploader from 'quill-image-uploader'
import { useStore } from 'vuex'
import BlotFormatter from 'quill-blot-formatter';
import { convertBytesToMegabytes } from '../utils/utils';
import { componentTranslate } from '../i18n/utils.js'

const $ct = componentTranslate('QuillEditor')
const store = useStore()
const props = defineProps({uploadLimit: Number})
const toolbarOptions = ref(
    [
        ['bold', 'italic', 'underline', 'strike'],
        ['link', 'image', 'video'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }]
    ]
)
// TODO: Improve accessibility by handling Esc or Tab behavior. The adaptor for VueJS has a bug and don't handle options correctly.
const options = {
    modules: {
        keyboard: {
            bindings: {
                tab: {
                    key: 9,
                    handler: function () {
                        console.log("tab works");
                        // Handle tab
                    },
                },
                handleEnter: {
                    key: 13,
                    handler() {
                        console.log("enter works");
                        // reference self.theFunctionYouWantToCall()
                    },
                },                  
            }
        }
    }
}
const modules = [
    {
    name: 'imageUploader',
    module: ImageUploader,
    options: {
        upload: file => {
            return new Promise((resolve, reject) => {
                if (file.size > props.uploadLimit) {
                    reject("File is too big")
                    store.dispatch('createErrorFromText', $ct('too_big_error', { max: convertBytesToMegabytes(props.uploadLimit)}))
                    return
                }

                store.dispatch('uploadImage', file).then(data => {
                    const url = store.getters.getMobilizonImageURL
                    resolve(url)
                }).catch(error => {
                    reject("Upload failed")
                })
            })
        }
    }
}, {
    name: 'blotFormatter',
    module: BlotFormatter,
    options: {
        // see config options below
    }
}]

</script>