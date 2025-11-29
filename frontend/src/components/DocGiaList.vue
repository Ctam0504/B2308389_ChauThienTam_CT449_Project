<template>
  <div class="page">

    <!-- ===== THÔNG TIN ĐỘC GIẢ ===== -->
    <div class="profile-card">
      <h3>Thông tin độc giả</h3>

      <div v-if="!editing">
        <p><strong>Mã độc giả:</strong> {{ docGia.MaDocGia }}</p>
        <p><strong>Họ tên:</strong> {{ docGia.HoLot }} {{ docGia.Ten }}</p>
        <p><strong>Ngày sinh:</strong> {{ formatDate(docGia.NgaySinh) }}</p>
        <p><strong>Phái:</strong> {{ docGia.Phai }}</p>
        <p><strong>Địa chỉ:</strong> {{ docGia.DiaChi }}</p>
        <p><strong>Điện thoại:</strong> {{ docGia.DienThoai }}</p>

        <button class="btn edit-btn" @click="startEdit">Chỉnh sửa</button>

        <!-- 🔥 NÚT ĐĂNG XUẤT -->
        <button class="btn logout-btn" @click="logout">Đăng xuất</button>
      </div>

      <div v-else>
        <input v-model="editData.HoLot" class="input" placeholder="Họ lót">
        <input v-model="editData.Ten" class="input" placeholder="Tên">
        <input type="date" v-model="editData.NgaySinh" class="input">
        <input v-model="editData.Phai" class="input" placeholder="Phái">
        <input v-model="editData.DiaChi" class="input" placeholder="Địa chỉ">
        <input v-model="editData.DienThoai" class="input" placeholder="Điện thoại">

        <div class="btn-group">
          <button class="btn save" @click="saveEdit">Lưu</button>
          <button class="btn cancel" @click="editing=false">Hủy</button>
        </div>
      </div>

      <!-- DANH SÁCH SÁCH ĐANG MƯỢN -->
      <div class="borrowed-list" v-if="theoDoi.length">
        <h4>Danh sách sách đang mượn</h4>
        <ul>
          <li v-for="td in theoDoi" :key="td._id" class="borrow-item">
            <img v-if="getSach(td.MaSach)?.AnhFull" :src="getSach(td.MaSach)?.AnhFull" class="borrowed-cover" alt="Bìa sách">
            <div class="borrow-info">
              <span>{{ getSachName(td.MaSach) }} - Từ {{ formatDate(td.NgayMuon) }} đến {{ td.NgayTra ? formatDate(td.NgayTra) : 'Chưa trả' }}</span>
            </div>
            <button 
              class="btn" 
              :class="td.DaDuyet ? 'return' : 'pending'" 
              @click="td.DaDuyet ? traSach(td) : null" 
              :disabled="!td.DaDuyet"
            >
              {{ td.DaDuyet ? 'Trả sách' : 'Chưa duyệt' }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- DANH SÁCH SÁCH -->
    <div class="book-list">
      <h2>Danh sách sách</h2>

      <input v-model="searchBook" class="search" placeholder="🔍 Tìm sách..." />

      <div class="book-grid">
        <div class="book-card" v-for="s in booksPage" :key="s.MaSach">
          <div class="cover-wrapper">
            <img v-if="s.AnhFull" :src="s.AnhFull" alt="Bìa sách" class="book-cover" />

            <div class="book-info-overlay">
              <p><strong>Tác giả:</strong> {{ s.NguonGoc_TacGia }}</p>
              <p><strong>NXB:</strong> {{ getNXBName(s.MaNXB) }}</p>
              <p><strong>Năm XB:</strong> {{ s.NamXuatBan }}</p>
              <p><strong>Đơn giá:</strong> {{ s.DonGia }} VNĐ</p>
              <p><strong>Số quyển:</strong> {{ s.SoQuyen }}</p>
            </div>
          </div>

          <h3 class="book-title">{{ s.TenSach }}</h3>
          <p class="book-info">Còn lại: {{ s.SoQuyen }} quyển</p>
          <button class="btn borrow" @click="openBorrowPopup(s)" :disabled="s.SoQuyen <= 0">
            {{ s.SoQuyen > 0 ? 'Mượn sách' : 'Hết sách' }}
          </button>
        </div>
      </div>

      <div class="pagination">
        <button :disabled="pageBook===1" @click="pageBook--">⬅ Trước</button>
        <span>Trang {{ pageBook }} / {{ totalPageBook }}</span>
        <button :disabled="pageBook===totalPageBook" @click="pageBook++">Sau ➡</button>
      </div>
    </div>

    <!-- POPUP MƯỢN SÁCH -->
    <div class="popup" v-if="borrowPopupVisible">
      <div class="popup-content">
        <h3>Mượn sách: {{ selectedBook.TenSach }}</h3>

        <label>
          Ngày mượn:
          <input type="date" v-model="borrowData.NgayMuon" />
        </label>

        <label>
          Ngày trả:
          <input type="date" v-model="borrowData.NgayTra" />
        </label>

        <div class="popup-buttons">
          <button class="btn save" @click="confirmBorrow">Xác nhận</button>
          <button class="btn cancel" @click="borrowPopupVisible=false">Hủy</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getTheodois, addTheodoi, returnSach } from '../services/theodoimuonsachService';
