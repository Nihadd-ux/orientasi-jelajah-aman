// src/contexts/tema-context.tsx
// Penyedia tema global: Terang, Gelap, atau Ikuti Sistem.
// Pilihan pengguna disimpan di AsyncStorage agar tetap sama saat aplikasi dibuka kembali.
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { Colors, type PaletteWarna, type SkemaWarna } from "@/constants/theme";

export type ModeTema = "terang" | "gelap" | "sistem";

export const KUNCI_MODE_TEMA = "@jelajah_aman:mode_tema";

interface NilaiTema {
  /** Pilihan pengguna di menu Pengaturan. */
  mode: ModeTema;
  /** Skema warna yang benar-benar dipakai saat ini. */
  skema: SkemaWarna;
  /** Palet warna aktif. */
  colors: PaletteWarna;
  /** true setelah preferensi selesai dibaca dari perangkat. */
  siap: boolean;
  aturMode: (mode: ModeTema) => Promise<void>;
}

const KonteksTema = createContext<NilaiTema | null>(null);

function modeValid(nilai: string | null): nilai is ModeTema {
  return nilai === "terang" || nilai === "gelap" || nilai === "sistem";
}

export function PenyediaTema({ children }: { children: ReactNode }) {
  const skemaSistem = useColorScheme();
  const [mode, setMode] = useState<ModeTema>("sistem");
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    let aktif = true;
    AsyncStorage.getItem(KUNCI_MODE_TEMA)
      .then((tersimpan) => {
        if (aktif && modeValid(tersimpan)) setMode(tersimpan);
      })
      .catch(() => {
        // Preferensi gagal dibaca bukan alasan untuk menghentikan aplikasi.
      })
      .finally(() => {
        if (aktif) setSiap(true);
      });
    return () => {
      aktif = false;
    };
  }, []);

  const skema: SkemaWarna =
    mode === "sistem"
      ? skemaSistem === "dark"
        ? "dark"
        : "light"
      : mode === "gelap"
        ? "dark"
        : "light";

  const aturMode = useCallback(async (modeBaru: ModeTema) => {
    setMode(modeBaru);
    try {
      await AsyncStorage.setItem(KUNCI_MODE_TEMA, modeBaru);
    } catch {
      // Tampilan tetap berubah walau penyimpanan gagal.
    }
  }, []);

  const nilai = useMemo<NilaiTema>(
    () => ({
      mode,
      skema,
      colors: Colors[skema],
      siap,
      aturMode,
    }),
    [mode, skema, siap, aturMode],
  );

  return <KonteksTema.Provider value={nilai}>{children}</KonteksTema.Provider>;
}

export function useTema(): NilaiTema {
  const konteks = useContext(KonteksTema);
  if (!konteks) {
    throw new Error("useTema harus digunakan di dalam <PenyediaTema>.");
  }
  return konteks;
}
