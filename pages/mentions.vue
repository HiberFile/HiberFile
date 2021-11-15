<template>
	<div
		class="p-8 font-sans gradient-radial flex-grow min-h-screen text-white flex flex-col max-w-full"
	>
		<Header :onclicklogo="goToHome" />
		<main>
			<div>
				<h1 class="text-center text-3xl font-bold mt-8">
					{{ $t('legal_notice') }} - HiberFile
				</h1>
				<p class="mt-2 text-center">{{ $t('version') }}</p>
				<div class="py-8 md:px-12">
					<p class="leading-normal">
						<span>{{ $t('what_you_should_know') }}</span>
					</p>
					<ul class="mt-6 leading-normal list-disc px-8">
						<li class="mb-4">
							<b>{{ $t('data') }}</b
							>{{ $t('data_content') }}
						</li>
						<li class="mb-4">
							<b>{{ $t('personal_data') }}</b
							>{{ $t('personal_data_phrase') }}
							<ul>
								<li>
									<u>{{ $t('ip_adress') }}</u>
									{{ $t('ip_adress_content') }}
								</li>
								<li>
									<u>{{ $t('cookies') }}</u>
									{{ $t('cookies_content') }}
								</li>
								<li>
									<u>{{ $t('to_note') }}</u
									>{{ $t('to_note_content') }}
								</li>
							</ul>
						</li>
						<li class="mb-4">
							<b>{{ $t('price') }}</b
							>{{ $t('price_content') }}
						</li>
						<li class="mb-4">
							<b>{{ $t('third_party') }}</b
							><i18n path="third_party_content" tag="span">
								<template v-slot:Scaleway>
									<a href="https://www.scaleway.com"><u>Scaleway</u></a>
								</template>
								<template v-slot:Matomo>
									<a href="https://fr.matomo.org/"><u>Matomo</u></a>
								</template>
								<template v-slot:S3>
									<a href="https://www.scaleway.com/fr/object-storage/"
										><u>Amazon S3</u></a
									>
								</template>
							</i18n>
						</li>
						<li class="mb-4">
							<b>{{ $t('support') }}</b
							><i18n path="support_content" tag="span">
								<template v-slot:mail>
									<a href="mailto:hiberfile@hiberfile.com"
										><u>hiberfile@hiberfile.com</u></a
									>
								</template>
								<template v-slot:twitter>
									<a href="https://twitter.com/hiberfile"><u>@HiberFile</u></a>
								</template>
							</i18n>
						</li>
						<li class="mb-4">
							<b>{{ $t('host_legal_notice') }}</b
							><i18n path="host_legal_notice_content" tag="span">
								<template v-slot:legal_notice>
									<a href="https://www.scaleway.com/fr/mentions-legales"
										><u>{{ $t('scaleway_legal_notice') }}</u></a
									>
								</template>
							</i18n>
						</li>
					</ul>
				</div>
			</div>
		</main>
		<Footer />
	</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Mentions extends Vue {
	goToHome() {
		window.open("https://www.hiberfile.com","_self");
	}
}
</script>

<style>
.card-content {
	display: block !important;
}

.hiberfile-logo {
	width: 89px;
	height: auto;
}
</style>
