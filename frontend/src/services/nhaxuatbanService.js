import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:3000/api/nhaxuatban';

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNXBs = () => axios.get(API_URL, { headers: getAuthHeaders() });
export const addNXB = (data) => axios.post(API_URL, data, { headers: getAuthHeaders() });
export const updateNXB = (id, data) => axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeaders() });
export const deleteNXB = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
