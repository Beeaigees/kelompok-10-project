const API_BASE = "http://localhost:8000/api";

/**
 * Pembungkus `fetch` ke backend.
 *
 * - Menyisipkan header `Authorization: Bearer <token>` otomatis dari localStorage,
 *   sehingga tiap komponen tidak perlu membaca token sendiri-sendiri.
 * - Menangani 401 (sesi habis) -> hapus token & arahkan ke /login.
 * - Menangani 403 (role tidak berwenang) -> lempar Error dengan pesan yang jelas.
 *
 * Pemanggil tetap mengecek `res.ok` untuk error lain (422, 500, dst).
 */
export async function apiFetch(path, options = {}) {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("access_token")
      : null;

  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
      // replace() supaya tombol Back tidak membuka lagi halaman yang butuh sesi
      window.location.replace("/login");
    }
    throw new Error("Sesi Anda berakhir. Silakan login kembali.");
  }

  if (res.status === 403) {
    throw new Error("Anda tidak memiliki izin untuk melakukan aksi ini.");
  }

  return res;
}

export { API_BASE };
