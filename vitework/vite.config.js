import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        card: resolve(__dirname, 'html/card.html'),
        deck: resolve(__dirname, 'html/deck.html'),
        loginPage: resolve(__dirname, 'html/loginPage.html'),
        play: resolve(__dirname, 'html/play.html'),
        profile: resolve(__dirname, 'html/profile.html'),
        grINDEX: resolve(__dirname, 'gameRoom/index.html'),

      },
    },
  },
  
})