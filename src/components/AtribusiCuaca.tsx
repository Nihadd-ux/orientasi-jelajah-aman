// src/components/AtribusiCuaca.tsx
import { Linking, Text, TouchableOpacity } from "react-native";

import { useTheme } from "../hooks/use-theme";

export default function AtribusiCuaca() {
  const colors = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="link"
      accessibilityLabel="Buka situs Open-Meteo, sumber data cuaca"
      onPress={() => Linking.openURL("https://open-meteo.com/")}
    >
      <Text
        style={{
          fontSize: 11,
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        Data cuaca disediakan oleh Open-Meteo.com
      </Text>
    </TouchableOpacity>
  );
}
