import Ionicons from "@expo/vector-icons/Ionicons";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, typeScale } from "../../constants/styles";
import { useTheme } from "../../hooks/use-theme";

const FITUR = [
  {
    ikon: "cloud-outline" as const,
    judul: "Cuaca & kualitas udara",
    deskripsi:
      "Suhu, kondisi cuaca, angin, prakiraan 3 hari, dan indeks kualitas udara kota.",
  },
  {
    ikon: "cloud-offline-outline" as const,
    judul: "Mode offline",
    deskripsi:
      "Data kota disimpan otomatis sehingga masih dapat dibuka tanpa internet.",
  },
  {
    ikon: "time-outline" as const,
    judul: "Riwayat pencarian",
    deskripsi:
      "Menyimpan maksimal 10 pencarian terakhir dan bisa dipakai untuk mencari ulang.",
  },
  {
    ikon: "color-palette-outline" as const,
    judul: "Tema dinamis",
    deskripsi:
      "Pilihan tampilan Terang, Gelap, atau mengikuti pengaturan sistem.",
  },
];

export default function TabTentang() {
  const colors = useTheme();

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View style={{ alignItems: "center", gap: 10, paddingTop: 8 }}>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
            }}
          >
            <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
          </View>
          <Text
            accessibilityRole="header"
            accessibilityLabel="Halaman Tentang aplikasi Jelajah Aman"
            style={{
              fontSize: typeScale.judul,
              fontWeight: "800",
              color: colors.text,
            }}
          >
            Jelajah Aman
          </Text>
          <Text
            style={{
              fontSize: typeScale.isi,
              color: colors.textMuted,
              textAlign: "center",
            }}
          >
            Teman perjalanan untuk memantau cuaca dan kualitas udara sebelum
            beraktivitas.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: spacing.sedang,
            gap: spacing.kecil,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: typeScale.subjudul,
              color: colors.text,
            }}
          >
            Fitur Utama
          </Text>
          {FITUR.map((fitur) => (
            <View
              key={fitur.judul}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                paddingTop: 8,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.primarySoft,
                }}
              >
                <Ionicons
                  name={fitur.ikon}
                  size={17}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "600",
                    color: colors.text,
                    fontSize: typeScale.isi,
                  }}
                >
                  {fitur.judul}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: typeScale.keterangan,
                    lineHeight: 18,
                  }}
                >
                  {fitur.deskripsi}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: spacing.sedang,
            gap: 10,
          }}
        >
          <BarisInfo label="Versi aplikasi" nilai="1.0.0" />
          <BarisInfo label="Dibuat oleh" nilai="Muhammad Fatkhunihadh" />
          <BarisInfo label="Platform" nilai="Expo / React Native" />
          <BarisInfo label="Sumber data" nilai="Open-Meteo API" />
        </View>

        <Pressable
          onPress={() => Linking.openURL("https://open-meteo.com/")}
          accessibilityRole="link"
          accessibilityLabel="Buka situs Open-Meteo"
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: 12,
          }}
        >
          <Ionicons name="open-outline" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            open-meteo.com
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function BarisInfo({ label, nilai }: { label: string; nilai: string }) {
  const colors = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Text style={{ color: colors.textMuted, fontSize: typeScale.isi }}>
        {label}
      </Text>
      <Text
        style={{
          color: colors.text,
          fontSize: typeScale.isi,
          fontWeight: "600",
          flexShrink: 1,
          textAlign: "right",
        }}
      >
        {nilai}
      </Text>
    </View>
  );
}
