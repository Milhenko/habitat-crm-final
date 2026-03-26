import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knstfqojgyerymnrphgf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuc3RmcW9qZ3llcnltbnJwaGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTI1MjgsImV4cCI6MjA4OTg2ODUyOH0.hOYUeUj-aRKzUFcrZFGYyZGln7GbNeOBFuoWwZ7kvQM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)