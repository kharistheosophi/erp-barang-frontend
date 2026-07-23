import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard/dashboard";
import Barang from "./pages/Barang";
import MutasiStok from "./pages/mutasi"; // 1. Ubah nama import agar tidak bentrok dengan Barang
import Pembelian from "./pages/pembelian"; 
import Supplier from "./pages/Supplier"; 
import MainLayout from "./layout/MainLayout";
import StokGudang from "./pages/StokGudang";
import ProtectedRoute  from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Login: Mandiri (Tanpa Layout) */}
        <Route path="/login" element={<Login />} />
        {/* Rute Utama: Menggunakan MainLayout agar Sidebar muncul */}
        <Route 
        path="/" 
        element={
          <ProtectedRoute>
             <MainLayout />
          </ProtectedRoute>
        }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="barang" element={<Barang isDashboard={false} />} />
          <Route path="pembelian" element={<Pembelian/>} />
          <Route path="supplier" element={<Supplier />} /> 
          <Route path="mutasi" element={<MutasiStok />} /> {/* 2. Masukkan ke dalam Layout */}
           <Route path="stok-gudang" element={<StokGudang />} />
        </Route>

        {/* Rute 404 */}
        <Route
          path="*"
          element={
            <div className="flex justify-center items-center h-screen text-2xl font-bold">
              404 | Halaman Tidak Ditemukan
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;