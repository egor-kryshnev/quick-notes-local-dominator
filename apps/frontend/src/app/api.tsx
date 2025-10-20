import axios from 'axios';

export const api = axios.create({
  baseURL: (window as any).__ENV__?.VITE_API_URL || import.meta.env.VITE_API_URL
});

export const setToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};