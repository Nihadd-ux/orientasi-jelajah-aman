import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { typeScale, spacing } from "../../constants/styles";
import { useTheme } from "../../hooks/use-theme";

export default function TabTentang() {
  const colors = useTheme();

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.sedang,
        gap: spacing.kecil,
      }}
    >
      <Text
        accessibilityRole="header"
        accessibilityLabel="Halaman Tentang aplikasi Jelajah Aman"
        style={{
          fontSize: typeScale.judul,
          fontWeight: "bold",
          color: colors.text,
        }}
      >
        Jelajah Aman
      </Text>
      <Text style={{ fontSize: typeScale.isi, color: colors.textSecondary }}>
        Aplikasi cuaca dan kualitas udara untuk membantu perjalanan yang aman.
      </Text>
      <Text style={{ fontSize: typeScale.isi, color: colors.text }}>
        Versi 1.0.0
      </Text>
      <Text style={{ fontSize: typeScale.isi, color: colors.text }}>
        Dibuat oleh: Muhammad Fatkhunihadh
      </Text>
      <Text style={{ fontSize: typeScale.keterangan, color: colors.textMuted }}>
        Sumber data: Open-Meteo.com
      </Text>
    </SafeAreaView>
  );
}
