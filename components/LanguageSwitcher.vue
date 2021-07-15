<template>

	<select name="language" @change="changeLanguage">
		<option value="fr" :selected="language == 'fr'">🇫🇷 FR</option>
		<option value="en" :selected="language == 'en'">🇺🇸 EN</option>
		<option value="it" :selected="language == 'it'">🇮🇹 IT</option>
		<option value="de" :selected="language == 'de'">🇩🇪 DE</option>
		<option value="pt" :selected="language == 'pt'">🇵🇹 PT</option>
	</select>

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class LanguageSwitcher extends Vue {
	get language() {
		return this.$i18n.locale;
	}

	changeLanguage(event: Event) {
		this.$i18n.setLocale((event.target as HTMLSelectElement).value);
	}
	
}
</script>
<style lang="scss" scoped>
	select {
		background: none;
		outline: none;
		border: none;
	}
</style>