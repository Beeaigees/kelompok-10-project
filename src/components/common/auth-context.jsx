"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mengecek apakah ada token yang tersimpan saat web dimuat
    const token = localStorage.getItem("access_token");

    if (token) {
      fetch("http://localhost:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token tidak valid");
          return res.json();
        })
        .then((data) => {
          setUser(data); // data berisi { id, username, role }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("access_token", token);
    // Setelah token disimpan, Anda bisa me-reload atau fetch ulang profil di sini
    window.location.href = "/"; // Memaksa reload agar context mengambil ulang data /api/me
  };

  const logout = async () => {
    try {
      // Minta server mencabut token (blacklist) SELAMA token masih terpasang,
      // karena apiFetch membaca token dari localStorage untuk header Authorization.
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      // Token sudah kedaluwarsa/ditolak: tetap lanjut logout di sisi klien
      console.error("Gagal mencabut token di server:", err);
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
      // replace() agar tombol Back tidak membuka lagi halaman yang butuh sesi
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook kustom untuk memanggil context dengan mudah
export const useAuth = () => useContext(AuthContext);
