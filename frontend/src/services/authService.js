import axios from 'axios';

const API = "http://localhost:3000/api/auth";

export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');

// Login
export const login = async ({ Username, Password }) => {
  const res = await axios.post(`${API}/login`, { Username, Password }); // tên đúng với backend
  if (res.data.token) setToken(res.data.token);
  return res.data;
};

// Register
export const register = async ({ Username, Password }) => {
  const res = await axios.post(`${API}/register`, { Username, Password }); // tên đúng với backend
  if (res.data.token) setToken(res.data.token);
  return res.data;
};
