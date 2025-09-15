import { Stack } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SocketProvider } from "@/contexts/socketContext";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/app/toastLayouts";

export default function RootLayout() {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  return (
    <SocketProvider url={process.env.EXPO_PUBLIC_SERVER_URL}>
      <ImageBackground
        source={require("@/assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.wrapper}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "transparent",
              },
            }}
          />
        </View>
        <Toast config={toastConfig} />
      </ImageBackground>
    </SocketProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
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
