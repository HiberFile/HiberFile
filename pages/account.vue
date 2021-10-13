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
        class="flex flex-col items-start justify-start w-full relative h-auto"
      >
        <!-- <div class="w-1/2 max-w-sm">
					<h3 class="mb-8 font-medium text-lg">{{ $t('change_email') }}</h3>
					<div class="mb-10">
						<HFInput
							:pad="true"
							v-model="emailAddress"
							:value="emailAddress"
							:placeholder="$t('change_email_address')"
							type="email"
							class="mb-4"
							:error="emailValid"
						/>
						<LittleButton
							:value="$t('confirm')"
							@click.native="changeEmail"
							color="white"
						/>
					</div>
				</div> -->
        <div class="w-1/2 max-w-sm">
          <h3 class="mb-8 font-medium text-lg">{{ $t('change_password') }}</h3>
          <div class="mb-10">
            <HFInput
              v-model="currentPassword"
              :pad="true"
              :placeholder="$t('current_password')"
              type="password"
              autocomplete="current-password"
              class="mb-4"
            />
            <HFInput
              v-model="newPassword"
              :pad="true"
              :placeholder="$t('new_password')"
              type="password"
              autocomplete="new-password"
              :error="!newPasswordConfirmed"
              class="mb-4"
            />
            <HFInput
              v-model="confirmNewPassword"
              :pad="true"
              :placeholder="$t('confirm_new_password')"
              type="password"
              class="mb-4"
              autocomplete="new-password"
              :error="!newPasswordConfirmed"
            />
            <LittleButton
              :value="$t('confirm')"
              color="white"
              @click.native="changePassword"
            />
          </div>
        </div>
        <div class="w-1/2 max-w-sm">
          <h3 class="mb-8 font-medium text-lg">{{ $t('delete_account') }}</h3>
          <div class="mb-10">
            <HFInput
              v-model="password"
              :pad="true"
              :placeholder="$t('password')"
              type="password"
              autocomplete="current-password"
              class="mb-4"
            />
            <LittleButton
              :value="$t('confirm')"
              color="white"
              @click.native="deleteAccount"
            />
          </div>
        </div>
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
  currentPassword: string = '';
  newPassword: string = '';
  password: string = '';
  confirmNewPassword: string = '';

  get newPasswordConfirmed() {
    return (
      (this.newPassword === this.confirmNewPassword &&
        /[a-z]/gm.test(this.newPassword) &&
        /[A-Z]/gm.test(this.newPassword) &&
        /[0-9]/gm.test(this.newPassword) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/gm.test(this.newPassword) &&
        this.newPassword.length >= 8) ||
      this.newPassword === ''
    );
  }

  get emailValid() {
    return (
      /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm.test(this.emailAddress) ||
      this.emailAddress === ''
    );
  }

  created() {
    if (accountStore.email === null) {
      this.$router.push({
        path: '/'
      });
    }
  }

  beforeMount() {
    this.mobile = isMobile();
    this.emailAddress = accountStore.email!;
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

  async changePassword() {
    if (this.newPasswordConfirmed) {
      try {
        await this.$axios.$post(
          `${process.env.HIBERAPI_URL}/accounts/${accountStore.userId}/change-password`,
          {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
          },
          {
            headers: { authorization: `Basic ${accountStore.token}` }
          }
        );

        this.Toast({
          icon: 'info',
          iconColor: '#009BF5',
          title: this.$tc('password_modified')
        });
      } catch (e) {
        if (
          (e as AxiosError).isAxiosError &&
          (e as AxiosError).code === '401'
        ) {
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('bad_password')
          });
        } else {
          console.log(e);
          this.Toast({
            icon: 'error',
            iconColor: '#F63F3C',
            title: this.$tc('unexpected_error')
          });
        }
      }
    }
  }

  async deleteAccount() {
    try {
      await this.$axios.post(
        `${process.env.HIBERAPI_URL}/accounts/${accountStore.userId}/delete`,
        {
          password: this.password
        },
        {
          headers: { authorization: `Basic ${accountStore.token}` }
        }
      );

      this.Toast({
        icon: 'info',
        iconColor: '#009BF5',
        title: this.$tc('account_deleted')
      });

      accountStore.logOut();
      this.goToHome();
    } catch (e) {
      if ((e as AxiosError).isAxiosError && (e as AxiosError).code === '401') {
        this.Toast({
          icon: 'error',
          iconColor: '#F63F3C',
          title: this.$tc('bad_password')
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
