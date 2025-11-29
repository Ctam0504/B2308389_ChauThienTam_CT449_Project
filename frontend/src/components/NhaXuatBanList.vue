<template>
  <div>
    <h2>Danh sách NXB</h2>
    <form @submit.prevent="add">
      <input v-model="newNXB.TenNXB" placeholder="Tên NXB" />
      <input v-model="newNXB.DiaChi" placeholder="Địa chỉ" />
      <button type="submit">Thêm</button>
    </form>

    <ul>
      <li v-for="nxb in nxbs" :key="nxb._id">
        {{ nxb.TenNXB }} - {{ nxb.DiaChi }}
        <button @click="remove(nxb._id)">Xóa</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { getNXBs, addNXB, deleteNXB } from '../services/nhaxuatbanService';

export default {
  data() {
    return {
      nxbs: [],
      newNXB: { TenNXB:'', DiaChi:'' }
    };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      try {
        const res = await getNXBs();
        this.nxbs = res.data;
      } catch (err) {
        console.error(err);
      }
    },
    async add() {
      if (!this.newNXB.TenNXB || !this.newNXB.DiaChi) return;
      try {
        await addNXB(this.newNXB);
        this.newNXB = { TenNXB:'', DiaChi:'' };
        await this.load();
      } catch (err) {
        console.error(err);
      }
    },
    async remove(id) {
      try {
        await deleteNXB(id);
        await this.load();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
</script>
