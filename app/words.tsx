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
import { useRouter } from "expo-router";
import { useSocketIO } from "@/hooks/sockets/useSocketIO";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { COLORS } from "@/constants/colors";
import { WordIndex } from "@/components/WordIndex";

export default function Words() {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  const router = useRouter();
  const { connected, emit, on, off } = useSocketIO(
    process.env.EXPO_PUBLIC_SERVER_URL,
  );
  const [effect, setEffect] = useState("");
  const [roomId, setRoomId] = useState<string>("");

  const TEST_TOKEN = "1c08fea9ba074eccaa8aaa1520e5d08f";

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

    on("lobby:join:success", handleJoinSuccess);
    return () => {
      off("lobby:join:success", handleJoinSuccess);
    };
  }, [on, off]);

  const canSend = connected && effect.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          {/* Score en haut de page */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score du joueur</Text>
            <Text style={styles.scoreValue}>120</Text>
          </View>

          <View style={styles.inner}>
            {/* Bloc bas : IndexButton au-dessus du formulaire */}
            <View style={styles.bottomContainer}>
              <View style={styles.indexButton}>
                <WordIndex />
              </View>

              <View style={styles.formContainer}>
                <TextField
                  value={effect}
                  onChangeText={setEffect}
                  placeholder="Entrez un effet"
                  autoCapitalize="none"
                  returnKeyType="done"
                />

                <PrimaryButton
                  title="Envoyer"
                  onPress={() =>
                    emit("lobby:join", { token: TEST_TOKEN, effect })
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
