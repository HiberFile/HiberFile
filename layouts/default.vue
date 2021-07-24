<template>
	<div id="root" class="overflow-hidden">
		<Nuxt />

		<!-- make tailwind doesn't purge dark-mode -->
		<div class="dark-mode hidden"></div>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Default extends Vue {
	beforeMount() {
		if (this.$el) {
			document.querySelector('html')!.style.background = getComputedStyle(
				this.$el
			).background;
			window
				.matchMedia('(prefers-color-scheme: dark)')
				.addEventListener('change', (e) => {
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
}

#root {
	background-image: radial-gradient(
		circle at top left,
		var(--gradient-color-stops)
	);
	@apply from-blue-500 to-blue-600;
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
