<script setup lang="ts">
import RouteDisplay from "./components/RouteDisplay.vue";
import POIList from "./components/POIList.vue";
import { ref } from "vue";
import RouteSplitter from "./components/RouteSplitter.vue";
import type { LocationInfo } from "./common";

function handleNewItem(item: LocationInfo) {
  adresses.value[0].push(item);
}
const adresses = ref([
  [
    {
      displayName:
        "Gerokstraße, Diemershalde, Stuttgart-Mitte, Stuttgart, Baden-Württemberg, 70184, Germany",
      location: { lat: 48.7768331, lng: 9.191664 },
      streetname: "Gerokstraße",
    },
    {
      displayName:
        "Geschwister-Scholl-Straße, Hauptbahnhof, Stuttgart-Mitte, Stuttgart, Baden-Württemberg, 70174, Germany",
      location: { lat: 48.7825872, lng: 9.1771036 },
      streetname: "Geschwister-Scholl-Straße",
    },
    {
      displayName:
        "Marktstraße, Rathaus, Stuttgart-Mitte, Stuttgart, Baden-Württemberg, 70173, Germany",
      location: { lat: 48.774215, lng: 9.1805289 },
      streetname: "Marktstraße",
    },
  ],
] as LocationInfo[][]);
</script>

<template>
  <div>
  <POIList @new-item="handleNewItem" />
  <RouteDisplay :route="adresses.flatMap((v) => v)" />
  <RouteSplitter v-model="adresses" />
</div>
</template>

<style scoped></style>
