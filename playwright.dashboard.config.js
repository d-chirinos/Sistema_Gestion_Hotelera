import base from './playwright.config.js'
export default { ...base, testMatch: 'dashboard.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_RESERVAS_LECTURA: 'true', VITE_OPERACIONES_LECTURA: 'true', VITE_INDICADORES_HOTEL: 'true' } } }
