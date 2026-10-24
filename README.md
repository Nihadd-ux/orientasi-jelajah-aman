# Orientasi Jelajah Aman

## Fitur UTS (Oktober 2026)

Aplikasi ini telah disempurnakan untuk Ujian Tengah Semester dengan empat fitur wajib:

1. **Ikon tab bar & label navigasi** — Beranda, Favorit & Riwayat, Pengaturan, dan Tentang memakai ikon unik dari `@expo/vector-icons` (Ionicons).
2. **Riwayat pencarian terakhir** — maksimal 10 pencarian disimpan di AsyncStorage, tanpa duplikat, dan dapat diklik untuk otomatis mencari ulang kota.
3. **Penghapusan cache kota** — setiap kota pada daftar cache memiliki tombol hapus dengan konfirmasi `Alert` (mobile) atau `window.confirm` (web).
4. **Tema Terang / Gelap / Ikuti Sistem** — pilihan tema di menu Pengaturan diterapkan ke seluruh layar dan tersimpan setelah aplikasi ditutup.

Laporan lengkap beserta screenshot tersedia di [`LAPORAN_UTS.md`](./LAPORAN_UTS.md). Folder bukti tangkapan layar berada di [`dokumentasi/`](./dokumentasi).

**Repository GitHub:** https://github.com/Nihadd-ux/orientasi-jelajah-aman

## Dokumentasi Status Data & Offline-First (Praktikum Pertemuan 7)

- **Cache-Segar**: Data lokal di SQLite yang disimpan kurang dari 30 menit lalu (masih dalam batas TTL), sehingga langsung ditampilkan tanpa memanggil jaringan internet.
- **Cache-Basi**: Data lokal yang sudah berumur 30 menit atau lebih, namun tetap ditampilkan sebagai fallback saat jaringan internet gagal atau perangkat dalam mode offline.
- **First-Run Offline**: Kondisi saat aplikasi dijalankan pertama kali (atau cache dikosongkan) tanpa koneksi internet sama sekali, sehingga tidak ada data tersimpan di SQLite dan aplikasi menampilkan pesan error informatif beserta tombol 'Coba Lagi'.
- **Pentingnya Label Status Data**: Label status data memberikan transparansi yang jujur kepada pengguna, agar pengguna dapat membedakan secara jelas apakah informasi cuaca dan kualitas udara yang ditampilkan merupakan data real-time terkini dari internet atau salinan data lama yang mungkin sudah usang.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
