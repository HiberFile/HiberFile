<template>
	<div class="cursor-pointer text-grey-600 text-xs font-medium h-content">
		<p v-if="language == 'fr'" @click="changeLanguage('en')">🇺🇸 EN</p>
		<p v-else-if="language == 'en'" @click="changeLanguage('it')">🇮🇹 IT</p>
		<p v-else-if="language == 'it'" @click="changeLanguage('de')">🇫🇷 FR</p>
		<p v-else-if="language == 'de'" @click="changeLanguage('pt')">🇩🇪 DE</p>
		<p v-else-if="language == 'pt'" @click="changeLanguage('fr')">🇩🇪 DE</p>
	</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class LanguageSwitcher extends Vue {
	get language() {
		return this.$i18n.locale;
	}

	changeLanguage(language: string) {
		this.$i18n.setLocale(language);
	}
}
</script>
