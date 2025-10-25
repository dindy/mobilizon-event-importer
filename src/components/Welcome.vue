<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex';
const store = useStore()
const router = useRouter()
const route = useRoute()

const next = () => {
  
  if (route.query.domain) {
    store.dispatch('registerApp', route.query.domain)
  } else {
    router.push('/instance')
  }  
}
</script>

<template>
  <div class="empty-state-container">
    <v-empty-state
      title="Importer des événements"
      image="logo.svg"
    >
      <template v-slot:headline>
        <div class="mt-5">OFF EVENTS</div>
      </template>
      <template v-slot:text>
        <p class="text-caption mt-2 mb-2">Cette application vous permet d'importer des événements depuis Facebook, Instagram ou d'autres réseaux dans votre instance Mobilizon.</p>
        <p class="text-caption">Pour commencer, connectez-vous à votre compte Mobilizon</p>
      </template>
      <template v-slot:actions>
        <v-btn
          text="Me connecter"
          @click="next"
          color="primary"
        ></v-btn>
      </template>  
    </v-empty-state>  
  </div>
</template>