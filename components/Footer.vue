<template>
	<footer class="text-white flex flex-row justify-end flex-shrink-0">
		<div class="text-right font-light text-xs">
			<a href="https://blog.hiberfile.com/" class="underline">Blog</a>
			<div class="block">
				<a
					:href="
						commitSha !== undefined
							? `https://github.com/hiberfile/hiberfile/commit/${commitSha}`
							: ''
					"
					target="_blank"
					>v2021.2</a
				>
				- © 2021 HiberFile Team -
				<nuxt-link :to="localePath('/mentions')">
					<u>{{ $t('legal_notice') }}</u></nuxt-link
				>
			</div>
		</div>
	</footer>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class Footer extends Vue {
	get commitSha() {
		return process.env.NUXT_ENV_CURRENT_GIT_SHA;
	}
}
</script>
