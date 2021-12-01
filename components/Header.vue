<template>
  <header class="h-min-content flex justify-between items-start flex-shrink-0">
    <div class="inline-block" @click="onclicklogo">
      <Logo class="hiberfile-logo cursor-pointer z-50 relative" />
      <p v-show="!mobile" class="font-light mt-8" style="width: 14rem">
        {{ $t('share_file_header') }}
      </p>
    </div>
    <div
      class="flex"
      :class="{
        'flex-col-reverse': mobile
      }"
    >
      <div
        v-if="token === null"
        class="flex"
        :class="{
          'mr-4': !mobile
        }"
      >
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
          :value="$t('logout')"
          class="mr-4"
          color="white"
          @click.native="logout"
        />
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
    this.$router.push(this.localePath('/login'));
  }

  goToSignup() {
    this.$router.push(this.localePath('/signup'));
  }

  goToAccount() {
    this.$router.push(this.localePath('/account'));
  }

  logout() {
    accountStore.logOut();
  }
}
</script>

<style scoped>
.hiberfile-logo {
  width: 89px;
  height: auto;
}
</style>
