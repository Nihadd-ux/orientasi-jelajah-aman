// src/app/detail/[kota].tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useTheme } from "../../hooks/use-theme";
import { ambilCuacaOfflineFirst } from "../../services/cuacaRepository";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilCuacaOffline } from "../../types/cache";

export default function HalamanDetail() {
  const colors = useTheme();
  const { kota, id, lat, lon } = useLocalSearchParams<{
    kota: string;
    id?: string;
    lat?: string;
    lon?: string;
  }>();

  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const permintaanRef = useRef(0);

  const lintang = Number(lat);
  const bujur = Number(lon);
  const punyaKoordinat =
    lat !== undefined && lon !== undefined && Number.isFinite(lintang) && Number.isFinite(bujur);

  useEffect(() => {
    if (!punyaKoordinat) return;
    const idPermintaan = ++permintaanRef.current;
    setMemuat(true);
    setPesanError(null);
    ambilCuacaOfflineFirst({
      id: Number.isFinite(Number(id)) ? Number(id) : -1,
      nama: kota,
      latitude: lintang,
      longitude: bujur,
    })
      .then((data) => {
        if (idPermintaan === permintaanRef.current) setHasil(data);
      })
      .catch(() => {
        if (idPermintaan === permintaanRef.current) {
          setPesanError(
            "Data kota ini belum tersimpan dan internet tidak tersedia.",
          );
        }
      })
      .finally(() => {
        if (idPermintaan === permintaanRef.current) setMemuat(false);
      });
  }, [kota, id, lat, lon, lintang, bujur, punyaKoordinat]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 16,
        backgroundColor: colors.background,
        flexGrow: 1,
      }}
    >
      {!punyaKoordinat && (
        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 20,
            gap: 10,
            alignItems: "center",
          }}
        >
          <Ionicons name="location-outline" size={32} color={colors.primary} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
              textAlign: "center",
            }}
          >
            {kota}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Koordinat kota belum tersedia. Buka dari Beranda atau Favorit &
            Riwayat untuk melihat cuaca lengkap.
          </Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/", params: { cari: kota } })
            }
            accessibilityRole="button"
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
              Cari di Beranda
            </Text>
          </Pressable>
        </View>
      )}

      {memuat && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: 14,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.textSecondary }}>Memuat cuaca...</Text>
        </View>
      )}

      {pesanError && (
        <Text
          accessibilityLabel={pesanError}
          style={{
            color: colors.danger,
            backgroundColor: colors.dangerSoft,
            padding: 12,
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          {pesanError}
        </Text>
      )}

      {hasil && punyaKoordinat && (
        <>
          <StatusData
            sumber={hasil.sumber}
            disimpanPada={hasil.disimpanPada}
          />
          <WeatherCard
            kota={kota}
            suhu={hasil.cuaca.saatIni.suhu}
            tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
            indeksAQI={hasil.kualitasUdara.indeksAQI}
          />
          <View
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              padding: 14,
              gap: 8,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Angin: {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              PM2.5: {hasil.kualitasUdara.pm25} µg/m³ • PM10:{" "}
              {hasil.kualitasUdara.pm10} µg/m³
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/tambah-favorit",
                params: {
                  id: String(id ?? -1),
                  nama: kota,
                  lat: String(lintang),
                  lon: String(bujur),
                },
              })
            }
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
            }}
          >
            <Ionicons name="heart" size={18} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
              Tambahkan ke Favorit
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
