/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./*.js"
    ],
    theme: {
        extend: {
            colors: {
                'dark-slate': '#405D72',
                'mid-slate': '#758694',
                'beige': '#F7E7DC',
                'off-white': '#FFF8F3',
            },
            fontFamily: {
                'sans': ['Inter', 'sans-serif'],
                'mono': ['Roboto Mono', 'monospace'],
            }
        },
    },
    plugins: [],
}