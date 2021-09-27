<template>
	<div
		class="bg-blue-700 bg-opacity-25 p-1 w-8 h-4 cursor-pointer box-content rounded-full"
		:class="{ 'bg-opacity-100': switchValue }"
		@click="toggle"
	>
		<div
			class="rounded-full bg-white transform translate-x-0 w-1/2 h-full"
			style="transition: 0.2s"
			:class="{ 'translate-x-full': switchValue }"
		></div>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class HFSwitch extends Vue {
	@Prop({
		required: false
	})
	readonly onTrue: Function | undefined;

	@Prop({
		required: false
	})
	readonly onFalse: Function | undefined;

	@Prop({
		required: false
	})
	readonly value: boolean | undefined;

	switchValue: boolean | null = null;

	beforeMount() {
		this.switchValue = this.value ?? false;
	}

	toggle() {
		this.switchValue = !this.switchValue;
		this.handleInput();
	}

	handleInput() {
		this.$emit('input', this.switchValue);
	}
}
</script>
