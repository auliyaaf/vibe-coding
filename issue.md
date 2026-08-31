# Perencanaan Implementasi: Registrasi User Baru (ElysiaJS + Drizzle + MySQL)

Dokumen ini berisi panduan langkah demi langkah untuk mengimplementasikan fitur registrasi user baru. Ikuti tahapan di bawah ini secara berurutan.

---

## 1. Spesifikasi Teknis

### A. Skema Tabel `users`
Perbarui/buat tabel `users` di database dengan struktur berikut:
- `id`: Integer, Primary Key, Auto Increment.
- `name`: Varchar(255), Not Null.
- `email`: Varchar(255), Not Null, Unique.
- `password`: Varchar(255), Not Null. (Disimpan dalam bentuk hash **bcrypt**).
- `created_at`: Timestamp, Default `current_timestamp`.

### B. API Endpoint Registrasi
*   **Method**: `POST`
*   **Path**: `/api/users`
*   **Request Body**:
    ```json
    {
      "name": "keonho",
      "email": "dedekeonho@localhost",
      "password": "haloakudede"
    }
    ```
*   **Response (Success - HTTP 201 Created)**:
    ```json
    {
      "data": "Annyeong Dede!"
    }
    ```
*   **Response (Error - Email Sudah Terdaftar - HTTP 400 Bad Request)**:
    ```json
    {
      "email": "email sudah terdaftar"
    }
    ```

---

## 2. Struktur Folder & Berkas Baru
Pastikan struktur kode diletakkan di dalam folder `src/`:
```text
src/
├── db/
│   └── schema.ts          # Definisikan model tabel users
├── services/
│   └── users-service.ts   # Logic bisnis (validasi email & hashing password)
├── routes/
│   └── users-route.ts     # Endpoint routing ElysiaJS
└── index.ts               # Entrypoint aplikasi (mount router)
```

---

## 3. Langkah-Langkah Implementasi

### Langkah 1: Update Schema Database (`src/db/schema.ts`)
1. Definisikan tabel `users` sesuai spesifikasi di atas menggunakan Drizzle ORM MySQL core (`mysqlTable`, `int`, `varchar`, `timestamp`).
2. Pastikan kolom `email` memiliki property `.unique()`.
3. Jalankan perintah migrasi berikut untuk memperbarui database:
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

### Langkah 2: Buat Service Layer (`src/services/users-service.ts`)
1. Buat berkas baru di `src/services/users-service.ts`.
2. Impor database instance `db` dan schema `users`.
3. Gunakan utility bawaan Bun untuk hashing password dengan bcrypt:
   ```typescript
   // Gunakan Bun.password.hash secara native (menggunakan algoritma bcrypt secara default)
   const hashedPassword = await Bun.password.hash(password, {
     algorithm: "bcrypt",
     cost: 10
   });
   ```
4. Buat fungsi asynchronous untuk registrasi:
   - Cek terlebih dahulu apakah `email` sudah terdaftar di database.
   - Jika sudah ada, lempar error atau kembalikan status kegagalan (misalnya melempar error kustom seperti `new Error("EMAIL_EXISTS")`).
   - Jika belum ada, hash password-nya lalu lakukan insert data user baru ke database.

### Langkah 3: Buat Route Layer (`src/routes/users-route.ts`)
1. Buat berkas baru di `src/routes/users-route.ts`.
2. Inisialisasi router baru Elysia:
   ```typescript
   import { Elysia, t } from "elysia";
   import { registerUser } from "../services/users-service";
   
   export const usersRoute = new Elysia({ prefix: "/api" })
     .post("/users", async ({ body, set }) => {
       try {
         await registerUser(body);
         set.status = 201;
         return { data: "Annyeong Dede!" };
       } catch (error: any) {
         if (error.message === "EMAIL_EXISTS") {
           set.status = 400;
           return { email: "email sudah terdaftar" };
         }
         set.status = 500;
         return { error: "Terjadi kesalahan pada server" };
       }
     }, {
       body: t.Object({
         name: t.String(),
         email: t.String(),
         password: t.String()
       })
     });
   ```

### Langkah 4: Daftarkan Route ke Main Entrypoint (`src/index.ts`)
1. Buka file `src/index.ts`.
2. Impor `usersRoute` dari `./routes/users-route`.
3. Daftarkan router tersebut ke instance utama Elysia menggunakan `.use(usersRoute)`.

---

## 4. Pengujian Fitur
Setelah semua berkas dibuat, jalankan server dengan `bun run dev` dan uji menggunakan `curl`:

1. **Uji Registrasi Sukses**:
   ```bash
   curl -i -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"keonho\",\"email\":\"dedekeonho@localhost\",\"password\":\"haloakudede\"}"
   ```
   *Ekspektasi Response:* HTTP 201 Created & `{"data":"Annyeong Dede!"}`

2. **Uji Duplikasi Email (Error)**:
   Jalankan ulang perintah `curl` di atas untuk kedua kalinya.
   *Ekspektasi Response:* HTTP 400 Bad Request & `{"email":"email sudah terdaftar"}`
