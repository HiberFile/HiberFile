<template>
  <footer class="text-white flex flex-row justify-end flex-shrink-0">
    <div class="text-right font-light text-xs">
      <div class="flex justify-end">
        <a
          href="https://fr.liberapay.com/hiberfile/"
          target="_blank"
          class="underline"
          >{{ $t('donate') }}</a
        >
        &nbsp;-&nbsp;
        <a
          href="https://github.com/hiberfile/hiberfile"
          target="_blank"
          class="underline"
          >GitHub</a
        >
        &nbsp;-&nbsp;
        <a href="https://twitter.com/hiberfile" class="underline">Twitter</a>
      </div>
      <div class="block">
        <a
          :href="
            commitSha !== undefined
              ? `https://github.com/hiberfile/hiberfile/commit/${commitSha}`
              : ''
          "
          target="_blank"
          >v2021.3</a
        >
        - © 2022 HiberFile Team -
        <nuxt-link :to="localePath('/mentions')">
          <u>{{ $t('legal_notice') }}</u></nuxt-link
        >
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class Footer extends Vue {
  get commitSha() {
    return process.env.NUXT_ENV_CURRENT_GIT_SHA;
  }
}
</script>
