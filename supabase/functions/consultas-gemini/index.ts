import { crearHandler } from './handler.mjs'

Deno.serve(crearHandler({ obtenerEnv: (nombre: string) => Deno.env.get(nombre), fetchImpl: fetch }))
