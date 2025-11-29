<template>
  <div class="dashboard-container">
    <!-- Sidebar nhân viên -->
    <aside class="sidebar">
      <h3>👤 Thông tin nhân viên</h3>
      <div v-if="nhanvienMe">
        <p><strong>Họ tên:</strong> {{ nhanvienMe.HoTenNV }}</p>
        <p><strong>Username:</strong> {{ nhanvienMe.Username }}</p>
        <p><strong>Chức vụ:</strong> {{ nhanvienMe.Chucvu }}</p>
        <p><strong>Địa chỉ:</strong> {{ nhanvienMe.DiaChi }}</p>
        <p><strong>SĐT:</strong> {{ nhanvienMe.SoDienThoai }}</p>
      </div>
      <div v-else>
        <p>Đang tải thông tin...</p>
      </div>

      <!-- Nút đăng xuất -->
      <button class="btn-logout" @click="logout">🚪 Đăng xuất</button>
    </aside>

    <!-- Nội dung chính -->
    <main class="main-content">
      <h1>📚 Quản lý thư viện</h1>

      <!-- DANH SÁCH ĐỘC GIẢ -->
      <section class="card">
        <h2>🧑‍💼 Danh sách độc giả</h2>
        <input v-model="searchDocgia" class="search" placeholder="🔍 Tìm độc giả..." />
        <ul class="list">
          <li v-for="dg in docgiasPage" :key="dg.MaDocGia">
            <strong>{{ dg.HoLot }} {{ dg.Ten }}</strong> - {{ dg.DienThoai }}
            <button @click="deleteDocgiaHandler(dg._id)" class="btn-delete">Xóa</button>
          </li>
        </ul>
        <div class="pagination">
          <button :disabled="pageDocgia===1" @click="pageDocgia--">⬅ Trước</button>
          <span>Trang {{ pageDocgia }} / {{ totalPageDocgia }}</span>
          <button :disabled="pageDocgia===totalPageDocgia" @click="pageDocgia++">Sau ➡</button>
        </div>
      </section>

      <!-- THÊM / SỬA SÁCH -->
      <section class="card">
        <h2>📖 Thêm / Sửa sách</h2>
        <input v-model="searchSach" class="search" placeholder="🔍 Tìm sách..." />
        <form @submit.prevent="submitSach" class="form-inline">
          <input v-model="newSach.MaSach" placeholder="Mã sách" required />
          <input v-model="newSach.TenSach" placeholder="Tên sách" required />
          <input v-model="newSach.DonGia" type="number" placeholder="Đơn giá" />
          <input v-model="newSach.SoQuyen" type="number" placeholder="Số quyển" />
          <input v-model="newSach.NamXuatBan" type="number" placeholder="Năm xuất bản" />
          <select v-model="newSach.MaNXB">
            <option value="">Chọn NXB</option>
            <option v-for="nxb in nhaxuatbans" :key="nxb._id" :value="nxb._id">{{ nxb.TenNXB }}</option>
          </select>
          <input v-model="newSach.NguonGoc_TacGia" placeholder="Nguồn gốc / Tác giả" />
          <input type="file" @change="handleFileUpload" />
          <button type="submit">{{ editMode ? 'Cập nhật' : 'Thêm sách' }}</button>
          <button type="button" v-if="editMode" @click="resetSachForm">Hủy</button>
        </form>

        <div v-if="previewImg" class="preview">
          <p>Preview:</p>
          <img :src="previewImg" class="preview-img" />
        </div>

        <div class="grid books-grid">
          <div class="book-card" v-for="s in sachesPage" :key="s._id">
            <img v-if="s.Anh" :src="getAnhFullUrl(s.Anh)" class="book-cover" :alt="s.TenSach" />
            <div class="book-info">
              <h4>{{ s.TenSach }}</h4>
              <p>{{ s.NguonGoc_TacGia }}</p>
              <p>{{ s.DonGia ? s.DonGia + ' VNĐ · ' : '' }}{{ s.SoQuyen }} quyển · {{ s.NamXuatBan }}</p>
            </div>
            <button @click="editSachHandler(s)" class="btn-edit">Sửa</button>
            <button @click="deleteSachHandler(s._id)" class="btn-delete">Xóa</button>
          </div>
        </div>

        <div class="pagination">
          <button :disabled="pageSach===1" @click="pageSach--">⬅ Trước</button>
          <span>Trang {{ pageSach }} / {{ totalPageSach }}</span>
          <button :disabled="pageSach===totalPageSach" @click="pageSach++">Sau ➡</button>
        </div>
      </section>

      <!-- NHÀ XUẤT BẢN -->
      <section class="card">
        <h2>🏢 Quản lý Nhà xuất bản</h2>
        <input v-model="searchNXB" class="search" placeholder="🔍 Tìm NXB..." />
        <form @submit.prevent="addNXBHandler" class="form-inline">
          <input v-model="newNXB.MaNXB" placeholder="Mã NXB" required />
          <input v-model="newNXB.TenNXB" placeholder="Tên NXB" required />
          <input v-model="newNXB.DiaChi" placeholder="Địa chỉ" />
          <button type="submit">Thêm NXB</button>
        </form>

        <div class="grid nxb-grid">
          <div class="nxb-card" v-for="nxb in nhaxuatbansPage" :key="nxb._id">
            <h4>{{ nxb.TenNXB }}</h4>
            <p>{{ nxb.DiaChi }}</p>
            <button @click="deleteNXBHandler(nxb._id)" class="btn-delete">Xóa</button>
          </div>
        </div>

        <div class="pagination">
          <button :disabled="pageNXB===1" @click="pageNXB--">⬅ Trước</button>
          <span>Trang {{ pageNXB }} / {{ totalPageNXB }}</span>
          <button :disabled="pageNXB===totalPageNXB" @click="pageNXB++">Sau ➡</button>
        </div>
      </section>

      <!-- PHIẾU MƯỢN SÁCH -->
      <section class="card">
        <h2>📝 Danh sách phiếu mượn sách</h2>
        <input v-model="searchPhieuMuon" class="search" placeholder="🔍 Tìm phiếu mượn..." />
        <table class="borrow-table">
          <thead>
            <tr>
              <th>Độc giả</th>
              <th>Sách</th>
              <th>Ngày mượn</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="td in phieuMuonPage" :key="td._id">
              <td>{{ getDocgiaName(td.MaDocGia) }}</td>
              <td>{{ getSachName(td.MaSach) }}</td>
              <td>{{ formatDate(td.NgayMuon) }}</td>
              <td>{{ td.DaTra ? formatDate(td.NgayTra) : 'Chưa trả' }}</td>
              <td>
                <span v-if="td.DaTra">Đã trả</span>
                <span v-else-if="td.DaDuyet">Đã duyệt</span>
                <button v-else @click="duyetPhieu(td)" class="btn-approve">Duyệt</button>
              </td>
              <td>
                <button @click="deletePhieuHandler(td._id)" class="btn-delete">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button :disabled="pagePhieuMuon===1" @click="pagePhieuMuon--">⬅ Trước</button>
          <span>Trang {{ pagePhieuMuon }} / {{ totalPagePhieuMuon }}</span>
          <button :disabled="pagePhieuMuon===totalPagePhieuMuon" @click="pagePhieuMuon++">Sau ➡</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { getNhanVienMe } from "../services/nhanvienService";
