const plugin = require('tailwindcss/plugin');

module.exports = {
	future: {
		purgeLayersByDefault: true
	},
	purge: {
		enabled: process.env.NODE_ENV === 'production',
		content: [
			'components/**/*.vue',
			'layouts/**/*.vue',
			'pages/**/*.vue',
			'plugins/**/*.js',
			'nuxt.config.js',
			// TypeScript
			'plugins/**/*.ts',
			'nuxt.config.ts'
		],
		options: {
			safelist: ['dark-mode']
		}
	},
	theme: {
		darkSelector: '.dark-mode',
		backgroundImage: {
			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
		},
		height: {
			content: 'min-content',
			12: '3rem',
			1: '0.25rem',
			4: '1rem',
			8: '2rem',
			full: '100%',
			auto: 'auto'
		},
		maxHeight: {
			144: '36rem',
			160: '40rem',
			full: '100%'
		},
		boxShadow: {
			xl:
				'0 12px 18px 2px rgb(0 12 51 / 4%), 0 6px 22px 4px rgb(7 27 114 / 12%), 0 6px 10px -4px rgb(14 13 26 / 12%)'
		},
		fontFamily: {
			sans: [
				'Poppins',
				'Inter',
				'system-ui',
				'-apple-system',
				'Segoe UI',
				'Roboto',
				'Ubuntu',
				'Cantarell',
				'Noto Sans',
				'sans-serif',
				'BlinkMacSystemFont',
				'Oxygen',
				'Fira Sans',
				'Droid Sans',
				'Helvetica Neue'
			]
		},
		colors: {
			white: '#ffffff',
			black: '#000000',
			grey: {
				100: '#dae1e7',
				300: '#b1b1b3',
				500: '#8795a1',
				600: '#606f7b',
				700: '#4a4a4f',
				800: '#2a2a2e',
				900: '#0c0c0d'
			},
			blue: {
				500: '#009BF5',
				600: '#2D56D5',
				700: '#2851CC'
			}
		}
	},
	variants: {
		backgroundColor: ['dark', 'hover', 'responsive'],
		borderColor: ['dark'],
		borderWidth: ['dark', 'responsive'],
		borderRadius: ['responsive'],
		textColor: ['dark'],
		padding: ['responsive']
	},
	darkMode: 'class',
	plugins: [
		require('tailwindcss-dark-mode')(),
		plugin(function ({ addVariant, e }) {
			addVariant('dragover', ({ modifySelectors, separator }) => {
				modifySelectors(({ className }) => {
					return `.${e(`.dragover dragover${separator}${className}`)}, .${e(
						`.dragover`
					)}`;
				});
			});
		})
	]
};
