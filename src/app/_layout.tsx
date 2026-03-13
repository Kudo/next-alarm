import { ThemeProvider } from "@/components/theme-provider";
import { Stack } from "expo-router";
import * as AC from "@bacons/apple-colors";

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "systemChromeMaterial",
          headerShadowVisible: false,
          headerTitleStyle: { color: AC.label as any },
        }}
      />
    </ThemeProvider>
  );
}
