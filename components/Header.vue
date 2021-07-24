<template>
	<header class="h-content flex justify-between items-start flex-shrink-0">
		<div class="inline-block" @click="onclicklogo">
			<Logo class="hiberfile-logo cursor-pointer" />
			<p class="font-light mt-8" style="width: 14rem">
				{{ $t('share_file_header') }}
			</p>
		</div>
		<LanguageSwitcher />
	</header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class Index extends Vue {
	@Prop({
		required: true
	})
	readonly onclicklogo: void | undefined;
}
</script>
