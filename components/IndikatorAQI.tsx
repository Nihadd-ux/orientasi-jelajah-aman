// components/IndikatorAQI.tsx
import { View, Text, StyleSheet } from "react-native";
import { LaporanUdara } from "../types/cuaca";

function getWarnaAQI(tingkat: LaporanUdara["tingkat"]): string {
  switch (tingkat) {
    case "BAIK":
      return "#2ecc71";
    case "SEDANG":
      return "#f1c40f";
    case "TIDAK_SEHAT":
      return "#e67e22";
    case "BERBAHAYA":
      return "#e74c3c";
    default:
      return "#95a5a6";
  }
}

function getLabelAQI(tingkat: LaporanUdara["tingkat"]): string {
  switch (tingkat) {
    case "BAIK":
      return "Udara Bersih — Aman untuk aktivitas luar ruangan";
    case "SEDANG":
      return "Kualitas Sedang — Kelompok sensitif perlu waspada";
    case "TIDAK_SEHAT":
      return "Tidak Sehat — Kurangi aktivitas di luar ruangan";
    case "BERBAHAYA":
      return "BERBAHAYA — Hindari keluar rumah";
    default:
      return "Status tidak diketahui";
  }
}

export default function IndikatorAQI({
  kota,
  indeksAQI,
  tingkat,
  diperbaruiPada,
}: LaporanUdara) {
  const warna = getWarnaAQI(tingkat);

  return (
    <View style={[styles.container, { borderLeftColor: warna, borderLeftWidth: 5 }]}>
      <Text style={styles.namaKota}>{kota}</Text>
      <Text style={[styles.angkaAQI, { color: warna }]}>AQI: {indeksAQI}</Text>
      <Text style={[styles.labelTingkat, { color: warna }]}>● {tingkat}</Text>
      <Text style={styles.deskripsi}>{getLabelAQI(tingkat)}</Text>
      {diperbaruiPada && (
        <Text style={styles.waktu}>Diperbarui: {diperbaruiPada}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  },
  namaKota: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  angkaAQI: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  labelTingkat: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  deskripsi: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  waktu: {
    fontSize: 11,
    color: "#bdc3c7",
    marginTop: 4,
  },
});