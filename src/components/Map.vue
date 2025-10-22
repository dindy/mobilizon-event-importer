<template>
    <l-map ref="map" zoom="zoom" :center="center" @ready="mapReady">
        <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
        ></l-tile-layer>
        <l-marker v-if="altCoords" :lat-lng="altCoords">
            <l-icon icon-url="/marker-blue.svg" :icon-size="[30, 30]"></l-icon>
        </l-marker>        
        <l-marker @dragend="releaseMarker" :lat-lng="coords" draggable>
        <!-- <l-marker :lat-lng="coords"> -->
            <l-icon icon-url="/marker-red.svg" :icon-anchor="[15, 30]" :icon-size="[30, 30]"></l-icon>
        </l-marker>
    </l-map>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LIcon } from "@vue-leaflet/vue-leaflet";
import L from "leaflet";

const emit = defineEmits('updateCoords')
const zoom = computed(() => props.propZoom)
const props = defineProps({
    coords: Object,
    center: Object,
    altCoords: Object,
    propZoom: Number,
    canUpdateCoords: Boolean
}) 
let isDragging = false
const updateCoords = coords => {
    console.log('updateCoords');
    
    emit('updateCoords', coords, zoom)
}
const releaseMarker = e => {
    console.log('release',e);
    isDragging = true
    setTimeout(() => isDragging = false, 200)
    const coords = { ...e.target.getLatLng() } // Had to copy object
    updateCoords(coords)
}
const clickMap = e => {
    if (!isDragging) {
        console.log('click');
        updateCoords(e.latlng);
    }
}

const mapReady = map => {
    if (props.canUpdateCoords) {
        map.on('click', clickMap)
    }
}
</script>

<style></style>