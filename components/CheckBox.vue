<template>
  <div class="flex items-center">
    <div
      class="h-4 w-4 border border-blue-700 rounded cursor-pointer flex-shrink-0"
      @click="toggleCheckBox"
    >
      <div
        v-show="inputValue"
        class="bg-blue-700 h-full w-full rounded border-2 border-white"
      ></div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Button extends Vue {
  @Prop({
    required: true
  })
  readonly value: boolean | undefined;

  private inputValue: boolean = false;

  beforeMount() {
    if (this.value) this.inputValue = this.value;
  }

  toggleCheckBox() {
    this.inputValue = !this.inputValue;
    this.$emit('input', this.inputValue);
  }
}
</script>
