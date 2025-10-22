<script setup>
import { computed, watch, ref } from 'vue'; 
import { useStore } from 'vuex';

const store = useStore()
const message = computed(() => store.getters.getCurrentMessage)
const text = ref(null)
const type = ref(null)
const id = ref(null)
const show = ref(false)
let hideTimeoutId1 = null
let hideTimeoutId2 = null
const showTime = 5000
const transitionTime = 500

watch(
  message,
  (newMessage) => {
    if (!newMessage) {
      show.value = false
      return
    }
    text.value = newMessage.text
    type.value = newMessage.type
    id.value = newMessage.id
    show.value = true
    hideTimeoutId1 = setTimeout(() => {
      show.value = false
    }, showTime)
    hideTimeoutId2 = setTimeout(() => {
      store.commit('hideMessage', newMessage.id)
    }, showTime + transitionTime)
  },
  { immediate: true, deep: true }
)

const close = () => {
  show.value = false
  clearTimeout(hideTimeoutId1)
  clearTimeout(hideTimeoutId2)
  setTimeout(() => {
    store.commit('hideMessage', id.value)
  }, transitionTime)  
}
</script>

<template>
  <v-snackbar :color="type == 'error' ? 'error' : ''" v-model="show">
    {{ text }}
    <template v-slot:actions>
      <v-btn
        color=""
        variant="text"
        @click="close"
      >
        Close
      </v-btn>
    </template>    
  </v-snackbar>
</template>