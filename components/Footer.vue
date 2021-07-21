<template>
	<footer
		class="my-12 text-grey-500 font-semibold flex flex-row justify-between"
	>
		<nuxt-link :to="localePath('/mentions')" class="text-xs"
			><u>{{ $t('legal_notice') }}</u> | © 2021 HiberFile Team |
			v2021.1</nuxt-link
		>
		<a href="https://blog.hiberfile.com/" class="text-xs underline">Blog</a>
	</footer>
</template>
