<template>
  <div class="admin-dashboard">
    <header class="header">
      <h1>🧑‍💼 Quản lý nhân viên</h1>
      <!-- NÚT ĐĂNG XUẤT -->
      <button class="btn logout" @click="logout">🚪 Đăng xuất</button>
    </header>

    <!-- FORM THÊM NHÂN VIÊN -->
    <section class="card add-employee">
      <h2>Thêm nhân viên mới</h2>
      <form @submit.prevent="addNhanVien">
        <div class="form-row">
          <input v-model="newNV.Username" placeholder="Username" required />
          <input v-model="newNV.HoTenNV" placeholder="Họ tên" required />
        </div>
        <div class="form-row">
          <input v-model="newNV.Password" type="password" placeholder="Mật khẩu" required />
          <input v-model="newNV.Chucvu" placeholder="Chức vụ" />
        </div>
        <div class="form-row">
          <input v-model="newNV.DiaChi" placeholder="Địa chỉ" />
          <input v-model="newNV.SoDienThoai" placeholder="SĐT" />
        </div>
        <button type="submit" class="btn primary">Thêm nhân viên</button>
      </form>
    </section>

    <!-- DANH SÁCH NHÂN VIÊN -->
    <section class="card employee-list">
      <h2>Danh sách nhân viên</h2>
      <div class="grid">
        <div v-for="nv in nhanviens" :key="nv._id" class="employee-card">
          <div class="employee-info">
            <h3>{{ nv.HoTenNV }}</h3>
            <p><strong>Username:</strong> {{ nv.Username }}</p>
            <p><strong>Chức vụ:</strong> {{ nv.Chucvu }}</p>
            <p><strong>Địa chỉ:</strong> {{ nv.DiaChi || '-' }}</p>
            <p><strong>SĐT:</strong> {{ nv.SoDienThoai || '-' }}</p>
          </div>
          <div class="employee-actions">
            <button class="btn edit" @click="openEdit(nv)">Sửa</button>
            <button class="btn delete" @click="removeNhanVien(nv._id)">Xóa</button>
          </div>
        </div>
      </div>
    </section>

    <!-- POPUP EDIT -->
    <div v-if="showEdit" class="modal">
      <div class="modal-content">
        <h2>Sửa nhân viên</h2>
        <input v-model="editNV.Username" disabled />
        <input v-model="editNV.HoTenNV" placeholder="Họ tên" />
        <input v-model="editNV.Password" type="password" placeholder="Mật khẩu mới (nếu có)" />
        <input v-model="editNV.Chucvu" placeholder="Chức vụ" />
        <input v-model="editNV.DiaChi" placeholder="Địa chỉ" />
        <input v-model="editNV.SoDienThoai" placeholder="SĐT" />

        <div class="modal-buttons">
          <button class="btn save" @click="updateNV">Lưu</button>
          <button class="btn cancel" @click="showEdit=false">Hủy</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getNhanViens, addNhanVien, deleteNhanVien, updateNhanVien } from '../services/nhanvienService';

export default {
  data() {
    return {
      nhanviens: [],
      newNV: { Username:'', HoTenNV:'', Password:'', Chucvu:'', DiaChi:'', SoDienThoai:'' },
      showEdit: false,
      editNV: {}
    };
  },

  async created() {
    await this.loadNhanViens();
  },

  methods: {
    async loadNhanViens() {
      const res = await getNhanViens();
      this.nhanviens = res.data;
    },

    async addNhanVien() {
      if (!this.newNV.Username || !this.newNV.Password || !this.newNV.HoTenNV) 
        return alert("Bắt buộc nhập Username, Họ tên và Mật khẩu");
      await addNhanVien(this.newNV);
      this.newNV = { Username:'', HoTenNV:'', Password:'', Chucvu:'', DiaChi:'', SoDienThoai:'' };
      await this.loadNhanViens();
    },

    openEdit(nv) { this.editNV = {...nv, Password:''}; this.showEdit = true; },
    async updateNV() { await updateNhanVien(this.editNV._id, this.editNV); this.showEdit=false; await this.loadNhanViens(); },
    async removeNhanVien(id) { if(confirm("Bạn có chắc muốn xóa?")) { await deleteNhanVien(id); await this.loadNhanViens(); } },

    // ===== ĐĂNG XUẤT =====
    logout() {
      localStorage.removeItem("userId");  // hoặc token nếu bạn lưu
      this.$router.push("/login");       // chuyển về trang login
    }
  }
};
</script>

<style scoped>
.admin-dashboard { max-width: 1000px; margin: 20px auto; padding: 0 15px; font-family: 'Segoe UI', sans-serif; }
.header { text-align: center; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center; }
.header h1 { color: #4e73df; }
.header .logout { padding:6px 12px; border:none; border-radius:6px; background:#e74c3c; color:white; cursor:pointer; transition:.2s; }
.header .logout:hover { background:#c0392b; }

.card { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
.add-employee h2, .employee-list h2 { margin-bottom: 15px; color: #2c3e50; }

form .form-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
form input { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #ccc; }
form .btn.primary { width: 100%; padding: 10px; border:none; border-radius:6px; background:#4e73df; color:white; cursor:pointer; transition:.2s; }
form .btn.primary:hover { background:#3b5cc7; }

.grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap: 15px; }
.employee-card { background:#f8f9fc; border-radius:12px; padding:15px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.employee-info h3 { margin:0 0 6px 0; color:#2c3e50; }
.employee-info p { margin:2px 0; font-size:14px; color:#555; }
.employee-actions { margin-top:10px; display:flex; gap:10px; }
.employee-actions .btn { flex:1; padding:6px 10px; border-radius:6px; border:none; cursor:pointer; font-weight:500; }
.employee-actions .edit { background:#f1c40f; color:#fff; transition:.2s; }
.employee-actions .edit:hover { background:#d4ac0d; }
.employee-actions .delete { background:#e74c3c; color:#fff; transition:.2s; }
.employee-actions .delete:hover { background:#c0392b; }

.modal { position:fixed; top:0; left:0;width:100%;height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:100; }
.modal-content { background:#fff; padding:20px; border-radius:12px; width:350px; display:flex; flex-direction:column; gap:8px; }
.modal-content input { padding:8px; border-radius:6px; border:1px solid #ccc; }
.modal-buttons { display:flex; justify-content:flex-end; gap:10px; margin-top:10px; }
.modal-buttons .save { background:#2ecc71; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; }
.modal-buttons .save:hover { background:#27ae60; }
.modal-buttons .cancel { background:#95a5a6; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; }
.modal-buttons .cancel:hover { background:#7f8c8d; }

@media(max-width:600px) {
  .form-row { flex-direction: column; }
  .header { flex-direction: column; gap:10px; }
}
</style>
