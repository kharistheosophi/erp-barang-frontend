import { create } from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

const useBarangStore = create((set, get) => ({
  data: [],
  loading: false,

  loadData: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/barang/");
      if (res.data.success) {
        set({ data: res.data.data }); //
      }
    } catch (err) {
      console.error("Gagal load data:", err);
    } finally {
      set({ loading: false });
    }
  },

  createBarang: async (payload) => {
    await api.post("/barang/", payload);
    get().loadData(); // Auto refresh
  },

  updateBarang: async (kode, payload) => {
    await api.put(`/barang/${kode}`, payload);
    get().loadData(); // Auto refresh
  },

  deleteBarang: async (kode) => {
    await api.delete(`/barang/${kode}`);
    get().loadData(); // Auto refresh
  },
}));

export default useBarangStore;