// src/app/detail/[kota].tsx
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "../../hooks/use-theme";

export default function HalamanDetail() {
  const colors = useTheme();
  const { kota } = useLocalSearchParams<{ kota: string }>();

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 12,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}
      >
        {kota}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textSecondary }}>
        Buka kota ini dari Beranda atau tab Favorit & Riwayat untuk melihat
        cuaca lengkap.
      </Text>
      <Pressable
        onPress={() => router.push({ pathname: "/", params: { cari: kota } })}
        accessibilityRole="button"
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
          Cari di Beranda
        </Text>
      </Pressable>
    </View>
  );
}
