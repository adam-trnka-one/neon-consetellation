import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Null when env vars are absent — the app runs fine, the leaderboard
// just renders its "not configured" state.
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null

export const leaderboardConfigured = supabase !== null
