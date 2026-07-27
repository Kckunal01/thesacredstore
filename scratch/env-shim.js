// scratch/env-shim.js
globalThis.importMetaEnv = {
  VITE_SUPABASE_URL: "https://iaqumjcglwaephocqssq.supabase.co",
  VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcXVtamNnbHdhZXBob2Nxc3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDM4MDUsImV4cCI6MjA5NjY3OTgwNX0.XkUtDLkaudzjUYYm1cQB06e7MC0N5shD5r_jWaXk-H8"
};

// Hook into import.meta.env
// In ES modules, we can also define process.env.VITE_SUPABASE_URL and process.env.VITE_SUPABASE_ANON_KEY
process.env.VITE_SUPABASE_URL = "https://iaqumjcglwaephocqssq.supabase.co";
process.env.VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcXVtamNnbHdhZXBob2Nxc3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDM4MDUsImV4cCI6MjA5NjY3OTgwNX0.XkUtDLkaudzjUYYm1cQB06e7MC0N5shD5r_jWaXk-H8";
