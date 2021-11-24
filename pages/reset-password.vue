<template>
  <div>
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
                v-model="password"
                :placeholder="$t('password')"
                type="password"
                autocomplete="new-password"
                class="mb-4"
                :error="passwordConfirmed"
              />
              <HFInput
                v-model="confirmPassword"
                :placeholder="$t('confirm_password')"
                type="password"
                autocomplete="new-password"
                :error="passwordConfirmed"
              />
            </div>
            <HFButton
              :value="$t('change_password')"
              class="mx-auto"
              style="width: min-content"
              @click.native="changePassword"
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
import { accountStore } from '~/utils/store-accessor';

@Component
export default class Index extends Vue {
  mobile: boolean | null = null;
  password: string = '';
  confirmPassword: string = '';

  get passwordConfirmed() {
    return (
      (this.password === this.confirmPassword &&
        /[a-z]/gm.test(this.password) &&
        /[A-Z]/gm.test(this.password) &&
        /[0-9]/gm.test(this.password) &&
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/gm.test(this.password) &&
        this.password.length >= 8) ||
      this.password === ''
    );
  }

  beforeMount() {
    this.mobile = isMobile();
    accountStore.logInLocalStorage();
  }

  goToHome() {
    this.$router.push(this.localePath('/'));
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

  async changePassword() {
    try {
      if (this.passwordConfirmed) {
        await this.$axios.post(
          `${process.env.HIBERAPI_URL}/accounts/reset-password/`,
          {
            resetPasswordToken: new URLSearchParams(location.search).get(
              'token'
            ),
            newPassword: this.password
          }
        );

        this.goToHome();
      } else if (this.password.length === 0) {
        this.Toast({
          icon: 'error',
          iconColor: '#F63F3C',
          title: this.$tc('please_fill_fields')
        });
      } else if (!this.passwordConfirmed) {
        if (this.password !== this.confirmPassword) {
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('password_not_same')
          });
        } else if (!/[a-z]/gm.test(this.password)) {
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('min_one_lowercase_in_pw')
          });
        } else if (!/[A-Z]/gm.test(this.password)) {
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('min_one_uppercase_in_pw')
          });
        } else if (!/[0-9]/gm.test(this.password)) {
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('min_one_number_in_pw')
          });
        } else if (
          !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/gm.test(this.password)
        ) {
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('min_one_special_char_in_pw')
          });
        } else if (this.password.length < 8) {
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('min_eight_char_pw')
          });
        }
      }
    } catch (e) {
      if ((e as AxiosError).isAxiosError) {
        this.Toast({
          icon: 'error',
          iconColor: '#F63F3C',
          title: this.$tc('reset_password_error')
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
