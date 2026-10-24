// src/app/(tabs)/pengaturan.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModeTema, useTema } from "../../contexts/tema-context";
import { useTheme } from "../../hooks/use-theme";
import {
  daftarKotaTersimpan,
  hapusSemuaCache,
} from "../../services/cacheRepository";
import {
  hapusSemuaRiwayatPencarian,
  ambilRiwayatPencarian,
} from "../../services/riwayatPencarian";
import { konfirmasiHapus } from "../../utils/konfirmasi";

type PilihanMode = {
  nilai: ModeTema;
  label: string;
  deskripsi: string;
  ikon: keyof typeof Ionicons.glyphMap;
};

const PILIHAN_MODE: PilihanMode[] = [
  {
    nilai: "terang",
    label: "Terang",
    deskripsi: "Selalu memakai tampilan terang",
    ikon: "sunny-outline",
  },
  {
    nilai: "gelap",
    label: "Gelap",
    deskripsi: "Selalu memakai tampilan gelap",
    ikon: "moon-outline",
  },
  {
    nilai: "sistem",
    label: "Ikuti Sistem",
    deskripsi: "Mengikuti pengaturan tema perangkat",
    ikon: "phone-portrait-outline",
  },
];

export default function TabPengaturan() {
  const colors = useTheme();
  const { mode, aturMode } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);
  const [jumlahCache, setJumlahCache] = useState(0);
  const [jumlahRiwayat, setJumlahRiwayat] = useState(0);

  const muatRingkasan = useCallback(async () => {
    try {
      const [cache, riwayat] = await Promise.all([
        daftarKotaTersimpan(100),
        ambilRiwayatPencarian(),
      ]);
      setJumlahCache(cache.length);
      setJumlahRiwayat(riwayat.length);
    } catch {
      // Ringkasan jumlah data bukan fitur kritis.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void muatRingkasan();
    }, [muatRingkasan]),
  );

  async function pilihMode(nilai: ModeTema) {
    await aturMode(nilai);
    const label = PILIHAN_MODE.find((item) => item.nilai === nilai)?.label;
    setPesan(`Tema tampilan diubah ke mode ${label}.`);
  }

  function hapusDataCache() {
    konfirmasiHapus({
      judul: "Hapus semua cache kota?",
      pesan:
        "Seluruh data cuaca yang tersimpan di perangkat akan dihapus. Data hanya bisa dibuka kembali saat perangkat online.",
      labelKonfirmasi: "Hapus Cache",
      onKonfirmasi: async () => {
        await hapusSemuaCache();
        setJumlahCache(0);
        setPesan("Data cuaca tersimpan sudah dihapus.");
      },
    });
  }

  function hapusRiwayat() {
    konfirmasiHapus({
      judul: "Hapus riwayat pencarian?",
      pesan: "Seluruh riwayat pencarian kota akan dihapus dari perangkat.",
      labelKonfirmasi: "Hapus Riwayat",
      onKonfirmasi: async () => {
        await hapusSemuaRiwayatPencarian();
        setJumlahRiwayat(0);
        setPesan("Riwayat pencarian berhasil dihapus.");
      },
    });
  }

  const kartu = {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
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
            Pengaturan
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Sesuaikan tampilan dan kelola data yang tersimpan di perangkat.
          </Text>
        </View>

        {pesan && (
          <View
            accessibilityLabel={pesan}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.successSoft,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.success}
            />
            <Text style={{ flex: 1, fontSize: 12, color: colors.success }}>
              {pesan}
            </Text>
          </View>
        )}

        {/* Mode tampilan */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
              Mode Tampilan
            </Text>
          </View>
          <View style={{ ...kartu, overflow: "hidden" }}>
            {PILIHAN_MODE.map((pilihan, indeks) => {
              const dipilih = mode === pilihan.nilai;
              return (
                <Pressable
                  key={pilihan.nilai}
                  onPress={() => pilihMode(pilihan.nilai)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: dipilih }}
                  accessibilityLabel={`Mode ${pilihan.label}: ${pilihan.deskripsi}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderTopWidth: indeks === 0 ? 0 : 1,
                    borderTopColor: colors.border,
                    backgroundColor: dipilih
                      ? colors.primarySoft
                      : colors.card,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: dipilih
                        ? colors.primary
                        : colors.backgroundSelected,
                    }}
                  >
                    <Ionicons
                      name={pilihan.ikon}
                      size={18}
                      color={dipilih ? "#FFFFFF" : colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        color: colors.text,
                        fontSize: 14,
                      }}
                    >
                      {pilihan.label}
                    </Text>
                    <Text
                      style={{ color: colors.textMuted, fontSize: 12 }}
                    >
                      {pilihan.deskripsi}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      dipilih
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                    color={dipilih ? colors.primary : colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>
            Mode gelap diterapkan ke Beranda, Favorit & Riwayat, Pengaturan,
            Tentang, dan halaman detail.
          </Text>
        </View>

        {/* Data tersimpan */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="server-outline" size={18} color={colors.primary} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
              Data & Penyimpanan
            </Text>
          </View>
          <View style={{ ...kartu, overflow: "hidden" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
              }}
            >
              <Ionicons
                name="cloud-offline-outline"
                size={20}
                color={colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontWeight: "600", color: colors.text, fontSize: 14 }}
                >
                  Cache cuaca kota
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {jumlahCache} kota tersimpan untuk mode offline
                </Text>
              </View>
              <Pressable
                onPress={hapusDataCache}
                accessibilityRole="button"
                accessibilityLabel="Hapus semua cache cuaca kota"
                style={{
                  backgroundColor: colors.dangerSoft,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.danger,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  Hapus
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontWeight: "600", color: colors.text, fontSize: 14 }}
                >
                  Riwayat pencarian
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {jumlahRiwayat} dari maksimal 10 pencarian terakhir
                </Text>
              </View>
              <Pressable
                onPress={hapusRiwayat}
                accessibilityRole="button"
                accessibilityLabel="Hapus semua riwayat pencarian"
                style={{
                  backgroundColor: colors.dangerSoft,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.danger,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  Hapus
                </Text>
              </Pressable>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>
            Menghapus cache tidak menghapus kota favorit maupun riwayat
            pencarian.
          </Text>
        </View>

        <View style={{ ...kartu, padding: 16, gap: 4 }}>
          <Text style={{ fontWeight: "700", color: colors.text }}>
            Jelajah Aman
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Versi 1.0.0 • Data cuaca Open-Meteo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
