import postgres from 'postgres'
import { crearHandler } from './handler.mjs'
import { crearConexionLectura } from './conexion.mjs'
Deno.serve(crearHandler({ obtenerEnv: (nombre: string) => Deno.env.get(nombre), fetchImpl: fetch, conectar: (url: string) => crearConexionLectura(url, postgres) }))
