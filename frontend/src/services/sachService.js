import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:3000/api/sach';

// ================= Tạo headers Authorization =================
const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ================= Lấy danh sách tất cả sách =================
export const getSaches = async () => {
  try {
    const res = await axios.get(API_URL, { headers: authHeaders() });
    return res.data;
  } catch (err) {
    console.error('Lỗi getSaches:', err.response?.data || err.message);
    throw err;
  }
};

// ================= Thêm sách =================
export const addSach = async (formData) => {
  try {
    const res = await axios.post(API_URL, formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi addSach:', err.response?.data || err.message);
    throw err;
  }
};

// ================= Cập nhật toàn bộ sách =================
export const updateSach = async (idOrMa, formData) => {
  try {
    const res = await axios.put(`${API_URL}/${idOrMa}`, formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi updateSach:', err.response?.data || err.message);
    throw err;
  }
};

// ================= Xóa sách =================
export const deleteSach = async (idOrMa) => {
  try {
    const res = await axios.delete(`${API_URL}/${idOrMa}`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error('Lỗi deleteSach:', err.response?.data || err.message);
    throw err;
  }
};

// ================= Cập nhật số lượng sách =================
export const updateSoQuyen = async (MaSach, delta) => {
  try {
    const res = await axios.patch(
      `${API_URL}/${MaSach}/updateSoQuyen`,
      { delta },
      { headers: authHeaders() }
    );
    return res.data;
  } catch (err) {
    console.error('Lỗi updateSoQuyen:', err.response?.data || err.message);
    throw err;
  }
};

// ================= Lấy sách theo Mã hoặc ID =================
export const getSachByMa = async (idOrMa) => {
  try {
    const res = await axios.get(`${API_URL}/${idOrMa}`, { headers: authHeaders() });
    return res.data;
  } catch (err) {
    console.error('Lỗi getSachByMa:', err.response?.data || err.message);
    throw err;
  }
};
