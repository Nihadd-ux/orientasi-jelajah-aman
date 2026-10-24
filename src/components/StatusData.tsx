// src/components/StatusData.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { useTheme } from "../hooks/use-theme";
import { SumberData } from "../types/cache";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

function formatUmur(disimpanPada: number): string {
  const menit = Math.floor((Date.now() - disimpanPada) / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam lalu";
  return Math.floor(jam / 24) + " hari lalu";
}

function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") return "Data terbaru dari internet";
  if (sumber === "cache-segar") return "Data tersimpan (masih segar)";
  return "Mode offline - data tersimpan mungkin sudah usang";
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const colors = useTheme();
  const basi = sumber === "cache-basi";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);
  const warnaTeks = basi ? colors.warning : colors.success;

  return (
    <View
      accessible
      accessibilityLabel={label + ", diperbarui " + umur}
      style={{
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: basi ? colors.warningSoft : colors.successSoft,
        backgroundColor: basi ? colors.warningSoft : colors.successSoft,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <Ionicons
        name={basi ? "cloud-offline-outline" : "cloud-done-outline"}
        size={18}
        color={warnaTeks}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: warnaTeks }}>
          {label}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textSecondary }}>
          Diperbarui {umur}
        </Text>
      </View>
    </View>
  );
}
