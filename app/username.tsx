import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSocket } from "@/contexts/socketContext";
// import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import AvatarGenerator from "@/components/Avatar";

type Player = { username: string; socketId: string };
type JoinSuccessPayload = {
  roomId: string;
  username: string;
  socketId: string;
  players: Player[];
};

export default function Username() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { connected, emit, on, off } = useSocket();
  const [username, setUsername] = useState("");
  const [avatarJson, setAvatarJson] = useState<string | null>(null);

  const token = params.token as string;
  // const roomId = params.roomId as string;

  useEffect(() => {
    const handleJoinSuccess = (payload: JoinSuccessPayload) => {
      router.push({
        pathname: "/player-list",
        params: {
          roomId: payload.roomId,
          players: JSON.stringify(payload.players),
        },
      });
    };

    on("lobby:join:success", handleJoinSuccess);
    return () => off("lobby:join:success", handleJoinSuccess);
  }, [on, off, router]);

  const canSend = connected && username.trim().length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.topContainer}>
            <AvatarGenerator onExportJSON={(json) => setAvatarJson(json)} />
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
                  emit("lobby:join", { token, username, avatar: avatarJson })
                }
                disabled={!canSend}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 48 },
  inner: { flex: 1, justifyContent: "space-between" },
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
  formContainer: { width: "100%", gap: 12 },
});
