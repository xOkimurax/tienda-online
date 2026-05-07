import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  profile: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  register: async ({ email, password, fullName }) => {
    // Check if email already exists before trying to register
    const { data: existsData, error: existsError } = await supabase
      .rpc('check_email_exists', { email_to_check: email })

    if (!existsError && existsData === true) {
      throw new Error('Este email ya está registrado. Iniciá sesión o usá otro email.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}`,
      },
    })
    if (error) {
      if (error.message?.toLowerCase().includes('already registered')) {
        throw new Error('Este email ya está registrado. Iniciá sesión o usá otro email.')
      }
      throw error
    }
    return data
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  checkEmailVerified: () => {
    const { user } = get()
    if (!user) return false
    return !!(
      user.email_confirmed_at ||
      user.confirmed_at ||
      user.identities?.[0]?.identity_data?.email_verified
    )
  },

  resendVerification: async (email) => {
    const { error } = await supabase.auth.resend({
      email,
      type: 'signup',
    })
    if (error) throw error
  },

  isAdmin: () => {
    const { user, profile } = get()
    return profile?.role === 'admin'
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return null
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    set({ profile: data })
    return data
  },

  clearProfile: () => set({ profile: null }),

  fetchSession: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: false })
    if (session?.user) {
      await get().fetchProfile()
    }
  },
}))

export default useAuthStore
