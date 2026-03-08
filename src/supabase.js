/**
 * Supabase client — shared across tabs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yhntwgjzrzyhyxpiqcts.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobnR3Z2p6cnp5aHl4cGlxY3RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Mjc2ODMsImV4cCI6MjA4ODEwMzY4M30.HhTEKmSQs-qaOhoQr4cJxRfTfpWEjGqB3TwQnRWCm4Y'

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON)
