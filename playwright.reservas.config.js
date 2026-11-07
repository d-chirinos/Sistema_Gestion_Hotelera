import base from './playwright.config.js'

export default {
  ...base,
  testMatch: 'reservas.spec.js',
  webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_RESERVAS_LECTURA: 'true' } },
}
