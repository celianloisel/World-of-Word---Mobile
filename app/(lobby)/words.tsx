import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { WordIndex } from "@/components/WordIndex";
import { TextField } from "@/components/TextField";
import { useGame } from "@/contexts/gameContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSocket } from "@/contexts/socketContext";
import { useLocalSearchParams } from "expo-router";

export default function Words() {
  const { words } = useGame();
  const [input, setInput] = useState("");
  const { emit } = useSocket();
  const { platformId } = useLocalSearchParams() as { platformId?: string };

  const handleSend = useCallback(() => {
    const raw = input.trim();
    if (!raw) return;

    const lower = raw.toLocaleLowerCase("fr");
    const found = words.find((w) => w.text.toLocaleLowerCase("fr") === lower);
    const type = found?.type ?? "event:add";

    const isPlatform = type === "event:add:platform";
    const eventName = isPlatform ? "event:add:platform" : "event:add";

    if (isPlatform) {
      emit(eventName, { word: raw, platformId });
    } else {
      emit(eventName, { word: raw });
    }

    setInput("");
  }, [emit, input, words, platformId]);

  const canSend = input.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score</Text>
            <Text style={styles.scoreValue}>0</Text>
          </View>

          <View style={styles.inner}>
            <View style={styles.bottomContainer}>
              <View style={styles.indexButton}>
                <WordIndex words={words} />
              </View>

              <View style={styles.formContainer}>
                <TextField
                  value={input}
                  onChangeText={setInput}
                  placeholder="Entrez un mot"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                  style={[
                    styles.roundButton,
                    !canSend && styles.roundButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!canSend}
                  activeOpacity={0.7}
                >
                  <FontAwesome5 name="paper-plane" size={20} color="#fff" />
                </TouchableOpacity>
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
  },
  scoreContainer: { marginTop: 120, alignItems: "center", paddingVertical: 24 },
  scoreText: { fontSize: 32, fontWeight: "600", color: COLORS.funPink },
  scoreValue: {
    fontSize: 64,
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
  indexButton: { alignItems: "flex-end" },
  formContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  roundButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.funPink,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  roundButtonDisabled: {
    backgroundColor: COLORS.funPinkLight,
    opacity: 0.6,
  },
});
