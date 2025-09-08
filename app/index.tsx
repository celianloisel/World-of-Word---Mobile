import React, { useEffect, useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import { useSocketIO } from "@/script/sockets/useSocketIO";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";

export default function Index() {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  const { connected, emit, on, off } = useSocketIO(
    process.env.EXPO_PUBLIC_SERVER_URL,
  );
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState<string>("");

  const TEST_TOKEN = "1c08fea9ba074eccaa8aaa1520e5d08f";

  // ⚠️ Hardcode temporaire du roomId : à retirer quand tu auras le scan QR
  useEffect(() => {
    setRoomId("test-id");
  }, []);

  useEffect(() => {
    const handleJoinSuccess = (payload: {
      roomId: string;
      username: string;
      socketId: string;
    }) => {
      // TODO Switch to the player's list screen
    };

    on("lobby:join-success", handleJoinSuccess);
    return () => {
      off("lobby:join-success", handleJoinSuccess);
    };
  }, [on, off]);

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
              onPress={() =>
                emit("lobby:join", { token: TEST_TOKEN, username })
              }
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
    padding: 24,
    marginBottom: 36,
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
});
