<template>
  <div id="root" class="overflow-hidden flex flex-col">
    <client-only>
      <!--      <DonationBanner />-->
      <Nuxt
        class="p-8 font-sans gradient-radial flex-grow text-white flex flex-col max-w-full"
        :style="{
          'min-height': mobile ? 'calc(var(--vh, 1vh) * 100)' : '',
          'overflow-y': mobile ? 'hidden' : ''
        }"
      />
    </client-only>

    <!-- make tailwind doesn't purge dark-mode -->
    <div class="dark-mode hidden"></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import isMobile from '~/assets/scripts/isMobile';

@Component
export default class Default extends Vue {
  mobile: boolean | null = null;

  beforeMount() {
    this.mobile = isMobile();
    if (this.$el) {
      document.querySelector('html')!.style.background = getComputedStyle(
        this.$el
      ).background;
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
          document.querySelector('html')!.style.background = getComputedStyle(
            this.$el
          ).background;
        });
    }
  }
}
</script>

<style>
html {
  /* font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
		Roboto, 'Helvetica Neue', Arial, sans-serif;
	font-size: 16px;
	word-spacing: 1px;
	-ms-text-size-adjust: 100%;
	-webkit-text-size-adjust: 100%;
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased; */
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  transition: 0.2s;
}

#root {
  background-image: radial-gradient(
    circle at top left,
    var(--gradient-color-stops)
  );
  @apply from-blue-500 to-blue-600;
}

select {
  @apply appearance-none;
}

.swal2-success-ring {
  border-color: #0060df !important;
}

.swal2-success-line-tip {
  background-color: #0060df !important;
}

.swal2-success-line-long {
  background-color: #0060df !important;
}

/* .button--green {
	display: inline-block;
	border-radius: 4px;
	border: 1px solid #3b8070;
	color: #3b8070;
	text-decoration: none;
	padding: 10px 30px;
}

.button--green:hover {
	color: #fff;
	background-color: #3b8070;
}

.button--grey {
	display: inline-block;
	border-radius: 4px;
	border: 1px solid #35495e;
	color: #35495e;
	text-decoration: none;
	padding: 10px 30px;
	margin-left: 15px;
}

.button--grey:hover {
	color: #fff;
	background-color: #35495e;
} */
</style>
