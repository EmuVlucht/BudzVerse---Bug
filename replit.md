# Bot WhatsApp Pengganti PP Otomatis

## Overview
Bot WhatsApp yang secara otomatis mengganti foto profil (PP) berdasarkan waktu dan hari libur menggunakan timezone WIT (Asia/Makassar). Bot ini menggunakan library whatsapp-web.js untuk berinteraksi dengan WhatsApp Web.

## Status Project
- **Created**: 9 November 2025
- **Status**: Siap digunakan
- **Version**: 1.0.0

## Fitur Utama
1. **Penggantian PP Otomatis**: Bot mengecek setiap menit dan mengganti PP sesuai dengan waktu dan kondisi
2. **Sistem Prioritas PP**:
   - **PP C (khusus.jpg)**: Prioritas tertinggi
     - Jam 12:00-12:59 WIT
     - Hari libur (Sabtu, Minggu, dan hari libur nasional dari libur.json)
   - **PP A (malam.png)**: Jam 17:00-04:59 WIT (12 jam)
   - **PP B (siang.png)**: Jam 05:00-11:59 WIT (7 jam) dan 13:00-16:59 WIT (4 jam)
3. **Deteksi Hari Libur**: Otomatis mendeteksi Sabtu, Minggu, dan hari libur dari file libur.json
4. **Session Management**: Menyimpan sesi WhatsApp agar tidak perlu scan QR berulang kali
5. **Timezone WIT**: Menggunakan Asia/Makassar (Waktu Indonesia Timur)

## Struktur File
```
.
├── bot.js              # File utama bot
├── libur.json          # Daftar hari libur nasional
├── malam.png           # PP A (17:00-04:59 WIT)
├── siang.png           # PP B (05:00-11:59 & 13:00-16:59 WIT)
├── khusus.jpg          # PP C (12:00-12:59 & hari libur)
├── package.json        # Dependencies Node.js
└── .gitignore          # File yang diabaikan git
```

## Dependencies
- **whatsapp-web.js**: Library untuk WhatsApp Web API
- **qrcode-terminal**: Menampilkan QR code di terminal
- **moment-timezone**: Handling timezone WIT
- **chromium**: Browser untuk puppeteer (system dependency)

## Cara Menggunakan

### 1. Pertama Kali (Koneksi WhatsApp)
Saat bot berjalan pertama kali, Anda akan melihat QR code di console. Scan QR code tersebut dengan WhatsApp Anda:
1. Buka WhatsApp di ponsel
2. Tap titik tiga (⋮) > Perangkat Tertaut
3. Tap "Tautkan Perangkat"
4. Scan QR code yang muncul di console

### 2. Menjalankan Bot
Bot sudah dikonfigurasi untuk berjalan otomatis. Workflow "WhatsApp Bot" akan menjalankan perintah `npm start`.

### 3. Mengganti Gambar PP
Untuk mengganti gambar PP yang digunakan bot:
1. Ganti file `malam.png` untuk PP malam (17:00-04:59)
2. Ganti file `siang.png` untuk PP siang (05:00-11:59 & 13:00-16:59)
3. Ganti file `khusus.jpg` untuk PP khusus (jam 12 & hari libur)

### 4. Menambah/Edit Hari Libur
Edit file `libur.json` dengan format:
```json
{
  "2025-12-25": "Natal",
  "2025-05-01": "Hari Buruh"
}
```
Format tanggal: YYYY-MM-DD

## Logika Prioritas PP

### PP C (Khusus) - Prioritas Tertinggi
PP C akan digunakan ketika:
1. Jam 12:00-12:59 WIT (kapan pun)
2. Hari Sabtu atau Minggu (sepanjang hari)
3. Hari libur nasional sesuai libur.json (sepanjang hari)

### PP A (Malam-Subuh)
Digunakan jam 17:00-04:59 WIT (jika bukan jam 12 dan bukan hari libur)

### PP B (Pagi-Sore)
Digunakan pada:
- Jam 05:00-11:59 WIT (7 jam)
- Jam 13:00-16:59 WIT (4 jam)
(jika bukan jam 12 dan bukan hari libur)

## Technical Details

### Timezone
Bot menggunakan timezone `Asia/Makassar` (WIT - Waktu Indonesia Timur, UTC+8).

### Check Interval
Bot mengecek dan mengganti PP setiap 60 detik (1 menit).

### Session Storage
Sesi WhatsApp disimpan di folder `.wwebjs_auth/` (diabaikan oleh git).

## Troubleshooting

### Bot tidak terhubung ke WhatsApp
- Pastikan Anda sudah scan QR code
- Cek koneksi internet
- Restart workflow jika perlu

### PP tidak berubah
- Pastikan file gambar (malam.png, siang.png, khusus.jpg) ada di root folder
- Cek console log untuk error message
- Pastikan waktu sistem sesuai dengan WIT

### Error saat start bot
- Pastikan semua dependencies terinstall dengan `npm install`
- Cek apakah chromium sudah terinstall sebagai system dependency

## User Preferences
- **Bahasa**: Indonesia
- **Timezone**: WIT (Asia/Makassar)
- **Framework**: Node.js dengan whatsapp-web.js

## Recent Changes
- **9 Nov 2025**: Project dibuat dari nol dengan semua fitur utama
  - Implementasi logika prioritas PP (C > A > B)
  - Integrasi moment-timezone untuk WIT
  - Setup chromium untuk puppeteer di Replit environment
  - Generate placeholder images untuk PP
