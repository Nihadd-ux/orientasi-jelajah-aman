// src/app/(tabs)/index.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useDebounce } from "../../hooks/use-debounce";
import { useTheme } from "../../hooks/use-theme";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
} from "../../services/cacheRepository";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import { cariKota } from "../../services/geocodingService";
import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationService";
import { simpanRiwayatPencarian } from "../../services/riwayatPencarian";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { HasilGeocoding } from "../../types/geocoding";

function formatTanggal(tanggal: string): string {
  try {
    return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return tanggal;
  }
}

export default function HalamanUtama() {
  const colors = useTheme();
  const params = useLocalSearchParams<{
    cari?: string;
    id?: string;
    lat?: string;
    lon?: string;
    ts?: string;
  }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);
  const parameterTerakhirRef = useRef<string | null>(null);

  const muatKotaTersimpan = useCallback(async () => {
    try {
      setKotaTersimpan(await daftarKotaTersimpan());
    } catch {
      // Daftar tersimpan hanya pelengkap tampilan beranda.
    }
  }, []);

  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, [muatKotaTersimpan]);

  useEffect(() => {
    const kataKunci = teksTertunda.trim();
    if (kataKunci.length === 0) {
      setHasilPencarian([]);
      return;
    }
    let aktif = true;
    cariKota(kataKunci)
      .then((hasilKota) => {
        if (aktif) setHasilPencarian(hasilKota);
      })
      .catch(() => {
        if (aktif) setHasilPencarian([]);
      });
    return () => {
      aktif = false;
    };
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    setHasilPencarian([]);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(data);
      muatKotaTersimpan();

      if (kota.name !== "Lokasi Saat Ini") {
        void simpanRiwayatPencarian({
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        });
      }
    } catch {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  // Membuka kota dari tab Favorit & Riwayat.
  useEffect(() => {
    if (!params.cari) return;
    const kunciParameter = `${params.cari}|${params.ts ?? ""}`;
    if (parameterTerakhirRef.current === kunciParameter) return;
    parameterTerakhirRef.current = kunciParameter;

    setTeksCari(params.cari);
    const id = Number(params.id);
    const lintang = Number(params.lat);
    const bujur = Number(params.lon);

    if (
      params.lat !== undefined &&
      params.lon !== undefined &&
      Number.isFinite(lintang) &&
      Number.isFinite(bujur)
    ) {
      void pilihKota({
        id: Number.isFinite(id) ? id : -1,
        name: params.cari,
        latitude: lintang,
        longitude: bujur,
        country: "",
      });
      return;
    }

    cariKota(params.cari)
      .then((hasilKota) => {
        if (hasilKota[0]) void pilihKota(hasilKota[0]);
      })
      .catch(() => {
        setPesanError("Gagal mencari kota. Periksa koneksi internet Anda.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.cari, params.ts, params.id, params.lat, params.lon]);

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
      );
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
      );
      return;
    }
    setPesanLokasi(null);
    try {
      const koordinat = await ambilKoordinatSaatIni();
      await pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi("Gagal membaca lokasi perangkat. Silakan cari manual.");
    }
  }

  const warnaTombol = {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center" as const,
  };

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}
          accessibilityRole="header"
        >
          Jelajah Aman
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          Cari cuaca dan kualitas udara kota.
        </Text>

        <SearchBox nilai={teksCari} onCari={setTeksCari} />

        <Pressable
          onPress={gunakanLokasiSaatIni}
          accessibilityRole="button"
          accessibilityLabel="Gunakan lokasi saat ini untuk melihat cuaca"
          style={{
            backgroundColor: colors.backgroundSelected,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13 }}>
            Gunakan Lokasi Saat Ini
          </Text>
        </Pressable>

        {pesanLokasi && (
          <Text
            accessibilityLabel={pesanLokasi}
            style={{ fontSize: 12, color: colors.warning }}
          >
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.length > 0 && (
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>
              Hasil pencarian
            </Text>
            {hasilPencarian.map((kota, indeks) => (
              <Pressable
                key={`${kota.id}-${indeks}`}
                onPress={() => pilihKota(kota)}
                accessibilityRole="button"
                accessibilityLabel={`Pilih kota ${kota.name}`}
                style={{
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {kota.name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {[kota.admin1, kota.country].filter(Boolean).join(", ")}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <Pressable
                key={k.kunci}
                onPress={() =>
                  pilihKota({
                    id: k.id,
                    name: k.nama,
                    latitude: k.latitude,
                    longitude: k.longitude,
                    country: "",
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Buka cuaca tersimpan ${k.nama}`}
                style={{
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {k.nama}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator color={colors.primary} />}

        {pesanError && (
          <View style={{ gap: 8 }}>
            <Text
              accessibilityLabel={pesanError}
              style={{ fontSize: 12, color: colors.danger }}
            >
              {pesanError}
            </Text>
            <Pressable
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
              accessibilityRole="button"
              style={warnaTombol}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                Coba Lagi
              </Text>
            </Pressable>
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 10 }}>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} • Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            {hasil.cuaca.harian.tanggal.length > 0 && (
              <View style={{ gap: 4 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Prakiraan 3 Hari
                </Text>
                {hasil.cuaca.harian.tanggal.slice(0, 3).map((tanggal, i) => (
                  <View
                    key={tanggal}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {formatTanggal(tanggal)}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 12 }}>
                      {Math.round(hasil.cuaca.harian.suhuMaksimal[i] ?? 0)}° /{" "}
                      {Math.round(hasil.cuaca.harian.suhuMinimal[i] ?? 0)}°
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => pilihKota(kotaTerpilih, true)}
                accessibilityRole="button"
                style={[warnaTombol, { flex: 1 }]}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                  Perbarui
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
                accessibilityRole="button"
                style={[
                  warnaTombol,
                  {
                    flex: 1,
                    backgroundColor: colors.backgroundElement,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ color: colors.text, fontWeight: "bold" }}>
                  Tambahkan ke Favorit
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
