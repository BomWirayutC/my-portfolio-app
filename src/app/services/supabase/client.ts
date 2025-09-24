import { createBrowserClient } from "@supabase/ssr"

export const SUPABASE_DB_URL: string = "https://iotwlprsgduofjzickdl.supabase.co";
export const SUPABASE_DB_KEY: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHdscHJzZ2R1b2Zqemlja2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODI5MTUsImV4cCI6MjA3MjQ1ODkxNX0.YG8eZ6vCyZb5Ym7tG-kwVlow-jnSDVuwDEa1urUYwa4";

export const supabase = createBrowserClient(SUPABASE_DB_URL, SUPABASE_DB_KEY);