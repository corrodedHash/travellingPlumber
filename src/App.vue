<script setup lang="ts">
import RouteDisplay from "./components/RouteDisplay.vue";
import POIList from "./components/POIList.vue";
import draggable from "vuedraggable";
import { ref } from "vue";
import RouteSplitter from "./components/RouteSplitter.vue";
import type { LocationInfo } from "./common";

function handleNewItem(item: LocationInfo) {
  bla.value[0].push(item);
}
const bla = ref([[]] as LocationInfo[][]);
</script>

<template>
  <header>
    <div class="wrapper">
      <POIList @new-item="handleNewItem" />
      <RouteDisplay :route="bla.flatMap((v) => v)" />
      <RouteSplitter v-model="bla" />
    </div>
  </header>

  <!-- <RouterView /> -->
</template>

<style scoped></style>
