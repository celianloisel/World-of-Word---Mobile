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
import Toast from "react-native-toast-message";

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
  const MAX_USERNAME_LEN = 30;
  const [submitting, setSubmitting] = useState(false);

  const token = params.token as string;
  // const roomId = params.roomId as string;

  useEffect(() => {
    const handleJoinSuccess = (payload: JoinSuccessPayload) => {
      Toast.show({
        type: "success",
        text1: "Connexion réussie",
        text2: `Bienvenue ${payload.username} dans le lobby !`,
        visibilityTime: 2000,
      });

      router.push({
        pathname: "/player-list",
        params: {
          roomId: payload.roomId,
          players: JSON.stringify(payload.players),
        },
      });
    };

    const handleJoinError = (payload?: {
      code?: string | number;
      message?: string;
    }) => {
      Toast.show({
        type: "error",
        text1: payload?.code ? `Erreur ${payload.code}` : "Connexion refusée",
        text2: payload?.message ?? "Impossible de rejoindre le lobby",
        visibilityTime: 2500,
      });
      setSubmitting(false); // libère le bouton
    };

    on("lobby:join:success", handleJoinSuccess);
    on("lobby:join:error", handleJoinError);

    return () => {
      off("lobby:join:success", handleJoinSuccess);
      off("lobby:join:error", handleJoinError);
    };
  }, [on, off, router]);

  const canSend =
    connected &&
    !submitting &&
    username.trim().length > 0 &&
    username.length <= MAX_USERNAME_LEN;

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
                maxLength={MAX_USERNAME_LEN}
              />
              <PrimaryButton
                title={submitting ? "Envoi..." : "Envoyer"}
                onPress={() => {
                  if (!canSend) return;
                  setSubmitting(true);
                  console.log(avatarJson);
                  emit(
                    "lobby:join",
                    { token, username, avatar: avatarJson },
                    (response?: any) => {
                      if (response && response.ok) {
                        Toast.show({
                          type: "success",
                          text1: "Connexion au lobby",
                          text2:
                            "Requête envoyée, en attente de confirmation...",
                          visibilityTime: 1500,
                        });
                        // Navigation via l'événement 'lobby:join:success'
                      } else {
                        const reason =
                          response?.error || "Impossible de rejoindre le lobby";
                        Toast.show({
                          type: "error",
                          text1: "Échec de la connexion",
                          text2: String(reason),
                          visibilityTime: 2500,
                        });
                        setSubmitting(false);
                      }
                    },
                  );
                }}
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
