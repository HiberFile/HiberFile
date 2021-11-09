<template>
  <div
    class="w-full flex bg-white"
    :class="{
      'border-blue-700': error === undefined || error === true,
      'border-red-700': error === false,
      'border-b-0': pad,
      'border-b': !pad,
      'rounded-lg': pad,
      'pr-2': pad
    }"
  >
    <input
      v-model="value"
      :type="_type"
      class="text-base font-light outline-none w-full flex-grow pr-0"
      :class="{
        'p-2': pad,
        'text-blue-700': !pad || error === false || error === undefined,
        'text-red-700': pad && error === true,
        'rounded-lg': pad
      }"
      :value="value"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :aria-placeholder="placeholder"
      @input="handleInput"
    />
    <slot class="flex-shrink-0"></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Input extends Vue {
  @Prop()
  readonly placeholder: string | undefined;

  @Prop()
  readonly value: string | undefined;

  @Prop()
  readonly type: 'text' | 'password' | 'email' | undefined;

  @Prop()
  readonly autocomplete: string | undefined;

  @Prop()
  readonly error: boolean | undefined;

  @Prop()
  readonly pad: boolean | undefined;

  private _type: string | undefined;
  private _pad: boolean | undefined;

  inputValue: string = '';

  beforeMount() {
    this._type = this.type ?? 'text';
    this._pad = this.pad ?? false;
    if (this.value) this.inputValue = this.value;
  }

  handleInput() {
    this.$emit('input', this.inputValue);
  }
}
</script>

<style scoped>
input::placeholder {
  @apply text-blue-700 text-opacity-50;
}
</style>
