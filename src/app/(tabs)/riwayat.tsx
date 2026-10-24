// src/app/(tabs)/riwayat.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/use-theme";
import {
  daftarKotaTersimpan,
  hapusCache,
} from "../../services/cacheRepository";
import {
  ambilSemuaFavorit,
  hapusFavorit,
} from "../../services/favoritStorage";
import {
  ambilRiwayatPencarian,
  hapusRiwayatPencarian,
} from "../../services/riwayatPencarian";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { KotaFavorit } from "../../types/favorit";
import { KotaRiwayat } from "../../types/riwayat";
import { konfirmasiHapus } from "../../utils/konfirmasi";

function formatWaktu(waktu: number): string {
  const menit = Math.max(0, Math.floor((Date.now() - waktu) / 60000));
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
}

export default function TabRiwayat() {
  const colors = useTheme();
  const [riwayat, setRiwayat] = useState<KotaRiwayat[]>([]);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
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
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void muatSemua();
    }, [muatSemua]),
  );

  function bukaKota(kota: {
    id: number;
    nama: string;
    latitude: number;
    longitude: number;
  }) {
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
      pesan: `Riwayat pencarian "${kota.nama}" akan dihapus.`,
      onKonfirmasi: async () => {
        await hapusRiwayatPencarian(kota.id);
        setRiwayat((prev) => prev.filter((item) => item.id !== kota.id));
        setPesan(`Riwayat "${kota.nama}" dihapus.`);
      },
    });
  }

  function hapusKotaCache(kota: RingkasanKotaTersimpan) {
    konfirmasiHapus({
      judul: "Hapus cache kota?",
      pesan: `Data cuaca ${kota.nama} yang tersimpan di perangkat akan dihapus.`,
      onKonfirmasi: async () => {
        await hapusCache(kota.kunci);
        setKotaTersimpan((prev) =>
          prev.filter((item) => item.kunci !== kota.kunci),
        );
        setPesan(`Cache ${kota.nama} berhasil dihapus.`);
      },
    });
  }

  async function hapusKotaFavorit(kota: KotaFavorit) {
    await hapusFavorit(kota.id);
    setDaftarFavorit((prev) => prev.filter((item) => item.id !== kota.id));
  }

  const judulBagian = {
    fontSize: 15,
    fontWeight: "bold" as const,
    color: colors.text,
  };
  const baris = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  };

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View>
          <Text
            accessibilityRole="header"
            style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}
          >
            Favorit & Riwayat
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Pencarian terakhir, kota tersimpan, dan favorit.
          </Text>
        </View>

        {pesan && (
          <Text
            accessibilityLabel={pesan}
            style={{ fontSize: 12, color: colors.primary }}
          >
            {pesan}
          </Text>
        )}

        {/* Riwayat pencarian */}
        <View style={{ gap: 4 }}>
          <Text style={judulBagian}>
            Pencarian Terakhir ({riwayat.length}/10)
          </Text>
          {riwayat.length === 0 ? (
            <Text style={{ fontSize: 12, color: colors.textMuted }}>
              Belum ada riwayat pencarian.
            </Text>
          ) : (
            riwayat.map((kota) => (
              <View key={`${kota.id}-${kota.dicariPada}`} style={baris}>
                <Pressable
                  onPress={() => bukaKota(kota)}
                  accessibilityRole="button"
                  accessibilityLabel={`Cari ulang kota ${kota.nama}`}
                  style={{ flex: 1 }}
                >
                  <Text style={{ color: colors.text, fontSize: 14 }}>
                    {kota.nama}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                    {formatWaktu(kota.dicariPada)}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => hapusSatuRiwayat(kota)}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus riwayat ${kota.nama}`}
                >
                  <Text style={{ color: colors.danger, fontSize: 12 }}>
                    Hapus
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* Cache kota */}
        <View style={{ gap: 4 }}>
          <Text style={judulBagian}>Kota Tersimpan (Cache)</Text>
          {kotaTersimpan.length === 0 ? (
            <Text style={{ fontSize: 12, color: colors.textMuted }}>
              Belum ada cache kota.
            </Text>
          ) : (
            kotaTersimpan.map((kota) => (
              <View key={kota.kunci} style={baris}>
                <Pressable
                  onPress={() => bukaKota(kota)}
                  accessibilityRole="button"
                  accessibilityLabel={`Buka cuaca ${kota.nama} dari cache`}
                  style={{ flex: 1 }}
                >
                  <Text style={{ color: colors.text, fontSize: 14 }}>
                    {kota.nama}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                    Cache {formatWaktu(kota.disimpanPada)}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => hapusKotaCache(kota)}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus cache kota ${kota.nama}`}
                >
                  <Text style={{ color: colors.danger, fontSize: 12 }}>
                    Hapus cache
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* Favorit */}
        <View style={{ gap: 4 }}>
          <Text style={judulBagian}>Kota Favorit</Text>
          {daftarFavorit.length === 0 ? (
            <Text style={{ fontSize: 12, color: colors.textMuted }}>
              Belum ada kota favorit.
            </Text>
          ) : (
            daftarFavorit.map((kota) => (
              <View key={kota.id} style={baris}>
                <Pressable
                  onPress={() => bukaKota(kota)}
                  accessibilityRole="button"
                  accessibilityLabel={`Buka cuaca favorit ${kota.nama}`}
                  style={{ flex: 1 }}
                >
                  <Text style={{ color: colors.text, fontSize: 14 }}>
                    {kota.nama}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => hapusKotaFavorit(kota)}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus favorit ${kota.nama}`}
                >
                  <Text style={{ color: colors.danger, fontSize: 12 }}>
                    Hapus
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
