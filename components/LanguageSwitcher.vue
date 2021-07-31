<template>
	<select name="language" @change="changeLanguage">
		<option value="en" :selected="language == 'en'">🇺🇸 English</option>
		<option value="fr" :selected="language == 'fr'">🇫🇷 Français</option>
		<option value="it" :selected="language == 'it'">🇮🇹 Italiano</option>
		<option value="de" :selected="language == 'de'">🇩🇪 Deutsch</option>
		<option value="pt" :selected="language == 'pt'">🇵🇹 Português</option>
		<option value="es" :selected="language == 'es'">🇪🇸 Español</option>
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

<style scoped>
select {
	background: none;
	outline: none;
	border: none;
	text-align-last: right;
}

option {
	color: black;
}
</style>
