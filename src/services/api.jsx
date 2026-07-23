import axios from "axios";

const API = axios.create({
  baseURL: "https://erp-barang-backend.vercel.app",
});

export default API;