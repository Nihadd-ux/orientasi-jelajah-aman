// src/components/SearchBox.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, TextInput, View } from "react-native";

import { useTheme } from "../hooks/use-theme";

interface SearchBoxProps {
  /** Nilai dikendalikan oleh layar induk agar riwayat dapat mengisi kolom ini. */
  nilai: string;
  onCari: (teks: string) => void;
  onSubmit?: () => void;
}

export default function SearchBox({ nilai, onCari, onSubmit }: SearchBoxProps) {
  const colors = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        borderRadius: 14,
        paddingHorizontal: 12,
        minHeight: 50,
      }}
    >
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={colors.placeholder}
        value={nilai}
        onChangeText={onCari}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="words"
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          flex: 1,
          paddingVertical: 12,
          fontSize: 15,
          color: colors.text,
        }}
      />
      {nilai.length > 0 && (
        <Pressable
          onPress={() => onCari("")}
          accessibilityRole="button"
          accessibilityLabel="Bersihkan kolom pencarian"
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}
