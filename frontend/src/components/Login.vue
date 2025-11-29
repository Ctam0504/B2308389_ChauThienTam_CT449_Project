<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo">📚</div>
      <h2 class="title">Đăng nhập</h2>

      <!-- Login Section -->
      <div class="form-group">
        <div class="input-wrapper">
          <span class="icon">👤</span>
          <input 
            v-model="Username" 
            placeholder="Tài khoản" 
            class="input" 
            @keyup.enter="doLogin"
          />
        </div>
        <div class="input-wrapper">
          <span class="icon">🔒</span>
          <input 
            v-model="Password" 
            placeholder="Mật khẩu" 
            type="password" 
            class="input" 
            @keyup.enter="doLogin"
          />
        </div>
        <button class="btn primary" @click="doLogin">Đăng nhập</button>
      </div>

      <div class="divider"><span>hoặc</span></div>

      <!-- Register Section -->
      <h3 class="subtitle">Đăng ký tài khoản độc giả</h3>
      <div class="form-group">
        <div class="input-wrapper">
          <span class="icon">👤</span>
          <input 
            v-model="regUser" 
            placeholder="Tài khoản" 
            class="input"
            @keyup.enter="doRegister"
          />
        </div>
        <div class="input-wrapper">
          <span class="icon">🔒</span>
          <input 
            v-model="regPass" 
            placeholder="Mật khẩu" 
            type="password" 
            class="input"
            @keyup.enter="doRegister"
          />
        </div>
        <button class="btn secondary" @click="doRegister">Đăng ký</button>
      </div>
    </div>
  </div>
</template>

<script>
import { login, register } from '../services/authService';

export default {
  name: "Login",
  data() {
    return {
      Username: '',
      Password: '',
      regUser: '',
      regPass: '',
    };
  },
  methods: {
    async doLogin() {
      const Username = this.Username?.trim();
      const Password = this.Password;

      if (!Username || !Password) return alert("Vui lòng nhập Username và Password!");

      try {
        const res = await login({ Username, Password });
        localStorage.setItem("userId", res.userId);
        alert(res.message || "Đăng nhập thành công!");
        if (res.role === "admin") this.$router.push('/admin');
        else if (res.role === "nhanvien") this.$router.push('/nhanvien');
        else if (res.role === "docgia") this.$router.push('/docgia');
      } catch (err) {
        alert(err.response?.data?.message || "Đăng nhập thất bại!");
      }
    },

    async doRegister() {
      const Username = this.regUser?.trim();
      const Password = this.regPass;

      if (!Username || !Password) return alert("Vui lòng nhập Username và Password!");

      try {
        const res = await register({ Username, Password });
        alert(res.message || "Đăng ký thành công!");
        this.regUser = '';
        this.regPass = '';
      } catch (err) {
        alert(err.response?.data?.message || "Đăng ký thất bại!");
      }
    }
  }
};
</script>

<style scoped>
/* Container toàn trang */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  font-family: 'Poppins', sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

/* Card login/đăng ký */
.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 32px 24px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0,0,0,0.16);
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
}

/* Logo */
.logo {
  font-size: 50px;
  margin-bottom: 16px;
}

/* Tiêu đề */
.title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

/* Subtitle */
.subtitle {
  margin: 24px 0 12px;
  font-size: 18px;
  font-weight: 500;
  color: #555;
}

/* Form group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Input wrapper icon */
.input-wrapper {
  position: relative;
}

.icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #667eea;
}

/* Input fields */
.input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.25s ease;
}

.input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 8px rgba(102,126,234,0.3);
}

.select {
  cursor: not-allowed;
}

/* Buttons */
.btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
}

.primary { background: #667eea; color: #fff; }
.primary:hover { background: #556cd6; }

.secondary { background: #1cc88a; color: #fff; }
.secondary:hover { background: #17a673; }

/* Divider */
.divider {
  text-align: center;
  margin: 24px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e2e8f0;
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.divider span {
  background: #fff;
  padding: 0 8px;
  color: #888;
  font-size: 13px;
}

/* Responsive cho màn hình nhỏ */
@media (max-width: 420px) {
  .login-card { padding: 28px 20px; }
  .title { font-size: 24px; }
  .subtitle { font-size: 16px; }
}
</style>
