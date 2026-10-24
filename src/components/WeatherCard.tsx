// src/components/WeatherCard.tsx
import { Text, View } from "react-native";

import { typeScale, spacing } from "../constants/styles";
import { useTheme } from "../hooks/use-theme";
import { TingkatAQI, WeatherCardProps } from "../types/cuaca";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "#2E7D32",
  SEDANG: "#B8860B",
  TIDAK_SEHAT: "#D97706",
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
        borderRadius: 8,
        backgroundColor: colors.backgroundElement,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: typeScale.subjudul,
          color: colors.text,
        }}
      >
        {kota}
      </Text>
      <Text style={{ fontSize: 32, color: colors.text }}>{suhu}°C</Text>
      <Text
        style={{
          color: warnaPerTingkat[tingkatAQI],
          fontSize: typeScale.isi,
        }}
      >
        {teksAQI}
      </Text>
    </View>
  );
}
