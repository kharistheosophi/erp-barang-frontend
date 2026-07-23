import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api'; // Menggunakan API yang sudah ada
// 1. Buat Context
const AuthContext = createContext();

// 2. Custom Hook untuk mempermudah penggunaan
export const useAuth = () => useContext(AuthContext);

// 3. Provider Component
export function AuthProvider({ children }) {
  // State untuk menyimpan data user yang sedang login
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek token dari localStorage saat aplikasi dimuat
  useEffect(() => {
    // Gunakan 'token' sebagai key, sesuai dengan praktik umum
    const storedUser = localStorage.getItem('user'); 
    if (storedUser) {
        // Asumsi data user disimpan dalam bentuk JSON string
        setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false); // Selesai loading
  }, []);
// useEffect(() => {
//   try {
//     const raw = localStorage.getItem("user");
//     if (!raw) {
//       setCurrentUser(null);
//     } else {
//       setCurrentUser(JSON.parse(raw));
//     }
//   } catch (e) {
//     localStorage.removeItem("user");
//     setCurrentUser(null);
//   } finally {
//     setLoading(false);
//   }
// }, []);
  // Fungsi untuk login
  const login = async (nama, password) => {
    try {
        // Ganti '/login' dengan endpoint Flask Anda yang benar
        const response = await API.post('/login', { nama, password }); 
        
        if (response.data.success) {
            const user = response.data.user;
            
            // Simpan data user (bukan hanya token) ke localStorage
            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);
            return true; // Login berhasil
        }
        return false; // Login gagal (ditangani di catch jika status != 200)
    } catch (error) {
        console.error("Login Gagal:", error);
        // Melempar error message dari backend, atau pesan default
        const errorMessage = error.response?.data?.message || "Nama atau password salah.";
        throw new Error(errorMessage);
    }
  };

  // Fungsi untuk logout
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser, // true jika currentUser tidak null
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Tampilkan anak-anak hanya setelah cek localStorage selesai */}
      {!loading && children}
    </AuthContext.Provider>
  );
}