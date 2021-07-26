<template>
	<header
		class="h-content flex justify-between items-start flex-shrink-0"
		style="width: calc(100% - 4rem)"
	>
		<div class="inline-block" @click="onclicklogo">
			<Logo class="hiberfile-logo cursor-pointer" />
			<p class="font-light mt-8" style="width: 14rem" v-if="!mobile">
				{{ $t('share_file_header') }}
			</p>
		</div>
		<LanguageSwitcher />
	</header>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator';
import isMobile from '~/assets/scripts/isMobile';

@Component
export default class Header extends Vue {
	@Prop({ required: true })
	readonly onclicklogo: void | undefined;
	mobile: boolean | null = null;

	beforeMount() {
		this.mobile = isMobile();
	}
}
</script>
