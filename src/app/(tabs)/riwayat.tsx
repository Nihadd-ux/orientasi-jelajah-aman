// src/app/(tabs)/riwayat.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/use-theme";
import {
  daftarKotaTersimpan,
  hapusCache,
  hapusSemuaCache,
} from "../../services/cacheRepository";
import {
  ambilSemuaFavorit,
  hapusFavorit,
} from "../../services/favoritStorage";
import {
  ambilRiwayatPencarian,
  hapusRiwayatPencarian,
  hapusSemuaRiwayatPencarian,
} from "../../services/riwayatPencarian";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { KotaFavorit } from "../../types/favorit";
import { KotaRiwayat } from "../../types/riwayat";
import { konfirmasiHapus } from "../../utils/konfirmasi";

type KotaBuka = {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
};

function formatWaktu(waktu: number): string {
  const selisihMenit = Math.max(0, Math.floor((Date.now() - waktu) / 60000));
  if (selisihMenit < 1) return "baru saja";
  if (selisihMenit < 60) return `${selisihMenit} menit lalu`;
  const jam = Math.floor(selisihMenit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

export default function TabRiwayat() {
  const colors = useTheme();
  const [riwayat, setRiwayat] = useState<KotaRiwayat[]>([]);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState<string | null>(null);

  const muatSemua = useCallback(async () => {
    try {
      const [hasilRiwayat, hasilCache, hasilFavorit] = await Promise.all([
        ambilRiwayatPencarian(),
        daftarKotaTersimpan(20),
        ambilSemuaFavorit(),
      ]);
      setRiwayat(hasilRiwayat);
      setKotaTersimpan(hasilCache);
      setDaftarFavorit(hasilFavorit);
    } catch {
      setPesan("Sebagian data riwayat gagal dimuat.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void muatSemua();
    }, [muatSemua]),
  );

  // Ketuk riwayat -> kembali ke Beranda, kolom pencarian terisi, cuaca dimuat.
  function bukaKota(kota: KotaBuka) {
    router.push({
      pathname: "/",
      params: {
        cari: kota.nama,
        id: String(kota.id),
        lat: String(kota.latitude),
        lon: String(kota.longitude),
        ts: String(Date.now()),
      },
    });
  }

  function hapusSatuRiwayat(kota: KotaRiwayat) {
    konfirmasiHapus({
      judul: "Hapus riwayat?",
      pesan: `Riwayat pencarian "${kota.nama}" akan dihapus dari daftar.`,
      onKonfirmasi: async () => {
        await hapusRiwayatPencarian(kota.id);
        setRiwayat((prev) => prev.filter((item) => item.id !== kota.id));
        setPesan(`Riwayat "${kota.nama}" dihapus.`);
      },
    });
  }

  function hapusSemuaRiwayat() {
    konfirmasiHapus({
      judul: "Hapus semua riwayat?",
      pesan: "Seluruh daftar pencarian terakhir akan dihapus dari perangkat.",
      labelKonfirmasi: "Hapus Semua",
      onKonfirmasi: async () => {
        await hapusSemuaRiwayatPencarian();
        setRiwayat([]);
        setPesan("Semua riwayat pencarian telah dihapus.");
      },
    });
  }

  function hapusKotaCache(kota: RingkasanKotaTersimpan) {
    konfirmasiHapus({
      judul: "Hapus cache kota?",
      pesan: `Data cuaca ${kota.nama} yang tersimpan di perangkat akan dihapus. Kota ini tidak dapat dibuka offline sampai dicari lagi saat online.`,
      onKonfirmasi: async () => {
        await hapusCache(kota.kunci);
        setKotaTersimpan((prev) =>
          prev.filter((item) => item.kunci !== kota.kunci),
        );
        setPesan(`Cache ${kota.nama} berhasil dihapus.`);
      },
    });
  }

  function hapusSemuaDataCache() {
    konfirmasiHapus({
      judul: "Hapus semua cache?",
      pesan:
        "Semua data cuaca yang tersimpan di perangkat akan dihapus. Data hanya bisa dibuka lagi saat ada koneksi internet.",
      labelKonfirmasi: "Hapus Semua",
      onKonfirmasi: async () => {
        await hapusSemuaCache();
        setKotaTersimpan([]);
        setPesan("Semua cache kota telah dihapus.");
      },
    });
  }

  function hapusKotaFavorit(kota: KotaFavorit) {
    konfirmasiHapus({
      judul: "Hapus favorit?",
      pesan: `Kota ${kota.nama} akan dihapus dari daftar favorit.`,
      onKonfirmasi: async () => {
        await hapusFavorit(kota.id);
        setDaftarFavorit((prev) => prev.filter((item) => item.id !== kota.id));
        setPesan(`Favorit ${kota.nama} dihapus.`);
      },
    });
  }

  const kartu = {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  } as const;

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View style={{ gap: 4 }}>
          <Text
            accessibilityRole="header"
            style={{ fontSize: 24, fontWeight: "800", color: colors.text }}
          >
            Favorit & Riwayat
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Pencarian terakhir, kota tersimpan offline, dan kota favoritmu.
          </Text>
        </View>

        {pesan && (
          <View
            accessibilityLabel={pesan}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.primarySoft,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Ionicons
              name="information-circle"
              size={16}
              color={colors.primary}
            />
            <Text style={{ flex: 1, fontSize: 12, color: colors.primary }}>
              {pesan}
            </Text>
            <Pressable
              onPress={() => setPesan(null)}
              accessibilityRole="button"
              accessibilityLabel="Tutup pesan"
            >
              <Ionicons name="close" size={16} color={colors.primary} />
            </Pressable>
          </View>
        )}

        {memuat ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 14,
              ...kartu,
            }}
          >
            <ActivityIndicator color={colors.primary} />
            <Text style={{ color: colors.textSecondary }}>
              Memuat riwayat...
            </Text>
          </View>
        ) : (
          <>
            {/* 1. Riwayat pencarian terakhir */}
            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    Pencarian Terakhir
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.primarySoft,
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {riwayat.length}/10
                    </Text>
                  </View>
                </View>
                {riwayat.length > 0 && (
                  <Pressable
                    onPress={hapusSemuaRiwayat}
                    accessibilityRole="button"
                    accessibilityLabel="Hapus semua riwayat pencarian"
                  >
                    <Text
                      style={{ color: colors.danger, fontSize: 12 }}
                    >
                      Hapus semua
                    </Text>
                  </Pressable>
                )}
              </View>

              {riwayat.length === 0 ? (
                <View style={{ ...kartu, padding: 16, gap: 4 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    Belum ada riwayat pencarian
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    Cari kota di Beranda, riwayat akan muncul di sini.
                  </Text>
                </View>
              ) : (
                <View style={{ ...kartu, overflow: "hidden" }}>
                  {riwayat.map((kota, indeks) => (
                    <View
                      key={`${kota.id}-${kota.dicariPada}`}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderTopWidth: indeks === 0 ? 0 : 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <Pressable
                        onPress={() => bukaKota(kota)}
                        accessibilityRole="button"
                        accessibilityLabel={`Cari ulang kota ${kota.nama}`}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          padding: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colors.primarySoft,
                          }}
                        >
                          <Ionicons
                            name="search"
                            size={15}
                            color={colors.primary}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.text,
                              fontWeight: "600",
                              fontSize: 14,
                            }}
                          >
                            {kota.nama}
                          </Text>
                          <Text
                            style={{ color: colors.textMuted, fontSize: 11 }}
                          >
                            {formatWaktu(kota.dicariPada)}
                          </Text>
                        </View>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={colors.textMuted}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => hapusSatuRiwayat(kota)}
                        accessibilityRole="button"
                        accessibilityLabel={`Hapus riwayat ${kota.nama}`}
                        style={{ padding: 12 }}
                      >
                        <Ionicons
                          name="close"
                          size={18}
                          color={colors.textMuted}
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 2. Kota tersimpan / cache */}
            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Ionicons
                    name="cloud-offline-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    Kota Tersimpan (Cache)
                  </Text>
                </View>
                {kotaTersimpan.length > 0 && (
                  <Pressable
                    onPress={hapusSemuaDataCache}
                    accessibilityRole="button"
                    accessibilityLabel="Hapus semua cache kota"
                  >
                    <Text style={{ color: colors.danger, fontSize: 12 }}>
                      Hapus semua
                    </Text>
                  </Pressable>
                )}
              </View>

              {kotaTersimpan.length === 0 ? (
                <View style={{ ...kartu, padding: 16, gap: 4 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    Belum ada cache kota
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    Data cuaca otomatis tersimpan setelah berhasil dimuat saat
                    online.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {kotaTersimpan.map((kota) => (
                    <View
                      key={kota.kunci}
                      style={{
                        ...kartu,
                        flexDirection: "row",
                        alignItems: "center",
                        paddingLeft: 12,
                      }}
                    >
                      <Pressable
                        onPress={() => bukaKota({ ...kota, nama: kota.nama })}
                        accessibilityRole="button"
                        accessibilityLabel={`Buka cuaca ${kota.nama} dari cache`}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          paddingVertical: 12,
                        }}
                      >
                        <Ionicons
                          name="save-outline"
                          size={18}
                          color={colors.primary}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.text,
                              fontWeight: "600",
                              fontSize: 14,
                            }}
                          >
                            {kota.nama}
                          </Text>
                          <Text
                            style={{ color: colors.textMuted, fontSize: 11 }}
                          >
                            Cache {formatWaktu(kota.disimpanPada)} •{" "}
                            {kota.latitude.toFixed(2)},{" "}
                            {kota.longitude.toFixed(2)}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => hapusKotaCache(kota)}
                        accessibilityRole="button"
                        accessibilityLabel={`Hapus cache kota ${kota.nama}`}
                        hitSlop={6}
                        style={{ padding: 12 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={19}
                          color={colors.danger}
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 3. Favorit */}
            <View style={{ gap: 8 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons name="heart" size={18} color={colors.danger} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Kota Favorit
                </Text>
              </View>

              {daftarFavorit.length === 0 ? (
                <View style={{ ...kartu, padding: 16, gap: 4 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    Belum ada kota favorit
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    Buka cuaca sebuah kota lalu tekan tombol Favorit.
                  </Text>
                </View>
              ) : (
                <View style={{ ...kartu, overflow: "hidden" }}>
                  {daftarFavorit.map((kota, indeks) => (
                    <View
                      key={kota.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderTopWidth: indeks === 0 ? 0 : 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <Pressable
                        onPress={() => bukaKota(kota)}
                        accessibilityRole="button"
                        accessibilityLabel={`Buka cuaca favorit ${kota.nama}`}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          padding: 12,
                        }}
                      >
                        <Ionicons
                          name="heart"
                          size={16}
                          color={colors.danger}
                        />
                        <Text
                          style={{
                            flex: 1,
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 14,
                          }}
                        >
                          {kota.nama}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => hapusKotaFavorit(kota)}
                        accessibilityRole="button"
                        accessibilityLabel={`Hapus favorit ${kota.nama}`}
                        style={{ padding: 12 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={colors.danger}
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
