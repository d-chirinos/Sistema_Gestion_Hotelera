import base from './playwright.config.js'
export default { ...base, testMatch: 'escrituras.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_OPERACIONES_LECTURA: 'true', VITE_PAGOS_ESCRITURA: 'true', VITE_ESTADIAS_ESCRITURA: 'true', VITE_PRECIOS_ESCRITURA: 'true' } } }
