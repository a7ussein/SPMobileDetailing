import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://soecushkmducbdkqomyc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SqmxQ1QmLsIO1aeHqJsevQ_DK852P-E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
