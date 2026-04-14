import axios from 'axios';
import type { AuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/login`, { email, password });
  return response.data;
}
