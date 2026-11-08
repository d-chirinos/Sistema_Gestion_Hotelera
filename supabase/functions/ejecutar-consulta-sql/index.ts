import postgres from 'postgres'
import { crearHandler } from './handler.mjs'
Deno.serve(crearHandler({ obtenerEnv: (nombre: string) => Deno.env.get(nombre), fetchImpl: fetch, conectar: (url: string) => postgres(url, { max: 1, prepare: false, connect_timeout: 5, ssl: 'verify-full' }) }))
