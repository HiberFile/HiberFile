<template>
	<footer class="my-12 text-grey-500 font-semibold">
		<nuxt-link :to="localePath('/mentions')" class="text-xs"
			><u>{{ $t('legal_notice') }}</u> | © 2021 HiberFile Team | v2021.1</nuxt-link
		>
	</footer>
</template>
