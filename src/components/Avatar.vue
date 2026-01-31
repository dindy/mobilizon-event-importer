<script setup>
import { computed } from 'vue'
    
const props = defineProps(['actor', 'type', 'color'])
const actor = computed(() => props.actor)
</script>
<template>
    <v-avatar v-if="actor" :title="actor.name" :alt="actor.name" color="white">
        <v-img v-if="actor.avatar?.url" :src="actor.avatar?.url"></v-img>   
        <v-icon v-else :icon="type && type === 'group' ? 'mdi-account-group' : 'mdi-account'"></v-icon>
    </v-avatar>        
</template>