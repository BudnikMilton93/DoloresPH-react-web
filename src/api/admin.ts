import axios from 'axios';
import type { Section, Photo, Essay } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function toggleSection(id: number, data: Partial<Section>, token: string): Promise<Section> {
  const response = await axios.patch<Section>(`${API_URL}/api/sections/${id}`, data, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function uploadPhoto(formData: FormData, token: string): Promise<Photo> {
  const response = await axios.post<Photo>(`${API_URL}/api/photos`, formData, {
    headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function patchPhoto(id: number, data: Partial<Photo>, token: string): Promise<Photo> {
  const response = await axios.patch<Photo>(`${API_URL}/api/photos/${id}`, data, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function createEssay(data: Partial<Essay>, token: string): Promise<Essay> {
  const response = await axios.post<Essay>(`${API_URL}/api/essays`, data, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function patchEssay(id: number, data: Partial<Essay>, token: string): Promise<Essay> {
  const response = await axios.patch<Essay>(`${API_URL}/api/essays/${id}`, data, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function patchContent(key: string, value: string, token: string): Promise<{ key: string; value: string }> {
  const response = await axios.patch<{ key: string; value: string }>(`${API_URL}/api/content/${key}`, { value }, {
    headers: authHeader(token),
  });
  return response.data;
}

export async function deletePhoto(id: number, token: string): Promise<void> {
  await axios.delete(`${API_URL}/api/photos/${id}`, {
    headers: authHeader(token),
  });
}

export async function deleteEssay(id: number, token: string): Promise<void> {
  await axios.delete(`${API_URL}/api/essays/${id}`, {
    headers: authHeader(token),
  });
}
