export default {
	// Target (https://go.nuxtjs.dev/config-target)
	target: 'server',

	// ssr: false,

	server: {
		port: 8000, // default: 3000
		host: '0.0.0.0' // default: localhost
	},

	// Global page headers (https://go.nuxtjs.dev/config-head)
	head: {
		title: 'HiberFile',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{
				hid: 'description',
				name: 'description',
				content:
					'HiberFile - Service de partage de fichiers rapide, simple et gratuit.'
			}
		],
		script: [
			{
				src: 'matomo.js'
			}
		],
		link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
		noscript: [
			{
				innerHTML: 'HiberFile needs scripts to be enabled to work.',
				body: true
			}
		]
	},

	// Global CSS (https://go.nuxtjs.dev/config-css)
	css: ['@/assets/css/fonts.css'],

	// Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
	plugins: [],

	// Auto import components (https://go.nuxtjs.dev/config-components)
	components: true,

	// Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
	buildModules: [
		// https://go.nuxtjs.dev/typescript
		'@nuxt/typescript-build',
		// https://go.nuxtjs.dev/stylelint
		'@nuxtjs/stylelint-module',
		// https://go.nuxtjs.dev/tailwindcss
		'@nuxtjs/tailwindcss',
		// https://color-mode.nuxtjs.org/
		'@nuxtjs/color-mode'
	],

	// Modules (https://go.nuxtjs.dev/config-modules)
	modules: [
		// https://go.nuxtjs.dev/axios
		'@nuxtjs/axios',
		// https://go.nuxtjs.dev/pwa
		'@nuxtjs/pwa',
		// https://github.com/nuxt-community/dotenv-module
		'@nuxtjs/dotenv',
		// https://www.npmjs.com/package/vue-sweetalert2
		'vue-sweetalert2/nuxt',
		// https://i18n.nuxtjs.org/
		'nuxt-i18n'
	],

	// Axios module configuration (https://go.nuxtjs.dev/config-axios)
	axios: {},

	// i18n module configuration (https://i18n.nuxtjs.org/options-reference)
	i18n: {
		locales: [
			{ code: 'en', iso: 'en-US', file: 'en.js', dir: 'ltr' },
			{ code: 'fr', iso: 'fr-FR', file: 'fr.js' },
			{ code: 'it', iso: 'it-IT', file: 'it.js' },
			{ code: 'de', iso: 'de-DE', file: 'de.js' },
			{ code: 'pt', iso: 'pt-PT', file: 'pt.js' }
		],
		lazy: true,
		langDir: './locales/',
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_redirected',
			onlyOnRoot: true
		},
		defaultLocale: 'fr'
	},

	// Build Configuration (https://go.nuxtjs.dev/config-build)
	build: {},

	// PWA Configuration (https://pwa.nuxtjs.org/)
	pwa: {
		meta: {
			name: 'HiberFile',
			author: 'HiberFile',
			description: '',
			theme_color: '#0060df',
			mobileAppIOS: true
		},
		manifest: {
			name: 'HiberFile',
			short_name: 'HiberFile',
			description: ''
		}
	}
};
