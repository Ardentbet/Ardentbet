import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "sb_publishable_FEYBO0K-ma5HNXs3f0mk1g_fjKETUJw";
const supabaseKey = "sb_secret_yrnDpnPe_j5o3N3FymXngA_d3FoKxGA";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);