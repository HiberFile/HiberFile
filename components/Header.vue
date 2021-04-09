<template>
	<header class="h-content my-4 flex justify-between">
		<div class="inline-block" @click="onclicklogo">
			<Logo class="hiberfile-logo cursor-pointer" />
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
