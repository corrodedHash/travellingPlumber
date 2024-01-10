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
let routeLine = undefined as undefined | Polyline;
const props = defineProps<{ route: LocationInfo[] }>();
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

watch(
  () => [props.route, routeMap.value] as const,
  ([r, rm]) => {
    if (rm === undefined) return;
    if (routeLine !== undefined) routeLine.remove();

    if (props.route.length === 1) {
      rm.setView(props.route[0].location);
    } else if (props.route.length > 1) {
      routeLine = polyline(r.map((v) => v.location)).addTo(rm);
      rm.fitBounds(latLngBounds(r.map((v) => v.location)));
    }
  },
  { immediate: true }
);
</script>
<style scoped>
.routeMapContainer {
  min-height: 500px;
  min-width: 80vw;
}
</style>
