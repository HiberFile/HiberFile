<template>
  <div v-show="opened" class="bg-white flex justify-center p-1 items-center">
    <i18n
      class="text-blue-700 bg w-auto text-base font-normal mr-6"
      path="donation_banner"
      tag="p"
    >
      <template #click_here>
        <a
          class="underline"
          href="https://fr.liberapay.com/hiberfile/"
          target="_blank"
          >{{ $t('click_here') }}</a
        >
      </template>
    </i18n>
    <Cross class="h-2 w-2 cursor-pointer" @click.native="close" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class Index extends Vue {
  opened = false;

  beforeMount() {
    const day = new Date().getDay();
    if (day === 2 || day === 5) this.opened = true;
  }

  close() {
    this.opened = false;
  }
}
</script>
