// src/types/riwayat.ts
// Riwayat pencarian kota terakhir yang disimpan di perangkat (maksimal 10).
export interface KotaRiwayat {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  dicariPada: number;
}
