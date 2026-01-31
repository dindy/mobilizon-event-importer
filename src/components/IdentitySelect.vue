<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const identities = store.getters.getIdentities
const identity = store.getters.getSelectedIdentity
const selectedIdentity = ref(identity.id)
const updateIdentity = () => store.dispatch('selectMobilizonIdentityAndGroup', {
    identity: selectedIdentity.value,
    group: null
})
</script>

<template>
    <v-select 
        label="Sélectionnez une identité"
        :items="identities"
        item-title="name" 
        item-value="id" 
        v-model="selectedIdentity"
        required
        @update:model-value="updateIdentity"
        :hide-details="true"
        :hide-no-data="true"
        class=""
    >
        <template v-slot:selection="{ item, props }">
            <v-list-item v-if="item.raw.avatar?.url" v-bind="props" :prepend-avatar="item.raw.avatar?.url">{{item.title}}</v-list-item>
            <v-list-item v-else>
                <template v-slot:default>
                    {{item.title}}
                </template>
                <template v-slot:prepend>
                    <v-icon icon="mdi-account" size="40"></v-icon>
                </template>                    
            </v-list-item> 
        </template>
        <template v-slot:item="{ item, props }">
            <v-list-item v-if="item.raw.avatar?.url" v-bind="props" :prepend-avatar="item.raw.avatar?.url">{{item.title}}</v-list-item> 
            <v-list-item v-bind="props" v-else>
                <template v-slot:default>
                    {{item.title}}
                </template>
                <template v-slot:prepend>
                    <v-icon icon="mdi-account" size="40"></v-icon>
                </template>                    
            </v-list-item>                 
        </template>
    </v-select>
</template>

<style>
.v-list-item__prepend i+.v-list-item__spacer {
    width: 16px !important;
}
.form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form {
    button {
        width: fit-content;
    }
}
</style>