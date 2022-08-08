/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				ether: {
					text1: 'var(--ether-text1)',
					text2: 'var(--ether-text2)',
					text3: 'var(--ether-text3)',
					inverted: 'var(--ether-text-inverted)',
					surface1: 'var(--ether-surface1)',
					surface2: 'var(--ether-surface2)',
					surface3: 'var(--ether-surface3)',
					secondary1: 'var(--ether-color-secondary1)',
					secondary2: 'var(--ether-color-secondary2)',
				},
				'ether-common': {
					'dark1': 'var(--ether-dark1)',
					'dark1-2': 'var(--ether-dark1-2)',
					'dark2': 'var(--ether-dark2)',
					'dark3': 'var(--ether-dark3)',
					'gray-200': 'var(--ether-color-pure-neutral-200)',
				}
			},
			fontFamily: {
				magiel: ["Magiel", "sans-serif"],
				nocturn: ["Nocturn", "sans-serif"],
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': 'var(--ether-text1)',
						'--tw-prose-headings': 'var(--ether-text1)',
					}
				}
			}),
			textColor: {
				ether: {
				}
			},
			backgroundColor: {
				ether: {
				}
			},
			borderColor: {
				ether: {
				}
			},
			stroke: {
				ether: {
				}
			}
		},
	},
	darkMode: 'class',
	plugins: [
		require('@tailwindcss/typography')
	],
}
