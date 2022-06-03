import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1200,
  viewportHeight: 800,
  video: false,
  chromeWebSecurity: false,
  numTestsKeptInMemory: 0,
  defaultCommandTimeout: 15000,
  retries: 2,
  pageLoadTimeout: 15000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:3000',
  },
});
