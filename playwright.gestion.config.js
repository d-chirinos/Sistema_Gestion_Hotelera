import base from './playwright.config.js'
export default { ...base, testMatch: 'gestion.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_OPERACIONES_LECTURA: 'true', VITE_RESERVAS_LECTURA: 'true', VITE_INDICADORES_HOTEL: 'true', VITE_SALDOS_LECTURA: 'true', VITE_GESTION_HOTEL: 'true' } } }
