import base from './playwright.config.js'
export default { ...base, testMatch: 'consumos_mantenimiento.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_OPERACIONES_LECTURA: 'true', VITE_OPERACIONES_ESCRITURA: 'true' } } }
