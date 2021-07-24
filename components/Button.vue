<template>
	<p
		class="outline-none bg-opacity-0 bg-white text-blue-700 underline text-center cursor-pointer font-medium w-auto text-lg"
	>
		{{ value }}
	</p>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Button extends Vue {
	@Prop({
		required: true
	})
	readonly value: string | undefined;
}
</script>
