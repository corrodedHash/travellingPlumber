<script setup lang="ts">
import RouteDisplay from "./components/RouteDisplay.vue";
import POIList from "./components/POIList.vue";
import { ref } from "vue";
import RouteSplitter from "./components/RouteSplitter.vue";
import type { LocationInfo } from "./common";

function handleNewItem(item: LocationInfo) {
  adresses.value[0].push(item);
}
import testLocations from "@/assets/testLocations.json";
const adresses = ref(testLocations as LocationInfo[][]);
</script>

<template>
  <div>
    <POIList @new-item="handleNewItem" />
    <RouteDisplay :routes="adresses" />
    <RouteSplitter v-model="adresses" />
    {{ adresses }}
  </div>
</template>

<style scoped></style>