import { getDocgias, deleteDocgia } from "../services/docgiaService";
import { getSaches, addSach, updateSach, deleteSach } from "../services/sachService";
import { getNXBs, addNXB, deleteNXB } from "../services/nhaxuatbanService";
import { getAllTheodois, approveTheodoi, deleteTheodoi } from "../services/theodoimuonsachService";

export default {
  data() {
    return {
      nhanvienMe: null,
      docgias: [],
      saches: [],
      nhaxuatbans: [],
      theodois: [],
      searchDocgia: "",
      searchSach: "",
      searchNXB: "",
      searchPhieuMuon: "",
      pageDocgia: 1,
      pageSach: 1,
      pageNXB: 1,
      pagePhieuMuon: 1,
      limit: 10,
      newSach: { MaSach:"",TenSach:"",DonGia:"",SoQuyen:"",NamXuatBan:"",MaNXB:"",NguonGoc_TacGia:"",Anh:null, _id: null },
      newNXB: { MaNXB: "", TenNXB: "", DiaChi: "" },
      previewImg: null,
      editMode: false
    };
  },

  computed: {
    filteredDocgia() { 
      return this.searchDocgia ? this.docgias.filter(d=>(d.HoLot+" "+d.Ten).toLowerCase().includes(this.searchDocgia.toLowerCase())) : this.docgias; 
    },
    totalPageDocgia() { return Math.ceil(this.filteredDocgia.length / this.limit); },
    docgiasPage() { const start=(this.pageDocgia-1)*this.limit; return this.filteredDocgia.slice(start,start+this.limit); },

    filteredSach() { return this.searchSach ? this.saches.filter(s=>s.TenSach.toLowerCase().includes(this.searchSach.toLowerCase())) : this.saches; },
    totalPageSach() { return Math.ceil(this.filteredSach.length/this.limit); },
    sachesPage() { const start=(this.pageSach-1)*this.limit; return this.filteredSach.slice(start,start+this.limit); },

    filteredNXB() { return this.searchNXB ? this.nhaxuatbans.filter(n=>n.TenNXB.toLowerCase().includes(this.searchNXB.toLowerCase())) : this.nhaxuatbans; },
    totalPageNXB() { return Math.ceil(this.filteredNXB.length/this.limit); },
    nhaxuatbansPage() { const start=(this.pageNXB-1)*this.limit; return this.filteredNXB.slice(start,start+this.limit); },

    filteredPhieuMuon() { 
      return this.searchPhieuMuon ? this.theodois.filter(td=>{ 
        const dg=this.getDocgiaName(td.MaDocGia).toLowerCase(); 
        const s=this.getSachName(td.MaSach).toLowerCase(); 
        return dg.includes(this.searchPhieuMuon.toLowerCase())||s.includes(this.searchPhieuMuon.toLowerCase());
      }) : this.theodois; 
    },
    totalPagePhieuMuon() { return Math.ceil(this.filteredPhieuMuon.length/this.limit); },
    phieuMuonPage() { const start=(this.pagePhieuMuon-1)*this.limit; return this.filteredPhieuMuon.slice(start,start+this.limit); }
  },

  async created() { await this.loadAll(); },

  methods: {
    async loadAll() {
      try {
        const [meRes,dgRes,sRes,nxbRes,tdRes]=await Promise.all([getNhanVienMe(),getDocgias(),getSaches(),getNXBs(),getAllTheodois()]);

        this.nhanvienMe = meRes?.data || null;
        this.docgias = Array.isArray(dgRes?.data) ? dgRes.data : [];

        const sList = Array.isArray(sRes) ? sRes : (Array.isArray(sRes?.data)?sRes.data:[]);
        this.saches = sList.map(s=>(({
          _id: s._id||s.id,
          MaSach: s.MaSach ? String(s.MaSach) : null,
          TenSach: s.TenSach,
          DonGia: s.DonGia,
          SoQuyen: s.SoQuyen,
          NamXuatBan: s.NamXuatBan,
          MaNXB: s.MaNXB,
          NguonGoc_TacGia: s.NguonGoc_TacGia,
          Anh: s.Anh||null
        })));

        this.nhaxuatbans = Array.isArray(nxbRes?.data)?nxbRes.data:[];

        let tdList = Array.isArray(tdRes)?tdRes:(Array.isArray(tdRes?.data)?tdRes.data:[]);
        this.theodois = tdList.map(td=>(({
          _id: td._id||td.id,
          MaDocGia: td.MaDocGia ? String(td.MaDocGia) : null,
          MaSach: td.MaSach ? String(td.MaSach) : null,
          NgayMuon: td.NgayMuon ? new Date(td.NgayMuon) : null,
          NgayTra: td.NgayTra ? new Date(td.NgayTra) : null,
          DaTra: Boolean(td.DaTra),
          DaDuyet: Boolean(td.DaDuyet || false)
        })));
      } catch(err){ console.error("Lỗi loadAll:",err); alert("Lấy dữ liệu thất bại!"); }
    },

    getDocgiaName(MaDocGia){ const dg=this.docgias.find(d=>String(d.MaDocGia)===String(MaDocGia)); return dg?dg.HoLot+" "+dg.Ten:"Không tìm thấy"; },
    getSachName(MaSach){ const s=this.saches.find(s=>String(s._id)===String(MaSach)||String(s.MaSach)===String(MaSach)); return s?s.TenSach:"Không tìm thấy"; },
    formatDate(date){ return date instanceof Date && !isNaN(date)?date.toLocaleDateString("vi-VN"):""; },
    getAnhFullUrl(path){ if(!path) return null; if(path.startsWith("http")) return path; return `http://localhost:3000${path}`; },

    handleFileUpload(event){ const file=event.target.files[0]; if(!file) return; this.newSach.Anh=file; this.previewImg=URL.createObjectURL(file); },

    // ===== THÊM / CẬP NHẬT SÁCH =====
    async submitSach() {
      try {
        const formData = new FormData();
        Object.keys(this.newSach).forEach(k => { if(this.newSach[k]) formData.append(k,this.newSach[k]); });

        if(this.editMode) {
          await updateSach(this.newSach._id, formData);
        } else {
          await addSach(formData);
        }
        this.resetSachForm();
        await this.loadAll();
      } catch(err){
        console.error(err);
        alert(this.editMode ? "Cập nhật sách thất bại!" : "Thêm sách thất bại!");
      }
    },

    editSachHandler(s){
      this.editMode = true;
      this.newSach = { ...s };
      this.previewImg = s.Anh ? this.getAnhFullUrl(s.Anh) : null;
    },

    resetSachForm(){
      this.editMode = false;
      this.newSach = { MaSach:"",TenSach:"",DonGia:"",SoQuyen:"",NamXuatBan:"",MaNXB:"",NguonGoc_TacGia:"",Anh:null, _id: null };
      this.previewImg = null;
    },

    async deleteSachHandler(id){ if(!confirm("Xóa sách này?")) return; try{ await deleteSach(id); await this.loadAll(); } catch(err){ console.error(err); alert("Xóa sách thất bại!"); } },

    async addNXBHandler(){ try{ await addNXB(this.newNXB); this.newNXB={MaNXB:"",TenNXB:"",DiaChi:""}; await this.loadAll(); } catch(err){ console.error(err); alert("Thêm NXB thất bại!"); } },

    async deleteNXBHandler(id){ if(!confirm("Xóa NXB này?")) return; try{ await deleteNXB(id); await this.loadAll(); } catch(err){ console.error(err); alert("Xóa NXB thất bại!"); } },

    async deleteDocgiaHandler(id){ if(!confirm("Xóa độc giả này?")) return; try{ await deleteDocgia(id); await this.loadAll(); } catch(err){ console.error(err); alert("Xóa độc giả thất bại!"); } },

    // ===== PHÊ DUYỆT PHIẾU MƯỢN =====
    async duyetPhieu(td) {
      if (!confirm("Bạn có muốn phê duyệt phiếu mượn này?")) return;
      try {
        await approveTheodoi(td._id);
        await this.loadAll();
      } catch (err) {
        console.error(err);
        alert("Phê duyệt phiếu thất bại!");
      }
    },

    // ===== XÓA PHIẾU MƯỢN =====
    async deletePhieuHandler(id){
      if(!confirm("Xóa phiếu mượn này?")) return;
      try {
        await deleteTheodoi(id);
        await this.loadAll();
      } catch(err){
        console.error(err);
        alert("Xóa phiếu mượn thất bại!");
      }
    },

    // ===== ĐĂNG XUẤT =====
    logout() {
      localStorage.removeItem("userId");
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
.dashboard-container{display:flex;gap:20px;max-width:1400px;margin:auto;padding:20px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;}
.sidebar{flex:0 0 250px;background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.08);color:white;}
.sidebar h3{margin-bottom:15px;}
.main-content{flex:1;}
h1{text-align:center;margin-bottom:30px;font-size:28px;color:#333;}
.card{padding:20px;margin-bottom:30px;border-radius:10px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.08);transition:all 0.3s ease;}
.card:hover{transform:translateY(-5px);box-shadow:0 10px 20px rgba(0,0,0,0.15);}
h2{margin-bottom:20px;font-size:22px;}
.form-inline{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:15px;}
.form-inline input,.form-inline select{flex:1 1 120px;padding:8px;border-radius:8px;border:1px solid #ccc;transition:all 0.2s ease;}
.form-inline input:focus,.form-inline select:focus{border-color:#667eea;box-shadow:0 0 6px rgba(102,126,234,0.3);outline:none;}
.form-inline button{padding:8px 16px;border:none;border-radius:8px;background:#4e73df;color:white;cursor:pointer;transition:all 0.25s ease;}
.form-inline button:hover{background:#3b5cc7;}
.search{width:100%;padding:8px;border-radius:8px;border:1px solid #ccc;margin-bottom:15px;transition:all 0.2s ease;}
.search:focus{border-color:#667eea;box-shadow:0 0 6px rgba(102,126,234,0.3);outline:none;}
.list{list-style:none;padding:0;}
.list li{margin-bottom:8px;font-size:15px;display:flex;justify-content:space-between;align-items:center;}
.grid{display:grid;gap:15px;}
.books-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));}
.nxb-grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));}
.nxb-card{padding:10px;border-radius:10px;background:#f7f7f7;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.05);transition:all 0.3s ease;}
.nxb-card:hover{transform:translateY(-5px);box-shadow:0 8px 16px rgba(0,0,0,0.15);}
.book-card{padding:10px;border-radius:10px;background:#f7f7f7;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.05);transition:all 0.3s ease;}
.book-card:hover{transform:translateY(-5px);box-shadow:0 8px 16px rgba(0,0,0,0.15);}
.book-cover{width:100%;height:220px;object-fit:cover;border-radius:6px;margin-bottom:10px;}
.preview-img{width:120px;height:160px;object-fit:cover;border-radius:6px;margin-top:10px;}
.book-actions{display:flex;justify-content:center;gap:10px;margin-top:10px;}
.btn-delete{padding:6px 12px;background:#e74a3b;color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.25s ease;}
.btn-delete:hover{background:#c0392b;}
.btn-edit{padding:6px 12px;background:#f6c23e;color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.25s ease;}
.btn-edit:hover{background:#dda20a;}
.btn-approve{padding:6px 12px;background:#1cc88a;color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.25s ease;}
.btn-approve:hover{background:#17a673;}
.borrow-table{width:100%;border-collapse:collapse;margin-top:15px;font-size:14px;}
.borrow-table th,.borrow-table td{border:1px solid #ddd;padding:10px;text-align:left;}
.borrow-table th{background:#f2f2f2;}
.borrow-table tr:hover{background:#f9f9f9;}
.pagination{display:flex;justify-content:center;gap:10px;padding-top:15px;}
.pagination button{padding:6px 12px;border-radius:6px;border:none;background:#4e73df;color:white;cursor:pointer;transition:all 0.25s ease;}
.pagination button:hover:not(:disabled){background:#3b5cc7;}
.pagination button:disabled{background:#ccc;cursor:not-allowed;}
.preview{margin-bottom:15px;}
.btn-edit{margin-left:5px;padding:6px 12px;background:#f6c23e;color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.25s ease;}
.btn-edit:hover{background:#dda20a;}

/* 🌟 Nút đăng xuất */
.btn-logout {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #ff4757;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.25s;
}

.btn-logout:hover {
  background: #e84141;
}
</style>
