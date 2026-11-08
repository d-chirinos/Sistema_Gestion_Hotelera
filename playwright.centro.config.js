import base from './playwright.config.js'
export default { ...base, testMatch: 'centro_consultas.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_CENTRO_SQL_IA: 'true' } } }
