import base from './playwright.config.js'
export default { ...base, testMatch: 'clientes_hotel.spec.js', webServer: { ...base.webServer, env: { ...base.webServer.env, VITE_RESERVAS_LECTURA: 'true', VITE_CLIENTES_HOTEL: 'true', VITE_RESERVAS_CONOCIDOS: 'true' } } }
