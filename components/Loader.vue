<template>
	<svg
		viewBox="0 0 1024 1024"
		xmlns="http://www.w3.org/2000/svg"
		class="loader"
	>
		<path
			d="M907.781 836.809A511.995 511.995 0 0 0 1024 512h-72v.001c0 243.005-196.995 440-440 440s-440-196.995-440-440 196.995-440 440-440c121.502 0 231.502 49.248 311.126 128.872l50.913-50.912a512.004 512.004 0 0 0-646.491-63.673 511.999 511.999 0 1 0 680.233 750.521z"
			fill="#2851CC"
		></path>
	</svg>
</template>

<style scoped>
@keyframes turn {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

.loader {
	animation: turn 1s linear infinite;
}
</style>
