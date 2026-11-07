import base from './playwright.config.js'
export default { ...base, testMatch: 'primera_reserva.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_RESERVAS_LECTURA: 'true', VITE_PRIMERA_RESERVA: 'true' } } }
