# Revisi Backend

## [2026-10-13] Fix: DATABASE_URL tidak terbaca (None)

### Problem
Backend FastAPI crash saat startup dengan error:

```
sqlalchemy.exc.ArgumentError: Expected string or URL object, got None
```

`DATABASE_URL` bernilai `None` karena `load_dotenv()` mencari file `.env` di folder **`backend/`**, padahal file `.env` berada di **root project**.

### Root Cause
`load_dotenv()` tanpa argumen akan mencari `.env` di current working directory, yaitu `backend/`. File `.env` yang berisi `DATABASE_URL` terletak satu level di atas (`kelompok-10-project/.env`), sehingga tidak ditemukan.

### File yang Diubah
**`backend/main.py` — baris 23**

```diff
- load_dotenv()
+ load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
```

### Penjelasan Perubahan
- `os.path.dirname(__file__)` → mengambil direktori tempat `main.py` berada (`backend/`)
- `".."` → naik satu level ke root project
- `".env"` → nama file env yang dituju
- Hasil: path absolut ke `kelompok-10-project/.env` ✅

### Cara Test
Jalankan ulang backend setelah perubahan ini:
```powershell
uvicorn main:app --reload
```
Backend harus bisa start tanpa error dan terhubung ke Supabase.

---

## [2026-10-13] Fix: ModuleNotFoundError — psycopg tidak ter-install

### Problem
Setelah fix pertama, backend masih crash dengan error:

```
ModuleNotFoundError: No module named 'psycopg'
```

### Root Cause
`DATABASE_URL` menggunakan dialect `postgresql+psycopg://` yang membutuhkan **psycopg versi 3** (`psycopg`), bukan `psycopg2`.  
Di `requirements.txt` hanya ada `psycopg2-binary` (versi lama), sehingga saat venv baru dibuat dan `pip install -r requirements.txt` dijalankan, psycopg v3 tidak ikut ter-install.

### File yang Diubah

**`backend/requirements.txt` — baris terakhir**

```diff
  psycopg2-binary
+ psycopg[binary]
```

### Penjelasan Perubahan
- `psycopg[binary]` → menginstall psycopg v3 beserta binary driver-nya (tidak perlu build dari source)
- `psycopg2-binary` tetap dipertahankan karena mungkin dipakai dependency lain

### Cara Test
```powershell
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend harus start dan tidak ada `ModuleNotFoundError`.

