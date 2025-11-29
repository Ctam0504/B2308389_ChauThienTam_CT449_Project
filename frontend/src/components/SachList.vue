<template>
  <div>
    <h2>Danh sách sách</h2>
    <form @submit.prevent="add">
      <input v-model="newSach.TenSach" placeholder="Tên sách" />
      <input v-model="newSach.DonGia" type="number" placeholder="Đơn giá" />
      <input v-model="newSach.SoQuyen" type="number" placeholder="Số quyển" />
      <input v-model="newSach.NamXuatBan" type="number" placeholder="Năm xuất bản" />
      <input v-model="newSach.MaNXB" placeholder="Mã NXB" />
      <input v-model="newSach.NguonGoc" placeholder="Nguồn gốc/Tác giả" />
      <button type="submit">Thêm</button>
    </form>

    <ul>
      <li v-for="s in saches" :key="s._id">
        {{ s.TenSach }} - {{ s.DonGia }}
        <button @click="remove(s._id)">Xóa</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { getSaches, addSach, deleteSach } from '../services/sachService';

export default {
  data() {
    return {
      saches: [],
      newSach: { TenSach:'', DonGia:0, SoQuyen:0, NamXuatBan:0, MaNXB:'', NguonGoc:'' }
    };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      const res = await getSaches();
      this.saches = res.data;
    },
    async add() {
      await addSach(this.newSach);
      this.newSach = { TenSach:'', DonGia:0, SoQuyen:0, NamXuatBan:0, MaNXB:'', NguonGoc:'' };
      await this.load();
    },
    async remove(id) {
      await deleteSach(id);
      await this.load();
    }
  }
};
</script>
