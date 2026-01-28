import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                candela: {
                    orange: '#FF6B35',
                    black: '#0D0D0D',
                    white: '#FAFAFA',
                    gray: '#2A2A2A',
                    muted: '#6B6B6B',
                },
                verdict: {
                    verified: '#22C55E',
                    partial: '#EAB308',
                    misleading: '#F97316',
                    false: '#EF4444',
                    unknown: '#6B7280',
                }
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

export default config
