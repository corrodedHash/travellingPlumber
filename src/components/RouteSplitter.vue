<template>
  <div @click="addGroup" class="addButton">Add group</div>
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
        <template #item="{ element }">
          <div class="routeElement">{{ element.displayName }}</div>
        </template>
      </draggable>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import draggable from "vuedraggable";

const model = defineModel<any[][]>({ required: true });

function handleChange(index: number, e: (typeof model.value)[number]) {
  model.value.splice(index, 1, e);
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
