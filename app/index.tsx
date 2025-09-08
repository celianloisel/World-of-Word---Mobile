import React, { useEffect, useState } from "react";
import {
  Pressable,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { useSocketIO } from "@/script/sockets/useSocketIO";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";

export default function Index() {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  const router = useRouter();
  const { connected, emit, on, off } = useSocketIO(
    process.env.EXPO_PUBLIC_SERVER_URL,
  );
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (connected) {
      emit("join", { username: "test-mobile2", role: "mobile" });
    } else {
      setJoined(false);
    }
  }, [connected, emit]);

  useEffect(() => {
    const handleJoinSucces = () => setJoined(true);
    on("join-success", handleJoinSucces);
    return () => {
      off("join-success", handleJoinSucces);
    };
  }, [on, off]);

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
              returnKeyType="done"
            />

            <PrimaryButton
              title="Envoyer"
              onPress={() => {
                emit("join", { username, role: "mobile" });
              }}
              disabled={!username.trim()}
            />
          </View>
        </View>

        <ConnectionStatus connected={connected} joined={joined} />

        <Pressable
          onPress={() => {
            router.replace("./components/qrScan");
          }}
        >
          <Image
            source={require("@/assets/images/welcome.png")}
            style={styles.cameraIcon}
          />
        </Pressable>
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
