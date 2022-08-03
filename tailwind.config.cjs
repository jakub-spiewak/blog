/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				magiel: ["Magiel", "sans-serif"],
				nocturn: ["Nocturn", "sans-serif"],
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': 'var(--color-text-base)',
						'--tw-prose-headings': 'var(--color-text-base)',
					}
				}
			}),
			textColor: {
				skin: {
					base: 'var(--color-text-base)',
					muted: 'var(--color-text-muted)',
					inverted: 'var(--color-text-inverted)',
					accent: 'var(--color-text-accent)',
				}
			},
			backgroundColor: {
				skin: {
					main: 'var(--color-bg-main)',
					'main-muted': 'var(--color-bg-main-muted)',
					'main-inverted': 'var(--color-bg-main-inverted)',
					'main-accent': 'var(--color-bg-main-accent)',
				}
			},
			borderColor: {
				skin: {
					main: 'var(--color-border-main)',
					'main-inverted': 'var(--color-border-main-inverted)',
					accent: 'var(--accent)',
				}
			}
		},
	},
	darkMode: 'class',
	plugins: [require('@tailwindcss/typography')],
}
