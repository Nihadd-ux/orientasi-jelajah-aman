// src/app/(tabs)/index.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
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
  hapusCache,
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
import { konfirmasiHapus } from "../../utils/konfirmasi";

function formatTanggal(tanggal: string): string {
  try {
    return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
      weekday: "short",
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
  const requestIdRef = useRef(0); // pencegah race condition
  const parameterTerakhirRef = useRef<string | null>(null);

  const muatKotaTersimpan = useCallback(async () => {
    try {
      setKotaTersimpan(await daftarKotaTersimpan());
    } catch {
      // Daftar tersimpan hanya pelengkap tampilan beranda.
    }
  }, []);

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, [muatKotaTersimpan]);

  // Pencarian dengan debounce. Hasil basi dari ketikan sebelumnya diabaikan.
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
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      muatKotaTersimpan();

      // Catat pencarian ke riwayat (maksimal 10, tanpa duplikat).
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

  // Membuka kota dari tab Favorit & Riwayat: isi kolom pencarian lalu tampilkan
  // cuaca kota tersebut secara otomatis.
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

  function hapusCacheKota(kota: RingkasanKotaTersimpan) {
    konfirmasiHapus({
      judul: "Hapus cache kota?",
      pesan: `Data cuaca ${kota.nama} yang tersimpan di perangkat akan dihapus. Kota ini tidak bisa dibuka offline sampai pencarian berikutnya.`,
      onKonfirmasi: async () => {
        await hapusCache(kota.kunci);
        await muatKotaTersimpan();
      },
    });
  }

  const aqiTingkat = hasil
    ? konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)
    : null;

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 4 }}>
          <Text
            style={{ fontSize: 24, fontWeight: "800", color: colors.text }}
            accessibilityRole="header"
          >
            Jelajah Aman
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Pantau cuaca dan kualitas udara sebelum beraktivitas.
          </Text>
        </View>

        <SearchBox nilai={teksCari} onCari={setTeksCari} />

        <Pressable
          onPress={gunakanLokasiSaatIni}
          accessibilityRole="button"
          accessibilityLabel="Gunakan lokasi saat ini untuk melihat cuaca"
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: colors.primarySoft,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 12,
            borderRadius: 14,
          }}
        >
          <Ionicons name="navigate" size={18} color={colors.primary} />
          <Text
            style={{
              color: colors.primary,
              fontWeight: "700",
              fontSize: 14,
            }}
          >
            Gunakan Lokasi Saat Ini
          </Text>
        </Pressable>

        {pesanLokasi && (
          <Text
            accessibilityLabel={pesanLokasi}
            style={{
              fontSize: 12,
              color: colors.warning,
              backgroundColor: colors.warningSoft,
              padding: 10,
              borderRadius: 10,
            }}
          >
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.length > 0 && (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: colors.textMuted,
                paddingHorizontal: 14,
                paddingTop: 12,
                paddingBottom: 6,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Hasil pencarian
            </Text>
            {hasilPencarian.map((kota, indeks) => (
              <Pressable
                key={`${kota.id}-${indeks}`}
                onPress={() => pilihKota(kota)}
                accessibilityRole="button"
                accessibilityLabel={`Pilih kota ${kota.name}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderTopWidth: indeks === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={colors.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    {kota.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {[kota.admin1, kota.country].filter(Boolean).join(", ")}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
        )}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 8 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons
                name="cloud-done-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  fontWeight: "700",
                  color: colors.textSecondary,
                  fontSize: 13,
                }}
              >
                Tersimpan di perangkat (bisa dibuka offline)
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {kotaTersimpan.map((k) => {
                const kodeKota: HasilGeocoding = {
                  id: k.id,
                  name: k.nama,
                  latitude: k.latitude,
                  longitude: k.longitude,
                  country: "",
                };
                return (
                  <View
                    key={k.kunci}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingLeft: 12,
                    }}
                  >
                    <Pressable
                      onPress={() => pilihKota(kodeKota)}
                      accessibilityRole="button"
                      accessibilityLabel={`Buka cuaca tersimpan ${k.nama}`}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingVertical: 12,
                      }}
                    >
                      <Ionicons
                        name="save-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={{ color: colors.text, fontSize: 14 }}>
                        {k.nama}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => hapusCacheKota(k)}
                      accessibilityRole="button"
                      accessibilityLabel={`Hapus cache ${k.nama}`}
                      hitSlop={6}
                      style={{ padding: 12 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.danger}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {sedangMemuat && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <ActivityIndicator color={colors.primary} />
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Memuat data cuaca...
            </Text>
          </View>
        )}

        {pesanError && (
          <View
            style={{
              backgroundColor: colors.dangerSoft,
              borderWidth: 1,
              borderColor: colors.danger,
              borderRadius: 14,
              padding: 14,
              gap: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name="alert-circle"
                size={20}
                color={colors.danger}
              />
              <Text
                accessibilityLabel={pesanError}
                style={{
                  flex: 1,
                  color: colors.danger,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {pesanError}
              </Text>
            </View>
            <Pressable
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
              accessibilityRole="button"
              style={{
                alignSelf: "flex-start",
                backgroundColor: colors.danger,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                Coba Lagi
              </Text>
            </Pressable>
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 12 }}>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(
                hasil.kualitasUdara.indeksAQI,
              )}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 14,
                  padding: 12,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  KONDISI
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 14,
                  padding: 12,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  KECEPATAN ANGIN
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {hasil.cuaca.saatIni.kecepatanAngin} km/j
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 14,
                  padding: 12,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 11, color: colors.textMuted }}>
                  KUALITAS UDARA
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {aqiTingkat}
                </Text>
              </View>
            </View>

            {hasil.cuaca.harian.tanggal.length > 0 && (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  padding: 14,
                  gap: 10,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    color: colors.text,
                    fontSize: 14,
                  }}
                >
                  Prakiraan 3 Hari
                </Text>
                {hasil.cuaca.harian.tanggal.slice(0, 3).map((tanggal, i) => (
                  <View
                    key={tanggal}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      {formatTanggal(tanggal)}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {labelKodeCuaca(hasil.cuaca.harian.kodeCuaca[i] ?? 0)}
                    </Text>
                    <Text
                      style={{
                        color: colors.text,
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {Math.round(hasil.cuaca.harian.suhuMaksimal[i] ?? 0)}° /{" "}
                      {Math.round(hasil.cuaca.harian.suhuMinimal[i] ?? 0)}°
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => pilihKota(kotaTerpilih, true)}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                }}
              >
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
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
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                }}
              >
                <Ionicons name="heart" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  Favorit
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
