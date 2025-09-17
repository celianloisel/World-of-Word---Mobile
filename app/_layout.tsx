import { Stack } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SocketProvider } from "@/contexts/socketContext";
import { GameProvider } from "@/contexts/gameContext";

export default function RootLayout() {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  return (
    <SocketProvider url={process.env.EXPO_PUBLIC_SERVER_URL}>
      <GameProvider>
        <ImageBackground
          source={require("@/assets/images/background.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay} pointerEvents="none" />
          <View style={styles.wrapper}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "transparent" },
              }}
            />
          </View>
        </ImageBackground>
      </GameProvider>
    </SocketProvider>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
});
