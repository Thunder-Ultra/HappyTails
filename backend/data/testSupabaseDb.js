// Load environment variables from .env
require("dotenv").config({ path: "./supabaseCredintials.env", quiet: true });

// Import Supabase client using CommonJS require
const { createClient } = require("@supabase/supabase-js");

// Read values from environment variables
const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Create the Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey, { db: "happytails" });

// Export or use the client
module.exports = supabase;