import { updateSoQuyen } from '../services/sachService';
import { getDocgiaByMa, updateDocgia } from "../services/docgiaService";
import { getNXBs } from "../services/nhaxuatbanService";

const BACKEND_URL = "http://localhost:3000";

export default {
  data() {
    return {
      docGia: {},
      books: [],
      nxbList: [],
      theoDoi: [],
      editing: false,
      editData: {},
      borrowPopupVisible: false,
      selectedBook: null,
      borrowData: { NgayMuon: '', NgayTra: '' },
      searchBook: "",
      pageBook: 1,
      limitBook: 8
    };
  },

  async created() {
    await this.loadNXB();
    await this.loadBooks();
    await this.loadDocGia();
  },

  computed: {
    filteredBooks() {
      if (!this.searchBook) return this.books;
      return this.books.filter(b => b.TenSach.toLowerCase().includes(this.searchBook.toLowerCase()));
    },
    totalPageBook() { return Math.ceil(this.filteredBooks.length / this.limitBook); },
    booksPage() {
      const start = (this.pageBook - 1) * this.limitBook;
      return this.filteredBooks.slice(start, start + this.limitBook);
    }
  },

  methods: {

    // 🔥 Hàm ĐĂNG XUẤT — đã sửa đúng
    logout() {
      localStorage.removeItem("userId");
      this.$router.push("/login");
    },

    formatDate(date) { return date ? new Date(date).toLocaleDateString("vi-VN") : ""; },
    getSach(MaSach) { return this.books.find(b => String(b.MaSach) === String(MaSach)) || null; },
    getSachName(MaSach) { const s = this.getSach(MaSach); return s ? s.TenSach : "Không tìm thấy"; },

    getNXBName(MaNXB) {
      if (!MaNXB) return "Không rõ";
      const nxb = this.nxbList.find(n => n._id === MaNXB);
      return nxb ? nxb.TenNXB : "Không rõ";
    },

    async loadNXB() {
      try {
        const res = await getNXBs();
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (res && Array.isArray(res.data)) list = res.data;
        else list = [];

        this.nxbList = list.map(n => ({
          ...n,
          _id: String(n._id),
          TenNXB: n.TenNXB || "Không rõ"
        }));
      } catch(err) {
        console.error("Lỗi load NXB:", err);
        this.nxbList = [];
      }
    },

    async loadBooks() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/sach`);
        const data = await res.json();
        if (!Array.isArray(data)) return this.books = [];

        this.books = data.map(s => ({
          ...s,
          AnhFull: s.Anh ? `${BACKEND_URL}${s.Anh}` : null,
          MaSach: String(s.MaSach),
          MaNXB: s.MaNXB ? String(s.MaNXB) : ""
        }));
      } catch(err) {
        console.error("Lỗi load sách:", err);
        this.books = [];
      }
    },

    async loadDocGia() {
      const MaDocGia = localStorage.getItem("userId");
      if (!MaDocGia) return alert("Chưa đăng nhập!");
      try {
        const res = await getDocgiaByMa(MaDocGia);
        this.docGia = res.data;
        const theoDoiData = await getTheodois(this.docGia.MaDocGia);
        this.theoDoi = Array.isArray(theoDoiData) ? theoDoiData.map(td => ({ ...td, DaDuyet: td.DaDuyet || false })) : [];
      } catch(err) {
        console.error("Lỗi loadDocGia:", err);
        this.docGia = {};
        this.theoDoi = [];
      }
    },

    startEdit() {
      this.editing = true;
      this.editData = { ...this.docGia };
      if (this.editData.NgaySinh) this.editData.NgaySinh = new Date(this.editData.NgaySinh).toISOString().split("T")[0];
    },

    async saveEdit() {
      try {
        await updateDocgia(this.docGia.MaDocGia, this.editData);
        this.editing = false;
        await this.loadDocGia();
      } catch(err) { console.error(err); }
    },

    openBorrowPopup(book) {
      this.selectedBook = book;
      this.borrowData = { NgayMuon: new Date().toISOString().split("T")[0], NgayTra: "" };
      this.borrowPopupVisible = true;
    },

    async confirmBorrow() {
      if (!this.selectedBook) return;
      try {
        await addTheodoi({
          MaDocGia: this.docGia.MaDocGia,
          MaSach: this.selectedBook.MaSach,
          NgayMuon: this.borrowData.NgayMuon,
          NgayTra: this.borrowData.NgayTra
        });
        await updateSoQuyen(this.selectedBook.MaSach, 0);
        await this.loadBooks();
        await this.loadDocGia();
        this.borrowPopupVisible = false;
      } catch(err) {
        console.error(err);
        alert("Mượn sách thất bại!");
      }
    },

    async traSach(phieu) {
      if (!phieu) return;
      try {
        await returnSach(phieu._id);
        await updateSoQuyen(phieu.MaSach, 0);
        await this.loadBooks();
        await this.loadDocGia();
      } catch(err) {
        console.error(err);
        alert("Trả sách thất bại!");
      }
    }
  }
};
</script>

<style scoped>
/* Giữ nguyên toàn bộ style của bạn */
.page { display:flex; gap:20px; padding:20px; flex-wrap: wrap; background:#f0f4f8; font-family:'Segoe UI', sans-serif; }
.profile-card { width: 300px; background: linear-gradient(145deg,#ffffff,#e6f0fa); padding: 20px; border-radius: 16px; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
.input { width:100%; padding:10px; margin:6px 0; border-radius:8px; border:1px solid #ccc; }
.btn { width:100%; margin-top:10px; padding:10px; border-radius:8px; cursor:pointer; border:none; font-weight:600; }
.edit-btn { background:#4e73df; color:#fff; }
.save { background:#1cc88a; color:#fff; }
.cancel { background:#e74a3b; color:#fff; }
.logout-btn { background:#ff4757; color:#fff; }
.logout-btn:hover { background:#e84141; }
.btn-group { display:flex; gap:10px; }
.borrowed-list { margin-top:20px; }
.borrow-item { display:flex; align-items:center; gap:10px; margin-bottom:12px; background:#fff; padding:6px 10px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
.borrowed-cover { width:50px; height:70px; object-fit:cover; border-radius:6px; }
.borrow-info { display:flex; flex-direction:column; gap:4px; }
.btn.return { background:#f6c23e; color:#fff; padding:6px 12px; border-radius:8px; cursor:pointer; }
.btn.pending { background:#ccc; color:#fff; padding:6px 12px; border-radius:8px; cursor:not-allowed; }
.book-list { flex:1; min-width:650px; }
.search { width:100%; padding:10px; border-radius:10px; border:1px solid #ccc; margin-bottom:20px; }
.book-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:20px; }
.book-card { background:#fff; border-radius:16px; padding:12px; text-align:center; box-shadow:0 6px 20px rgba(0,0,0,0.08); display:flex; flex-direction:column; align-items:center; transition:all 0.3s ease; }
.book-card:hover { transform:translateY(-6px) scale(1.03); box-shadow:0 10px 28px rgba(0,0,0,0.14); }
.cover-wrapper { position: relative; width:100%; }
.book-cover { width:100%; height:250px; object-fit:cover; border-radius:10px; margin-bottom:10px; }
.book-info-overlay { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.8); color: #fff; padding: 6px; font-size: 12px; border-radius: 0 0 10px 10px; pointer-events: none; opacity: 0; transition: opacity 0.2s ease; }
.cover-wrapper:hover .book-info-overlay { opacity: 1; }
.book-title { font-size:16px; font-weight:600; margin-bottom:6px; color:#1f3c88; }
.book-info { font-size:14px; color:#555; }
.btn.borrow { background:#4e73df; color:#fff; margin-top:8px; border-radius:8px; padding:8px 12px; cursor:pointer; }
.btn.borrow:hover:not(:disabled) { background:#3b5cc7; transform:scale(1.05); }
.btn.borrow:disabled { background:#ccc; cursor:not-allowed; }
.pagination { display:flex; justify-content:center; gap:10px; margin-top:16px; }
.pagination button { padding:8px 14px; border-radius:8px; border:none; background:#4e73df; color:white; cursor:pointer; }
.pagination button:hover:not(:disabled) { background:#3b5cc7; transform:scale(1.05); }
.pagination button:disabled { background:#ccc; cursor:not-allowed; }
.popup { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(3px); display:flex; justify-content:center; align-items:center; }
.popup-content { background:#fff; padding:24px; border-radius:16px; width:360px; display:flex; flex-direction:column; gap:14px; box-shadow:0 8px 32px rgba(0,0,0,0.16); }
.popup-buttons { display:flex; gap:12px; margin-top:10px; }
</style>
