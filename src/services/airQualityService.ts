// src/services/airQualityService.ts
import { DataKualitasUdara } from "../types/weather";
const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const BATAS_WAKTU_MS = 5000;
export async function ambilKualitasUdara(
  latitude: number,
  longitude: number,
): Promise<DataKualitasUdara> {
  const url = `${BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Gagal memuat kualitas udara (status ${response.status})`);
    }
    const data = await response.json();
    return {
      indeksAQI: data.current.european_aqi,
      pm25: data.current.pm2_5,
      pm10: data.current.pm10,
    };
  } finally {
    clearTimeout(timer);
  }
}
