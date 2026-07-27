import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zkkccikiahfkrrzwrlzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra2NjaWtpYWhma3JyendybHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTIzMjgsImV4cCI6MjA5OTgyODMyOH0.8D1EXfQ5YiHtR0ghfDYfkDzQKcDDJFnvJgarc3jXc6U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mismo helper que usa Auth.jsx para generar el correo interno a partir
// del teléfono (Supabase Auth requiere un email por dentro, aunque el
// usuario nunca lo ve ni lo usa).
export function phoneToInternalEmail(phone) {
  const clean = (phone || '').replace(/\D/g, '');
  return `tel${clean}@vadia.app`;
}
