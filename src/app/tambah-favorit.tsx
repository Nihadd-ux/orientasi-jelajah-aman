// src/app/tambah-favorit.tsx
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "../hooks/use-theme";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const colors = useTheme();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();
  const [pesan, setPesan] = useState<string | null>(null);

  async function simpan() {
    try {
      await tambahFavorit({
        id: Number(id),
        nama,
        latitude: Number(lat),
        longitude: Number(lon),
      });
      router.back();
    } catch {
      setPesan("Gagal menyimpan favorit. Silakan coba lagi.");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
        Tambah Favorit
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary }}>
        Tambahkan {nama} ke daftar favorit?
      </Text>
      {pesan && (
        <Text style={{ fontSize: 12, color: colors.danger }}>{pesan}</Text>
      )}
      <Pressable
        onPress={simpan}
        accessibilityRole="button"
        accessibilityLabel={`Simpan ${nama} ke favorit`}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Simpan</Text>
      </Pressable>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        style={{ alignItems: "center" }}
      >
        <Text style={{ color: colors.textMuted }}>Batal</Text>
      </Pressable>
    </View>
  );
}
