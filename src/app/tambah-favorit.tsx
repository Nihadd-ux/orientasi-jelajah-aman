// src/app/tambah-favorit.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
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
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  async function simpan() {
    setMenyimpan(true);
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
      setMenyimpan(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.primarySoft,
        }}
      >
        <Ionicons name="heart" size={28} color={colors.danger} />
      </View>
      <Text
        style={{ fontSize: 20, fontWeight: "800", color: colors.text }}
      >
        Tambah ke Favorit
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
        Simpan <Text style={{ fontWeight: "700" }}>{nama}</Text> ke daftar kota
        favorit agar mudah dibuka kembali.
      </Text>
      {pesan && (
        <Text
          style={{
            color: colors.danger,
            backgroundColor: colors.dangerSoft,
            padding: 10,
            borderRadius: 10,
            fontSize: 12,
          }}
        >
          {pesan}
        </Text>
      )}
      <Pressable
        onPress={simpan}
        disabled={menyimpan}
        accessibilityRole="button"
        accessibilityLabel={`Simpan ${nama} ke favorit`}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 13,
          opacity: menyimpan ? 0.6 : 1,
        }}
      >
        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
          {menyimpan ? "Menyimpan..." : "Simpan Favorit"}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        style={{
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: colors.textMuted, fontWeight: "600" }}>
          Batal
        </Text>
      </Pressable>
    </View>
  );
}
