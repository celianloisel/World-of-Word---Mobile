import { Stack } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </ImageBackground>
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
});
