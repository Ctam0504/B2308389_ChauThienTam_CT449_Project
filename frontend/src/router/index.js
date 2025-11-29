import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import DocGiaPage from '../components/DocGiaList.vue'
import NhanVienPage from '../components/NhanVienList.vue'
import AdminPage from '../components/AdminNhanVien.vue'

const routes = [
  // Trang Login chính
  { path: '/login', component: Login },

  // Khi vào "/" tự động chuyển về login
  { path: '/', redirect: '/login' },

  // Các trang khác
  { path: '/docgia', component: DocGiaPage },
  { path: '/nhanvien', component: NhanVienPage },
  { path: '/admin', component: AdminPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
