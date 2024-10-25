const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,vue,ts}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/plugins/**/*.{js,ts}',
    './src/locales/*.{json,yaml}',
    './src/*.vue',
    './src/app.config.{js,ts}',
    './nuxt.config.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        logo: ['PirataOne', ...defaultTheme.fontFamily.sans],
        sans: ['SpaceMono', ...defaultTheme.fontFamily.sans],
      },
      screens: {
        xs: '500px',
      },
      maxWidth: {
        'screen-sm': '540px',
        'screen-md': '668px',
        'screen-lg': '980px',
        'screen-xl': '1180px',
        'screen-2xl': '1320px', // 1320px
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
