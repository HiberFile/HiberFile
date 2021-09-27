<template>
	<main
		class="max-w-full md:max-w-none"
		style="width: 28rem; min-height: 20rem"
	>
		<div
			class="w-full inline-block rounded-3xl shadow-xl h-full p-4 md:max-h-160 md:min-h-144 bg-white"
		>
			<slot></slot>
		</div>
	</main>
</template>

<style scoped>
main {
	@media (min-width: 768px) {
		min-width: fit-content;
	}
}
</style>
