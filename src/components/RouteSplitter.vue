<template>
  <div @click="addGroup" class="addButton">Add group</div>
  <div @click="distribute">Distribute</div>
  <div class="routeTable">
    <div v-for="(o, index) in model" :key="index" class="routeGroup">
      <div @click="removeGroup(index)">Remove</div>
      <draggable
        item-key="displayName"
        :modelValue="o"
        @update:modelValue="handleChange(index, $event)"
        group="addressRouteGrouping"
        class="routeGroupDragging"
      >
        <template #item="{ element, index: elementIndex }">
          <div class="routeElement">
            <div
              @click="deleteElement(index, elementIndex)"
              class="deleteElementButton"
            >
              Delete
            </div>
            {{ element.displayName }}
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { LocationInfo } from "@/common";
import { multiTSP } from "@/multitsp";
import draggable from "vuedraggable";

const model = defineModel<LocationInfo[][]>({ required: true });

async function distribute() {
  const locations = model.value.flatMap((v) => v);
  const locationString = locations
    .map((v) => `${v.location.lat},${v.location.lng}`)
    .join(";");
  const distanceQuery = await fetch(
    `http://router.project-osrm.org/table/v1/driving/${encodeURIComponent(
      locationString
    )}?annotations=duration`
  );
  const distances = (await distanceQuery.json())["durations"];
  const result = multiTSP(locations, model.value.length, {
    distanceFunction: (a: LocationInfo, b: LocationInfo) => {
      const locAIndex = locations.findIndex(
        (v) => v.displayName === a.displayName
      );
      const locBIndex = locations.findIndex(
        (v) => v.displayName === b.displayName
      );
      return distances[locAIndex][locBIndex];
    },
  });
  model.value = result.map((v) => v.path);
}

function handleChange(index: number, e: (typeof model.value)[number]) {
  model.value.splice(index, 1, e);
}

function deleteElement(index: number, elementindex: number) {
  model.value[index].splice(elementindex, 1);
}

function addGroup() {
  model.value.push([]);
}

function removeGroup(index: number) {
  if (model.value.length <= 1) return;
  if (index === 0) {
    model.value[1] = [...model.value[1], ...model.value[0]];
  } else {
    model.value[index - 1] = [...model.value[index - 1], ...model.value[index]];
  }
  model.value.splice(index, 1);
}
</script>
<style scoped>
.deleteElementButton {
  background-color: red;
  border: 2px solid black;
  padding: 0.1em 0.5em;
  display: block;
  text-align: center;
}
.deleteElementButton:hover {
  border-color: white;
}
.addButton {
  background-color: lightgreen;
  border: 2px solid black;
  padding: 0.1em 0.5em;
  display: inline-block;
}
.routeTable {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5em;
}
.routeGroupDragging {
  flex-grow: 1;
}
.routeGroup {
  border: 2px solid black;
  margin: 0.1em;
  padding: 0.2em;
  display: flex;
  flex-direction: column;
}
</style>
