<template>
  <div ref="routeMapContainer" class="routeMapContainer"></div>
</template>
<script setup lang="ts">
import type { LocationInfo } from "@/common";
import {
  map,
  latLng,
  tileLayer,
  latLngBounds,
  Map,
  polyline,
  Polyline,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, onUnmounted, ref, watch, type Ref } from "vue";
const routeMapContainer: Ref<undefined | HTMLDivElement> = ref(undefined);
const routeMap: Ref<undefined | Map> = ref(undefined);
let routeLines: Polyline[] = [];
const props = defineProps<{ routes: LocationInfo[][] }>();
onMounted(() => {
  if (routeMapContainer.value === undefined) return;
  routeMap.value = map(routeMapContainer.value, {
    center: [48.7758, 9.1829],
    zoom: 13,
  });
  tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(routeMap.value);
});

function redrawRoutes() {
  const rm = routeMap.value;
  if (rm === undefined) return;

  routeLines.forEach((v) => v.remove());
  const newLines = props.routes
    .filter((v) => v.length > 1)
    .map((v) => polyline(v.map((q) => q.location)).addTo(rm));
  routeLines = newLines;

  const routePoints = props.routes.flatMap((v) => v.flatMap((q) => q.location));
  if (routePoints.length === 1) {
    rm.setView(routePoints[0]);
  } else if (routePoints.length > 1) {
    rm.fitBounds(latLngBounds(routePoints));
  }
}

watch(routeMap, () => redrawRoutes(), { immediate: true });
watch(
  () => props.routes,
  () => redrawRoutes(),
  { deep: true }
);
</script>
<style scoped>
.routeMapContainer {
  min-height: 500px;
  min-width: 80vw;
}
</style>
