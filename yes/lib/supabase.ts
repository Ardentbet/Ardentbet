import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://puclsqxffebruxevdibl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Y2xzcXhmZmVicnV4ZXZkaWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTYyMTYsImV4cCI6MjA5NTQ3MjIxNn0._Y_UH2BMQWrJrA8RvM-LbTnaGFwhC_dIbNzpHRVYc-U";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);