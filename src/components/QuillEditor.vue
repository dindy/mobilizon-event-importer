<template>
  <QuillEditor :modules="modules" />
</template>

<script setup>
import { ref, defineComponent } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import ImageUploader from 'quill-image-uploader'
import { useStore } from 'vuex'
import BlotFormatter from 'quill-blot-formatter';
import { convertBytesToMegabytes } from '../utils/utils';

// export default defineComponent({
//     components: {
//         QuillEditor,
//     },
//     setup: () => {
        const store = useStore()
        const props = defineProps({uploadLimit: Number})
        
        const modules = [{
            name: 'imageUploader',
            module: ImageUploader,
            options: {
                upload: file => {
                    return new Promise((resolve, reject) => {
                        if (file.size > props.uploadLimit) {
                            reject("File is too big")
                            store.dispatch('createErrorFromText', `Le fichier est trop lourd (max. ${convertBytesToMegabytes(props.uploadLimit)} Mo)`)
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
//         return { modules }
//     }
// })
</script>