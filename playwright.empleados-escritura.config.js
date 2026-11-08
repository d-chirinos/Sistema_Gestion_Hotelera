import base from './playwright.empleados.config.js'
export default { ...base, testMatch: 'empleados_escritura.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_ESCRITURA_EMPLEADOS: 'true' } } }
