import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://htaaqofifqzhwqldezgu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YWFxb2ZpZnF6aHdxbGRlemd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDc0NDUsImV4cCI6MjA5MzYyMzQ0NX0.kXB-Hdr4F8VSmwpLghHauZLmy5lsdSMVlz3ot3DbNzU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
 * Site URL para verificación de email:
 * Configurar en Supabase Dashboard → Authentication → URL Configuration → Site URL:
 *   - Dev:  http://localhost:3001 (o el puerto del frontend)
 *   - Prod: URL real de producción
 * El redirect en signUp usa emailRedirectTo para apuntar a /verify-email correctamente.
 */