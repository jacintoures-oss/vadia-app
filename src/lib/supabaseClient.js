import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkkccikiahfkrrzwrlzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra2NjaWtpYWhma3JyendybHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTIzMjgsImV4cCI6MjA5OTgyODMyOH0.8D1EXfQ5YiHtR0ghfDYfkDzQKcDDJFnvJgarc3jXc6U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
