<template>

	<select name="language" @change="changeLanguage">
		<option value="fr">🇫🇷 FR</option>
		<option value="en">🇺🇸 EN</option>
		<option value="it">🇮🇹 IT</option>
		<option value="de">🇩🇪 DE</option>
		<option value="pt">🇵🇹 PT</option>
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