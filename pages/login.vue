<template>
  <div
    class="p-8 font-sans gradient-radial flex-grow min-h-screen text-white flex flex-col max-w-full"
    :style="{
      'min-height': mobile ? 'calc(var(--vh, 1vh) * 100)' : '',
      'overflow-y': mobile ? 'hidden' : ''
    }"
  >
    <Header :onclicklogo="goToHome" />
    <div class="flex-grow flex flex-row items-center justify-start my-8">
      <div
        class="flex flex-row items-start justify-start w-full relative h-auto"
      >
        <MainCard
          class="flex-shrink-0 relative h-auto"
          style="transition: 0.2s"
          :style="{
            transform: !mobile
              ? 'translateX(calc(50vw - 50% - 2rem))'
              : 'translateX(0)'
          }"
        >
          <CardContent>
            <Person class="w-8 h-8 mx-auto" />
            <div class="my-8">
              <HFInput
                v-model="emailAddress"
                :placeholder="$t('email_address')"
                type="email"
                class="mb-4"
              />
              <HFInput
                v-model="password"
                :placeholder="$t('password')"
                type="password"
                autocomplete="current-password"
              />
              <LittleButton
                class="mt-2 mx-auto"
                :value="$tc('password_forgotten')"
                size="xs"
                @click.native="passwordForgotten"
              />
            </div>
            <HFButton
              :value="$t('login')"
              class="mx-auto"
              style="width: min-content"
              @click.native="login"
            />
          </CardContent>
        </MainCard>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import isMobile from 'assets/scripts/isMobile';
import { AxiosError } from 'axios';
import { accountStore } from '~/store';

@Component
export default class Index extends Vue {
  mobile: boolean | null = null;
  emailAddress: string = '';
  password: string = '';

  beforeMount() {
    this.mobile = isMobile();
    accountStore.logInLocalStorage();
  }

  goToHome() {
    this.$router.push('/');
  }

  Toast(options: any) {
    return this.$swal.fire(
      Object.assign(
        {
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast: HTMLElement) => {
            toast.addEventListener('mouseenter', this.$swal.stopTimer);
            toast.addEventListener('mouseleave', this.$swal.resumeTimer);
          }
        },
        options
      )
    );
  }

  async passwordForgotten() {
    if (this.emailAddress.length === 0) {
      this.Toast({
        icon: 'error',
        iconColor: '#F63F3C',
        title: this.$t('email_address_required')
      });
    } else {
      try {
        await this.$axios.post(
          `${process.env.HIBERAPI_URL}/accounts/reset-password/request`,
          {
            email: this.emailAddress,
            language: this.$i18n.locale
          }
        );
        this.Toast({
          icon: 'success',
          iconColor: '#3EC300',
          title: this.$t('password_reset_email_sent')
        });
      } catch (e) {
        this.Toast({
          icon: 'error',
          iconColor: '#F63F3C',
          title: this.$t('unexpected_error')
        });
      }
    }
  }

  async login() {
    try {
      const email = this.emailAddress;

      const { token, userId } = (
        await this.$axios.post<{ token: string; userId: string }>(
          `${process.env.HIBERAPI_URL}/accounts/login`,
          {
            email,
            password: this.password
          }
        )
      ).data;

      accountStore.logIn({ email, token, userId });
      this.goToHome();
    } catch (e) {
      if ((e as AxiosError).isAxiosError && (e as AxiosError).code === '401') {
        this.Toast({
          icon: 'error',
          iconColor: '#F63F3C',
          title: this.$tc('bad_login')
        });
      } else {
        this.Toast({
          icon: 'error',
          iconColor: '#F63F3C',
          title: this.$tc('unexpected_error')
        });
      }
    }
  }
}
</script>
