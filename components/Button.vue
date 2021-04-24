<template>
	<input
		type="button"
		:value="value"
		class="outline-none rounded-2xl flex justify-center items-center mt-2 py-4 px-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium w-auto"
	/>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Button extends Vue {
    @Prop({
		required: true
	})
	readonly value: string | undefined;
}
</script>