<template>
  <div class="option flex mb-6">
    <div v-show="name" class="text-base text-blue-700 font-light">
      <p>{{ name }}</p>
    </div>
    <div
      class="flex-shrink-0 m-auto justify-end flex-grow flex"
      :class="{ 'ml-6': name }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Button extends Vue {
  @Prop()
  readonly name: string | undefined;
}
</script>

<style scoped>
.option:last-child {
  margin-bottom: 0;
}
</style>
