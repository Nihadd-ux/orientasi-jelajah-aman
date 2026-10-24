import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { PenyediaTema, useTema } from "@/contexts/tema-context";

function NavigasiAplikasi() {
  const { colors, skema } = useTema();

  return (
    <>
      <StatusBar style={skema === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />
        <Stack.Screen
          name="tambah-favorit"
          options={{ presentation: "modal", title: "Tambah Favorit" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <PenyediaTema>
      <NavigasiAplikasi />
    </PenyediaTema>
  );
}
