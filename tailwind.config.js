
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        screens: {
            '2xl': {'min': '2101px'}, 
            '3xl': {'min': '2561px'}, // bigger
            // << DEFAULT BREAKPOINT >>
            'xl':  {'max': '1799px'}, // smaller
            '2lg': {'max': '1535px'}, 
            'lg':  {'max': '1279px'},
            'md':  {'max': '1023px'},
            'sm':  {'max': '767px'}, 
            'xs':  {'max': '575px'},
            '2xs': {'max': '440px'},
        },
        extend: {
            colors: {
                gray: '#272727',
                dark: '#0C0C0C',
                accentgray: '#131313'
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.text-vertical': {
                    'writing-mode': 'vertical-lr'
                },
                '.text-horizontal': {
                    'writing-mode': 'horizontal-tb'
                },
                '.scrollbar-stable': {
                    'scrollbar-gutter': 'stable var(--tw-scrollbar-gutter-modifier)',
                },
            })
        },
    ],
    darkMode: ['selector', '[data-mode="dark"]'],
}

