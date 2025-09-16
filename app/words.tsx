import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { WordIndex } from "@/components/WordIndex";
import { useSocket } from "@/contexts/socketContext";
import { ConnectionStatus } from "@/components/ConnectionStatus";

type Player = { username: string; socketId: string };
type WordSubmitSuccessPayload = {
  roomId: string;
  word: string;
  platform: string;
  socketId: string;
  players?: Player[];
};

export default function Words() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { connected, emit, on, off } = useSocket();

  const token = params.token as string;
  const roomId = params.roomId as string;

  const [word, setWord] = useState("");
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const handleWordSubmitSuccess = (payload: WordSubmitSuccessPayload) => {
      if (payload?.players) {
        router.push({
          pathname: "/player-list",
          params: {
            roomId: payload.roomId,
            players: JSON.stringify(payload.players),
          },
        });
      }
    };

    on("word:submit:success", handleWordSubmitSuccess);
    return () => off("word:submit:success", handleWordSubmitSuccess);
  }, [on, off, router]);

  const canSend = connected && word.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score du joueur</Text>
            <Text style={styles.scoreValue}>120</Text>
          </View>

          <View style={styles.inner}>
            <View style={styles.bottomContainer}>
              <View style={styles.indexButton}>
                <WordIndex />
              </View>

              <View style={styles.formContainer}>
                <TextField
                  value={word}
                  onChangeText={setWord}
                  placeholder="Entrez un mot"
                  autoCapitalize="none"
                  returnKeyType="done"
                />

                <PrimaryButton
                  title="Envoyer"
                  onPress={() =>
                    emit("word:submit", { token, roomId, word, platform })
                  }
                  disabled={!canSend}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  scoreContainer: {
    marginTop: 120,
    alignItems: "center",
    paddingVertical: 24,
  },
  scoreText: {
    fontSize: 44,
    fontWeight: "600",
    color: COLORS.funPink,
  },
  scoreValue: {
    fontSize: 100,
    fontWeight: "800",
    color: COLORS.funPinkLight,
    marginTop: 8,
  },
  bottomContainer: {
    width: "85%",
    position: "absolute",
    bottom: 0,
    left: 15,
    right: 15,
    gap: 12,
  },
  indexButton: {
    alignItems: "flex-end",
  },
  formContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
