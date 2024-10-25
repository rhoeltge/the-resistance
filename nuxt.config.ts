// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    'nuxt-icon',
    '@nuxtjs/seo',
    '@nuxtjs/supabase',
  ],

  site: {
    siteUrl: 'https://widerstand.ruwenhoeltge.de/',
    name: 'Widerstand',
    description: 'Widerstand Kartenspiel',
    defaultLocale: 'de',
  },

  css: [
    '~/assets/css/fonts.css',
  ],

  imports: {
    dirs: ['helpers', 'store', 'composables'],
  },

  supabase: {
    redirect: false,
  },

  compatibilityDate: '2024-10-22',
})
