// src/utils/konfirmasi.ts
// Dialog konfirmasi yang berjalan baik di mobile (Alert) maupun browser (window.confirm).
import { Alert, Platform } from "react-native";

interface OpsiKonfirmasi {
  judul: string;
  pesan: string;
  labelKonfirmasi?: string;
  onKonfirmasi: () => void | Promise<void>;
}

export function konfirmasiHapus({
  judul,
  pesan,
  labelKonfirmasi = "Hapus",
  onKonfirmasi,
}: OpsiKonfirmasi) {
  if (Platform.OS === "web") {
    const disetujui =
      typeof window !== "undefined" && window.confirm(`${judul}\n\n${pesan}`);
    if (disetujui) void onKonfirmasi();
    return;
  }

  Alert.alert(judul, pesan, [
    { text: "Batal", style: "cancel" },
    {
      text: labelKonfirmasi,
      style: "destructive",
      onPress: () => void onKonfirmasi(),
    },
  ]);
}
