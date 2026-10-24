// src/components/SearchBox.tsx
import { TextInput, View } from "react-native";

import { useTheme } from "../hooks/use-theme";

interface SearchBoxProps {
  nilai: string;
  onCari: (teks: string) => void;
}

export default function SearchBox({ nilai, onCari }: SearchBoxProps) {
  const colors = useTheme();

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={colors.placeholder}
        value={nilai}
        onChangeText={onCari}
        autoCorrect={false}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.inputBackground,
          color: colors.text,
          padding: 10,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
