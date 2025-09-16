import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { WordIndex } from "@/components/WordIndex";
import { useGame } from "@/contexts/gameContext";

export default function Words() {
  const { words } = useGame();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Liste des mots</Text>
            <Text style={styles.scoreValue}>{words.length}</Text>
          </View>

          <View style={styles.inner}>
            <View style={styles.bottomContainer}>
              <View style={styles.indexButton}>
                <WordIndex words={words} disabled={words.length === 0} />
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
});
