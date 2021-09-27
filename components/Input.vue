<template>
	<div class="w-full border-blue-700 border-b">
		<input
			type="text"
			class="text-base font-light text-blue-700 outline-none w-full"
			@change="handleInput"
			:value="value"
			:placeholder="placeholder"
			:aria-placeholder="placeholder"
		/>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Input extends Vue {
	@Prop()
	readonly placeholder: string | undefined;

	@Prop()
	readonly value: string | undefined;

	get inputValue() {
		return (this.$el.querySelector('input') as HTMLInputElement).value;
	}

	handleInput() {
		this.$emit('input', this.inputValue);
	}
}
</script>

<style scoped>
input::placeholder {
	@apply text-blue-700 text-opacity-50;
}
</style>
