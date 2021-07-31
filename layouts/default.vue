<template>
	<div id="root" class="overflow-hidden">
		<client-only>
			<Nuxt />
		</client-only>

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

select {
	background: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h24v24H0z%22%2F%3E%3Cpath%20d%3D%22M12%2015l-4.243-4.243%201.415-1.414L12%2012.172l2.828-2.829%201.415%201.414z%22%20fill%3D%22rgba(40%2C81%2C204%2C1)%22%2F%3E%3C%2Fsvg%3E')
		no-repeat 95% 50%;
	padding-right: 20px;
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
