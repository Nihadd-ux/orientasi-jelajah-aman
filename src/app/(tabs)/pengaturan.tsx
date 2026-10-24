// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModeTema, useTema } from "../../contexts/tema-context";
import { useTheme } from "../../hooks/use-theme";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { konfirmasiHapus } from "../../utils/konfirmasi";

const PILIHAN_MODE: { nilai: ModeTema; label: string }[] = [
  { nilai: "terang", label: "Terang" },
  { nilai: "gelap", label: "Gelap" },
  { nilai: "sistem", label: "Ikuti Sistem" },
];

export default function TabPengaturan() {
  const colors = useTheme();
  const { mode, aturMode } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);

  async function pilihMode(nilai: ModeTema) {
    await aturMode(nilai);
    setPesan("Tema tampilan berhasil diubah.");
  }

  function hapusDataCache() {
    konfirmasiHapus({
      judul: "Hapus cache kota?",
      pesan:
        "Seluruh data cuaca yang tersimpan di perangkat akan dihapus. Data hanya bisa dibuka kembali saat perangkat online.",
      onKonfirmasi: async () => {
        await hapusSemuaCache();
        setPesan("Data cuaca tersimpan sudah dihapus.");
      },
    });
  }

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
            Pengaturan
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Atur tema tampilan dan data tersimpan.
          </Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "bold", color: colors.text }}
          >
            Mode Tampilan
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {PILIHAN_MODE.map((pilihan, indeks) => (
              <Pressable
                key={pilihan.nilai}
                onPress={() => pilihMode(pilihan.nilai)}
                accessibilityRole="radio"
                accessibilityState={{ checked: mode === pilihan.nilai }}
                accessibilityLabel={`Mode ${pilihan.label}`}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 12,
                  backgroundColor:
                    mode === pilihan.nilai
                      ? colors.backgroundSelected
                      : colors.backgroundElement,
                  borderTopWidth: indeks === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  {pilihan.label}
                </Text>
                <Text
                  style={{
                    color:
                      mode === pilihan.nilai
                        ? colors.primary
                        : colors.textMuted,
                    fontSize: 13,
                  }}
                >
                  {mode === pilihan.nilai ? "Dipilih" : ""}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "bold", color: colors.text }}
          >
            Data Tersimpan
          </Text>
          <Pressable
            onPress={hapusDataCache}
            accessibilityRole="button"
            accessibilityLabel="Hapus data cuaca tersimpan"
            style={{
              backgroundColor: colors.danger,
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Hapus Data Cuaca Tersimpan
            </Text>
          </Pressable>
        </View>

        {pesan && (
          <Text
            accessibilityLabel={pesan}
            style={{ fontSize: 12, color: colors.primary }}
          >
            {pesan}
          </Text>
        )}

        <Text style={{ fontSize: 12, color: colors.textMuted }}>
          Jelajah Aman versi 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
