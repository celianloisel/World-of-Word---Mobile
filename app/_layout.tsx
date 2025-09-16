import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SocketProvider, useSocket } from "@/contexts/socketContext";

function RootBoundary() {
  const router = useRouter();
  const { on, off, connected, isInLobby } = useSocket();

  useEffect(() => {
    const toHome = (reason: string) => {
      if (isInLobby) {
        router.replace({ pathname: "/", params: { reason } });
      }
    };
    const handleDisconnect = () => toHome("socket_disconnected");
    const handleConnectError = () => toHome("connect_error");

    on("disconnect", handleDisconnect);
    on("connect_error", handleConnectError);
    return () => {
      off("disconnect", handleDisconnect);
      off("connect_error", handleConnectError);
    };
  }, [on, off, router, isInLobby]);

  useEffect(() => {
    if (!connected && isInLobby) {
      router.replace({ pathname: "/", params: { reason: "offline" } });
    }
  }, [connected, isInLobby, router]);

  return null;
}

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
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
        </View>

        <RootBoundary />
      </ImageBackground>
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
