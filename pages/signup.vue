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
          <CardContent v-if="!signedUp">
            <Person class="w-8 h-8 mx-auto" />
            <div class="my-8">
              <HFInput
                v-model="emailAddress"
                :placeholder="$t('email_address')"
                type="email"
                class="mb-4"
                :error="emailValid"
              />
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
                class="mb-4"
                :error="passwordConfirmed"
              />
              <CheckBox v-model="acceptedTerms" class="mx-auto justify-center">
                <i18n
                  class="text-blue-700 ml-4 text-sm cursor-pointer"
                  path="accept_terms"
                  tag="p"
                >
                  <template #mentions>
                    <nuxt-link :to="localePath('/mentions')">
                      <u>{{ $t('legal_notice').toLowerCase() }}</u>
                    </nuxt-link>
                  </template>
                </i18n>
              </CheckBox>
            </div>
            <HFButton
              :value="$t('signup')"
              class="mx-auto"
              @click.native="signup"
            />
          </CardContent>
          <CardContent v-else>
            <Check class="w-8 h-8 mx-auto" />
            <div class="my-8">
              <p class="text-blue-700">{{ $t('please_confirm_email') }}</p>
            </div>
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
  emailAddress: string = '';
  password: string = '';
  confirmPassword: string = '';
  signedUp: boolean = false;
  acceptedTerms: boolean = false;

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

  get emailValid() {
    return (
      /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm.test(this.emailAddress) ||
      this.emailAddress === ''
    );
  }

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

  async signup() {
    try {
      if (this.emailValid && this.passwordConfirmed && this.acceptedTerms) {
        await this.$axios.post(`${process.env.HIBERAPI_URL}/accounts/signup`, {
          email: this.emailAddress,
          password: this.password,
          language: this.$i18n.locale
        });

        this.signedUp = true;
      } else if (this.emailAddress.length === 0 || this.password.length === 0) {
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
      } else if (!this.emailValid) {
        this.Toast({
          icon: 'error',
          iconColor: '#F63F3C',
          title: this.$tc('email_not_valid')
        });
      } else if (!this.acceptedTerms) {
        this.Toast({
          icon: 'error',
          iconColor: '#F63F3C',
          title: this.$tc('must_accept_terms')
        });
      }
    } catch (e) {
      if ((e as AxiosError).isAxiosError) {
        if ((e as AxiosError).code === '409')
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('user_already_exists')
          });
        else
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('signup_error')
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
