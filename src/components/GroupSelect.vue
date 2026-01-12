<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useStore()
const storedSelectedGroup = computed(() => store.getters.getSelectedGroup)
const groups = computed(() => [
    { avatar: null, add: true, name: "Importer un groupe facebook", id: -1 },
    ...store.getters.getSelectedIdentityGroups])
const selectedGroup = ref(storedSelectedGroup.value?.id)
const emit = defineEmits('closeMenu')
const updateGroup = () => {
    emit("closeMenu")
    if (selectedGroup.value == -1) {
        store.dispatch('selectMobilizonGroup', null)
        selectedGroup.value = null
        router.push('/scrapGroup')
    } else {
        store.dispatch('selectMobilizonGroup', selectedGroup.value)
    }
}
</script>

<template>
    <v-select 
        label="Sélectionnez un groupe"
        :items="groups"
        item-title="name" 
        item-value="id" 
        v-model="selectedGroup"
        required
        @update:model-value="updateGroup"
        :hide-details="true"
        :hide-no-data="true"
        class=""
        :clearable="true"
    >
        <template v-slot:selection="{ item, props }">
            <v-list-item v-if="item.raw.avatar?.url" v-bind="props" :prepend-avatar="item.raw.avatar?.url" :title="item.title"></v-list-item>
            <v-list-item v-else>
                <template v-slot:default>
                    {{item.title}}
                </template>
                <template v-slot:prepend>
                    <v-icon icon="mdi-account-group" size="40"></v-icon>
                </template>                    
            </v-list-item> 
        </template>
        <template v-slot:item="{ item, props }">
            <v-list-item v-if="item.raw.add" v-bind="props" :title="item.title">
                <template v-slot:prepend>
                    <v-icon icon="mdi-plus" size="40"></v-icon>
                </template>                 
            </v-list-item> 
            <v-list-item v-if="item.raw.avatar?.url" v-bind="props" :prepend-avatar="item.raw.avatar?.url" :title="item.title"></v-list-item> 
            <v-list-item v-bind="props" :title="item.title" v-else-if="!item.raw.add">
                <template v-slot:prepend>
                    <v-icon icon="mdi-account-group" size="40"></v-icon>
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