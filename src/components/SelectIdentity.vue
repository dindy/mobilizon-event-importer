<script setup>

import { computed, ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()
store.dispatch('setPageTitle', 'Identité')

const globalSelectedIdentity = store.getters.getSelectedIdentity
const globalSelectedGroup = store.getters.getSelectedGroup
const isConnectingToMobilizon = computed(() => store.getters.isConnectingToMobilizon)
const isLoadingGroups = computed(() => store.getters.isLoadingGroups)
const identities = computed(() => store.getters.getIdentities)
const groups = computed(() => {
    if (!selectedIdentity.value) return []
    return store.getters.getGroupsByIdentityId(selectedIdentity.value)
})
const dynSelectedIdentity = () => globalSelectedIdentity ? globalSelectedIdentity.id : identities.value[0]?.id
const dynSelectedGroup = () => globalSelectedGroup ? globalSelectedGroup.id : groups.value[0]?.id
const selectedIdentity = ref(dynSelectedIdentity())
const selectedGroup = ref(dynSelectedGroup())
const skipGroup = ref(false)

watch(groups, (newVal, oldVal) => {
    selectedGroup.value = dynSelectedGroup()    
})
watch(identities, (newVal) => {
    selectedIdentity.value = dynSelectedIdentity()
})
watch(selectedIdentity, (newVal) => {
    selectedGroup.value = groups.value[0]?.id || null
})

const next = () => {
    store.dispatch('selectMobilizonIdentityAndGroup', {
        identity: selectedIdentity.value,
        group: skipGroup.value ? null : selectedGroup.value || null,
    })
    router.push('/scrap')
}

const getActionText = () => {
    const identityName = store.getters.getIdentityById(selectedIdentity.value)?.name
    let message = `Publier avec "${identityName}"`
    return !selectedGroup.value || skipGroup.value ?
        `${message}` :
        `${message} dans "${store.getters.getGroupById(selectedGroup.value)?.name}"`
}

const clearGroup = () => {
    skipGroup.value = true
}

const updateSkipGroup = () => {
    if (!selectedGroup.value && !skipGroup.value && groups.value.length > 0) {
        selectedGroup.value = groups.value[0].id
    }
}

const updateIdentity = () => {
    skipGroup.value = false
}
</script>

<template>
    <v-infinite-scroll v-if="isConnectingToMobilizon || isLoadingGroups"></v-infinite-scroll>
    <div class="form" v-else>
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

        <v-autocomplete 
            label="Sélectionnez un groupe"
            :items="groups"
            item-title="name" 
            item-value="id" 
            v-model="selectedGroup"
            v-if="!skipGroup && groups.length > 0"
            chips
            :hide-details="true"
            class=""
        >
            <!-- :clearable="true"
            @click:clear="clearGroup" -->
            <template v-slot:no-data>
                <v-list-item>Cette identité n'appartient à aucun groupe.</v-list-item>
            </template>
            <template v-slot:chip="{ props, item }">
                <v-chip v-if="item.raw.avatar?.url" :prepend-avatar="item.raw.avatar?.url" v-bind="props" :text="item.title"></v-chip> 
                <v-chip v-else prepend-icon="mdi-account-group" v-bind="props" :text="item.title"></v-chip> 
            </template>
            <template v-slot:item="{ item, props }">
                <v-list-item v-if="item.raw.avatar?.url" :prepend-avatar="item.raw.avatar?.url" v-bind="props"></v-list-item>
                <v-list-item v-else v-bind="props">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-account-group" size="40"></v-icon>
                    </template>
                </v-list-item>
            </template>
        </v-autocomplete>

        <v-alert class="" v-if="!groups || groups.length < 1" variant="outlined" type="info" text="Cette identité n'appartient à aucun groupe."></v-alert>

        <!-- <v-btn
            class=""
            v-if="!skipGroup"
            :disabled="!selectedIdentity"
            @click="importGroup"
            color=""
            prepend-icon="mdi-plus"
        >Importer un groupe Facebook</v-btn>   -->

        <v-checkbox 
            v-model="skipGroup" 
            v-if="groups.length > 0" 
            label="Ne pas publier dans un groupe"
            @update:model-value="updateSkipGroup"
            :hide-details="true"
            class=""
        ></v-checkbox>

        <v-btn
            :disabled="!selectedIdentity"
            @click="next"
            color="primary"
            prepend-icon="mdi-check"
        >{{ getActionText() }}</v-btn>
    </div>

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