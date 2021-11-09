<template>
  <header class="h-min-content flex justify-between items-start flex-shrink-0">
    <div class="inline-block" @click="onclicklogo">
      <Logo class="hiberfile-logo cursor-pointer" />
      <p v-show="!mobile" class="font-light mt-8" style="width: 14rem">
        {{ $t('share_file_header') }}
      </p>
    </div>
    <div class="flex">
      <div v-if="token === null" class="flex mr-4">
        <LittleButton
          :value="$t('login')"
          class="mr-4"
          color="white"
          @click.native="goToLogin"
        />
        <LittleButton
          :value="$t('signup')"
          color="white"
          @click.native="goToSignup"
        />
      </div>
      <div v-else class="flex mr-4">
        <LittleButton
          :value="$t('account')"
          color="white"
          @click.native="goToAccount"
        />
      </div>
      <LanguageSwitcher />
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import isMobile from '~/assets/scripts/isMobile';
import { accountStore } from '~/store';

@Component
export default class Header extends Vue {
  @Prop({ required: true })
  readonly onclicklogo: void | undefined;

  mobile: boolean | null = null;

  beforeMount() {
    this.mobile = isMobile();
  }

  get token() {
    return accountStore?.token;
  }

  goToLogin() {
    this.$router.push({
      path: '/login'
    });
  }

  goToSignup() {
    this.$router.push({
      path: '/signup'
    });
  }

  goToAccount() {
    this.$router.push({
      path: '/account'
    });
  }
}
</script>

<style scoped>
.hiberfile-logo {
  width: 89px;
  height: auto;
}
</style>
