## Cara menjalankan ulang nanti

**Backend** (terminal 1):

```bash
cd backend
.venv/Scripts/python.exe -m uvicorn main:app --reload --port 8000
```

Jika perlu setup ulang environment:

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
```

**Frontend** (terminal 2, dari root proyek):

```bash
npm install   # hanya jika node_modules belum ada
npm run dev
```
