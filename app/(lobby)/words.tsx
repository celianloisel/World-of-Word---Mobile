import React, { useState, useCallback, useMemo, useEffect } from "react";
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

const TYPE_LABELS: Record<string, string> = {
  "event:add": "Général",
  "event:add:platform": "Plateforme",
};

const isPlatformType = (t: string | null) => !!t && /(^|:)platform$/.test(t);
export default function Words() {
  const { words } = useGame();
  const [input, setInput] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { emit } = useSocket();

  const lower = useMemo(() => input.trim().toLocaleLowerCase("fr"), [input]);

  const found = useMemo(
    () => words.find((w) => w.text.toLocaleLowerCase("fr") === lower),
    [words, lower],
  );

  const foundTypes: string[] = found?.types ?? [];
  const hasMultipleTypes = foundTypes.length > 1;

  useEffect(() => {
    setSelectedType(null);
  }, [lower]);

  const canSend =
    input.trim().length > 0 && (!hasMultipleTypes || !!selectedType);

  const handleSend = useCallback(() => {
    const raw = input.trim();
    if (!raw) return;
    if (found && foundTypes.length > 1 && !selectedType) return;

    const typeCandidate =
      foundTypes.length === 1 ? foundTypes[0] : selectedType || "event:player";

    const platform = isPlatformType(typeCandidate);
    const eventName = platform ? "event:add:platform" : "event:add";
    const payload: any = {
      word: raw,
      type: platform ? "event:platform" : "event:player",
    };
    if (platform) {
      payload.platform = "a25d";
    }

    emit(eventName, payload);
    setInput("");
    setSelectedType(null);
  }, [emit, input, found, foundTypes, selectedType]);

  const handleWordSearch = useCallback((text: string) => {
    setInput(text);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
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

              {hasMultipleTypes && (
                <View style={styles.typeButtons}>
                  {foundTypes.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeButton,
                        selectedType === t && styles.typeButtonSelected,
                      ]}
                      onPress={() => setSelectedType(t)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.typeButtonText}>
                        {TYPE_LABELS[t] ?? t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.formContainer}>
                <TextField
                  value={input}
                  onChangeText={handleWordSearch}
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
  typeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.funPinkLight,
    opacity: 0.9,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.funPink,
    opacity: 1,
  },
  typeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
