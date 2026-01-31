import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gjgikzgmchertumsmxhp.supabase.co';
// Nota: Em produção, utilize variáveis de ambiente (import.meta.env.VITE_SUPABASE_KEY)
const supabaseKey = 'sb_publishable_Odd8peYJ4wAe_EC7pe1BdA_ido0HeHh';

export const supabase = createClient(supabaseUrl, supabaseKey);