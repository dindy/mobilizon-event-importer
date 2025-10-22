<script setup>

const props = defineProps({
  mobilizonAuthUrl: String
})
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
        <p class="text-caption mt-2 mb-2">Cette application vous permet d'importer des événements depuis Facebook, Instagram ou d'autres réseaux sur Off Events.</p>
        <p class="text-caption">Pour commencer, connectez-vous à votre compte Off Events</p>
      </template>
      <template v-slot:actions>
        <v-btn
          text="Me connecter"
          :href="mobilizonAuthUrl"
          color="primary"
        ></v-btn>
      </template>  
    </v-empty-state>  
  </div>
</template>