<template>
  <p
    class="outline-none bg-opacity-0 bg-white underline text-center cursor-pointer font-medium w-auto text-lg"
    :class="`text-${_color}`"
  >
    {{ value }}
  </p>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Button extends Vue {
  @Prop({
    required: true
  })
  readonly value: string | undefined;

  @Prop()
  readonly color: string | undefined;

  private _color: string | undefined;

  beforeMount() {
    this._color = this.color ?? 'blue-700';
  }
}
</script>
