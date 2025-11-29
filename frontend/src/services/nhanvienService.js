import axios from 'axios';
import { getToken } from './authService';
const API_URL = 'http://localhost:3000/api/nhanvien';
const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNhanVienMe = () => axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
export const getNhanViens = () => axios.get(API_URL, { headers: getAuthHeaders() });
export const addNhanVien = (data) => axios.post(API_URL, data, { headers: getAuthHeaders() });
export const updateNhanVien = (id, data) => axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeaders() });
export const deleteNhanVien = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
