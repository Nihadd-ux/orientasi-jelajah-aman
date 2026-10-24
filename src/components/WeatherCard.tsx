// src/components/WeatherCard.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { typeScale, spacing } from "../constants/styles";
import { useTheme } from "../hooks/use-theme";
import { TingkatAQI, WeatherCardProps } from "../types/cuaca";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "#16A34A",
  SEDANG: "#CA8A04",
  TIDAK_SEHAT: "#EA580C",
  BERBAHAYA: "#DC2626",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const colors = useTheme();

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;
  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 18,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Ionicons name="location" size={18} color={colors.primary} />
        <Text
          style={{
            fontWeight: "700",
            fontSize: typeScale.subjudul,
            color: colors.text,
          }}
        >
          {kota}
        </Text>
      </View>
      <Text
        style={{ fontSize: 44, fontWeight: "700", color: colors.text }}
        accessibilityLabel={`Suhu ${suhu} derajat Celsius`}
      >
        {suhu}°C
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginTop: 2,
        }}
      >
        <Ionicons name="leaf" size={16} color={warnaPerTingkat[tingkatAQI]} />
        <Text
          style={{ color: warnaPerTingkat[tingkatAQI], fontSize: typeScale.isi }}
        >
          {teksAQI}
        </Text>
      </View>
    </View>
  );
}
