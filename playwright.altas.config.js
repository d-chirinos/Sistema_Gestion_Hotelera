import base from './playwright.config.js'
export default { ...base, testMatch: 'altas.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_ALTAS_CATALOGO: 'true' } } }
