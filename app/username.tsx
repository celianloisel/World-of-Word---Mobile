import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocketIO } from "@/hooks/sockets/useSocketIO";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";

export default function Username() {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  const router = useRouter();
  const params = useLocalSearchParams();

  const { connected, emit, on, off } = useSocketIO(
    process.env.EXPO_PUBLIC_SERVER_URL,
  );
  const [username, setUsername] = useState("");

  const token = params.token as string;
  const roomId = params.token as string;

  useEffect(() => {
    const handleJoinSuccess = (payload: {
      roomId: string;
      username: string;
    }) => {
      router.push("/player-list");
    };

    on("lobby:join-success", handleJoinSuccess);
    return () => {
      off("lobby:join-success", handleJoinSuccess);
    };
  }, [on, off, router]);

  const canSend = connected && username.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.topContainer}>
          <Image
            source={require("@/assets/images/welcome.png")}
            style={styles.image}
            accessibilityLabel="Bienvenue"
          />

          <View style={styles.formContainer}>
            <TextField
              value={username}
              onChangeText={setUsername}
              placeholder="Entrez votre pseudo"
              autoCapitalize="none"
              returnKeyType="done"
            />

            <PrimaryButton
              title="Envoyer"
              onPress={() => emit("lobby:join", { token: token, username })}
              disabled={!canSend}
            />
          </View>
        </View>

        <ConnectionStatus connected={connected} roomId={roomId} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  formContainer: {
    width: "100%",
    gap: 12,
  },
  cameraButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  cameraIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  cameraButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
