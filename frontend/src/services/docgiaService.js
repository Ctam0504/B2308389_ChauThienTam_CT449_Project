import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:3000/api/docgia';
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

// Lấy tất cả độc giả
export const getDocgias = () => axios.get(API_URL, { headers: headers() });

// Thêm độc giả
export const addDocgia = (data) => axios.post(API_URL, data, { headers: headers() });

// Cập nhật độc giả theo MaDocGia
export const updateDocgia = (MaDocGia, data) =>
  axios.put(`${API_URL}/${encodeURIComponent(MaDocGia)}`, data, { headers: headers() });

// Xóa độc giả theo MaDocGia
export const deleteDocgia = (MaDocGia) =>
  axios.delete(`${API_URL}/${encodeURIComponent(MaDocGia)}`, { headers: headers() });

// Lấy độc giả theo MaDocGia
export const getDocgiaByMa = (MaDocGia) =>
  axios.get(`${API_URL}/${encodeURIComponent(MaDocGia)}`, { headers: headers() });
