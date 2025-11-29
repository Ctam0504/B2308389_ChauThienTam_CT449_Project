import axios from 'axios';
import { getToken } from './authService';

const API_URL = 'http://localhost:3000/api/theodoimuonsach';

// Tạo header có token
const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ================= Helper chuyển dữ liệu =================
const formatTheodoi = (td) => ({
  _id: td._id,
  MaDocGia: td.MaDocGia,
  MaSach: td.MaSach != null ? String(td.MaSach) : null,
  NgayMuon: td.NgayMuon ? new Date(td.NgayMuon) : null,
  NgayTra: td.NgayTra ? new Date(td.NgayTra) : null,
  DaTra: Boolean(td.DaTra),
  DaDuyet: Boolean(td.DaDuyet || false)
});

// ================= Lấy tất cả phiếu mượn (admin) =================
export const getAllTheodois = async () => {
  const res = await axios.get(`${API_URL}/all`, { headers: authHeaders() });
  return (res.data || []).map(formatTheodoi);
};

// ================= Lấy phiếu mượn của một độc giả =================
export const getTheodois = async (MaDocGia) => {
  if (!MaDocGia) throw new Error("MaDocGia không được để trống!");
  const res = await axios.get(API_URL, {
    headers: authHeaders(),
    params: { MaDocGia }
  });
  return (res.data || []).map(formatTheodoi).filter(td => !td.DaTra);
};

// ================= Thêm phiếu mượn mới =================
export const addTheodoi = async (data) => {
  if (!data.MaDocGia || !data.MaSach || !data.NgayMuon)
    throw new Error("Thiếu dữ liệu bắt buộc (MaDocGia, MaSach, NgayMuon)!");
  
  const payload = {
    MaDocGia: data.MaDocGia,
    MaSach: data.MaSach,
    NgayMuon: new Date(data.NgayMuon).toISOString(),
    NgayTra: data.NgayTra ? new Date(data.NgayTra).toISOString() : null,
    DaDuyet: false
  };

  const res = await axios.post(API_URL, payload, { headers: authHeaders() });
  return formatTheodoi(res.data);
};

// ================= Trả sách =================
export const returnSach = async (id) => {
  if (!id) throw new Error("ID phiếu mượn không được để trống!");
  const payload = {
    DaTra: true,
    NgayTra: new Date().toISOString(),
  };
  const res = await axios.put(`${API_URL}/${id}`, payload, { headers: authHeaders() });
  return formatTheodoi(res.data);
};

// ================= Xóa phiếu mượn =================
export const deleteTheodoi = async (id) => {
  if (!id) throw new Error("ID phiếu mượn không được để trống!");
  const res = await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() });
  return res.data;
};

// ================= Phê duyệt phiếu mượn =================
export const approveTheodoi = async (id) => {
  if (!id) throw new Error("ID phiếu mượn không được để trống!");
  const res = await axios.patch(`${API_URL}/${id}/duyet`, {}, { headers: authHeaders() });
  return formatTheodoi(res.data);
};
