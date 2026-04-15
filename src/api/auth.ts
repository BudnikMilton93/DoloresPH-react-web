import { supabase } from '../lib/supabase';
import type { AuthResponse } from '../types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(error?.message ?? 'Credenciales inválidas');
  return { token: data.session.access_token };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
