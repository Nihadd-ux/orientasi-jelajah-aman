// src/services/riwayatPencarian.ts
// Menyimpan riwayat pencarian kota di penyimpanan lokal (AsyncStorage).
import AsyncStorage from "@react-native-async-storage/async-storage";

import { KotaRiwayat } from "../types/riwayat";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
export const MAKS_RIWAYAT = 10;

function valid(kota: unknown): kota is KotaRiwayat {
  if (!kota || typeof kota !== "object") return false;
  const k = kota as Record<string, unknown>;
  return (
    typeof k.id === "number" &&
    typeof k.nama === "string" &&
    typeof k.latitude === "number" &&
    typeof k.longitude === "number"
  );
}

export async function ambilRiwayatPencarian(): Promise<KotaRiwayat[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);
    if (!json) return [];
    const data: unknown = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data.filter(valid).slice(0, MAKS_RIWAYAT);
  } catch {
    return [];
  }
}

/**
 * Simpan kota ke urutan teratas. Kota yang sama tidak diduplikasi dan
 * daftar dipangkas agar hanya menyisakan 10 pencarian terakhir.
 */
export async function simpanRiwayatPencarian(
  kota: Omit<KotaRiwayat, "dicariPada">,
): Promise<KotaRiwayat[]> {
  const daftar = await ambilRiwayatPencarian();
  const kunciKota = `${kota.id}|${kota.nama.toLowerCase()}|${kota.latitude.toFixed(
    3,
  )}|${kota.longitude.toFixed(3)}`;

  const tanpaDuplikat = daftar.filter((item) => {
    const kunciItem = `${item.id}|${item.nama.toLowerCase()}|${item.latitude.toFixed(
      3,
    )}|${item.longitude.toFixed(3)}`;
    return kunciItem !== kunciKota;
  });

  const baru: KotaRiwayat[] = [
    { ...kota, dicariPada: Date.now() },
    ...tanpaDuplikat,
  ].slice(0, MAKS_RIWAYAT);

  try {
    await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(baru));
  } catch {
    // Riwayat bersifat pelengkap; kegagalan menyimpan tidak boleh mengganggu pencarian.
  }
  return baru;
}

export async function hapusRiwayatPencarian(id: number): Promise<void> {
  const daftar = await ambilRiwayatPencarian();
  await AsyncStorage.setItem(
    KUNCI_RIWAYAT,
    JSON.stringify(daftar.filter((kota) => kota.id !== id)),
  );
}

export async function hapusSemuaRiwayatPencarian(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI_RIWAYAT);
}
