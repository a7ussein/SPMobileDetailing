import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vhlahndcjmtvbbrkvogd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2BcsetiSo-Idn1pWu3ePRQ_lBQtHUYR";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
