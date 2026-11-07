import { createClient } from '@supabase/supabase-js'
import { esClavePublica } from './configuracion.js'

const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Esta comprobación evita configurar accidentalmente claves privilegiadas; RLS sigue siendo esencial.
function crearCliente() {
  if (!url || !esClavePublica(clave)) return null
  try {
    const destino = new URL(url)
    if (destino.protocol !== 'https:' && !(['localhost', '127.0.0.1'].includes(destino.hostname) && destino.protocol === 'http:')) return null
    return createClient(url, clave)
  } catch { return null }
}

export const supabase = crearCliente()
