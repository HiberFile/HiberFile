<template>
  <p
    class="outline-none bg-opacity-0 bg-white underline cursor-pointer font-normal"
    style="width: max-content"
    :class="`text-${_color} text-${_size}`"
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

  @Prop()
  readonly size: string | undefined;

  private _size: string | undefined;

  beforeMount() {
    this._color = this.color ?? 'blue-700';
    this._size = this.size ?? 'base';
  }
}
</script>
