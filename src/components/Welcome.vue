<script setup>
import { useRoute } from 'vue-router'
import { useStore } from 'vuex';
import { componentTranslate } from '../i18n/utils.js'

const store = useStore()
const route = useRoute()
const $ct = componentTranslate('Welcome')

const next = () => {
  
  if (route.query.domain) {
    store.dispatch('registerApp', route.query.domain)
  } else {
    store.dispatch('navigateTo', '/instance')
  }  
}
</script>

<template>
  <div class="empty-state-container">
    <v-empty-state
      :title="$ct('title')"
      image="logo.svg"
    >
      <template v-slot:headline>
        <div class="mt-5">OFF EVENTS</div>
      </template>
      <template v-slot:text>
        <p class="text-caption mt-2 mb-2">{{ $ct('text1') }}</p>
        <p class="text-caption">{{ $ct('text2') }}</p>
      </template>
      <template v-slot:actions>
        <v-btn
          :text="$ct('login')"
          @click="next"
          color="primary"
        ></v-btn>
      </template>  
    </v-empty-state>  
  </div>
</template>