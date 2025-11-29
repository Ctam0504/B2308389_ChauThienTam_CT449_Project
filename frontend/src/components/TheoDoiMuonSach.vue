<template>
  <div class="page">
    <h2>Danh sách mượn sách</h2>

    <!-- Form thêm phiếu mượn -->
    <form @submit.prevent="add" class="form">
      <input v-model="newTT.MaDocGia" placeholder="Mã độc giả" required />
      <select v-model="newTT.MaSach" required>
        <option disabled value="">Chọn sách</option>
        <option v-for="s in books" :key="s.MaSach" :value="s.MaSach">
          {{ s.TenSach }} (Còn lại: {{ s.SoQuyen }})
        </option>
      </select>
      <input v-model="newTT.NgayMuon" type="date" required />
      <input v-model="newTT.NgayTra" type="date" required />
      <button type="submit">Thêm</button>
    </form>

    <!-- Danh sách phiếu mượn -->
    <ul class="borrow-list">
      <li v-for="tt in theodoimuonsachs" :key="tt._id">
        DG: {{ tt.MaDocGia }}, 
        Sách: {{ getSachName(tt.MaSach) }}, 
        Mượn: {{ formatDate(tt.NgayMuon) }}, 
        Trả: {{ tt.DaTra ? formatDate(tt.NgayTra) : 'Chưa trả' }}

        <button 
          class="btn return" 
          :disabled="tt.DaTra" 
          :class="{ disabled: tt.DaTra }"
          @click="tt.DaTra ? null : traSach(tt)"
        >
          {{ tt.DaTra ? 'Đã trả' : 'Trả sách' }}
        </button>

        <button class="btn delete" @click="remove(tt._id)">Xóa</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { getTheodois, addTheodoi, deleteTheodoi } from '../services/theodoimuonsachService';
import { getSaches } from '../services/sachService';

export default {
  data() {
    return {
      theodoimuonsachs: [],
      books: [],
      newTT: { MaDocGia:'', MaSach:'', NgayMuon:'', NgayTra:'' }
    };
  },
  async created() {
    await this.load();
    await this.loadBooks();
  },
  methods: {
    async load() {
      const res = await getTheodois();
      this.theodoimuonsachs = res.data;
    },
    async loadBooks() {
      const res = await getSaches();
      this.books = res.data;
    },
    getSachName(MaSach) {
      const s = this.books.find(b => b.MaSach === MaSach);
      return s ? s.TenSach : 'Không tìm thấy';
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString("vi-VN") : '';
    },
    async add() {
      try {
        await addTheodoi(this.newTT);
        this.newTT = { MaDocGia:'', MaSach:'', NgayMuon:'', NgayTra:'' };
        await this.load();
        await this.loadBooks();
        alert("Thêm phiếu mượn thành công!");
      } catch (err) {
        console.error(err);
        alert("Thêm phiếu mượn thất bại!");
      }
    },
    async remove(id) {
      try {
        await deleteTheodoi(id);
        await this.load();
        await this.loadBooks();
        alert("Xóa phiếu thành công!");
      } catch (err) {
        console.error(err);
        alert("Xóa thất bại!");
      }
    },
    async traSach(phieu) {
      try {
        await fetch(`http://localhost:3000/api/theodoimuonsach/return/${phieu._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
        phieu.DaTra = true;
        phieu.NgayTra = new Date().toISOString();
        await this.loadBooks();
        alert("Trả sách thành công!");
      } catch (err) {
        console.error(err);
        alert("Trả sách thất bại!");
      }
    }
  }
};
</script>

<style scoped>
.page {
  padding: 20px;
  max-width: 800px;
}

.form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.form input, .form select, .form button {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.borrow-list li {
  margin-bottom: 10px;
}

.btn {
  margin-left: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  color: #fff;
}

.btn.return {
  background-color: #f6c23e;
}

.btn.return.disabled {
  background-color: #b5b5b5;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn.delete {
  background-color: #e74a3b;
}
</style>
