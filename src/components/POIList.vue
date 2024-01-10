<template>
  <form @submit="getResults">
    <input type="text" v-model="address" /><input
      type="button"
      :value="searching ? '...' : 'Search'"
      @click="getResults"
      :disabled="searching"
    />
  </form>
  <div v-if="resultList.length > 0">
    <div v-for="o in resultList" @click="handleSelect(o)">
      {{ o.display_name }}
    </div>
  </div>
</template>
<script setup lang="ts">
import type { LocationInfo } from "@/common";
import { latLng } from "leaflet";
import { ref } from "vue";

const address = ref("");
const searching = ref(false);
const resultList = ref([] as any[]);

const emit = defineEmits<{
  (e: "newItem", item: LocationInfo): void;
}>();

function handleSelect(o: any) {
  emit("newItem", {
    displayName: o.display_name,
    location: latLng(parseFloat(o.lat), parseFloat(o.lon)),
    streetname: o.name,
  });
  resultList.value = [];
}

function getResults(e: Event) {
  e.stopPropagation();
  e.preventDefault();

  searching.value = true;
  fetch(
    `https://nominatim.openstreetmap.org/search?city=Stuttgart&street=${encodeURIComponent(
      address.value
    )}&format=jsonv2`
  ).then(async (v) => {
    searching.value = false;

    const result = await v.json();
    resultList.value = result;
  });
}
</script>
