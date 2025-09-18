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
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useSocket } from "@/contexts/socketContext";
import Toast from "react-native-toast-message";

const TYPE_LABELS: Record<string, string> = {
  general: "Général",
  platform: "Plateforme",
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

  const foundTypes: string[] = useMemo(() => found?.types ?? [], [found]);
  const hasMultipleTypes = foundTypes.length > 1;

  const platformType = useMemo(
    () => foundTypes.find((t) => isPlatformType(t)) ?? null,
    [foundTypes],
  );
  const generalType = useMemo(
    () => foundTypes.find((t) => !isPlatformType(t)) ?? null,
    [foundTypes],
  );

  const platformEnabled = hasMultipleTypes && !!platformType;
  const generalEnabled = hasMultipleTypes && !!generalType;

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

    emit(eventName, payload, (response?: any) => {
      if (response && response.ok) {
        Toast.show({
          type: "success",
          text1: "Mot envoyé",
          text2: `\"${raw}\" a été ajouté`,
          visibilityTime: 2000,
        });
        setInput("");
        setSelectedType(null);
      } else {
        const reason = response?.error || "Erreur inconnue";
        Toast.show({
          type: "error",
          text1: "Échec de l'envoi",
          text2: String(reason),
          visibilityTime: 2500,
        });
      }
    });
  }, [emit, input, found, foundTypes, selectedType]);

  const handleWordSearch = useCallback((text: string) => {
    setInput(text);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.hero} />

          <View style={styles.panel}>
            <View style={styles.headerRow}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={styles.scoreValue}>0</Text>
              </View>

              <View style={styles.indexButton}>
                <WordIndex words={words}>
                  <FontAwesome6 name="book-open" size={24} color="#fff" />
                </WordIndex>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typePill,
                  generalEnabled ? null : styles.typePillDisabled,
                  selectedType && selectedType === generalType
                    ? styles.typePillSelected
                    : null,
                ]}
                onPress={() => {
                  if (!generalEnabled || !generalType) return;
                  setSelectedType(generalType);
                }}
                activeOpacity={0.7}
                disabled={!generalEnabled}
              >
                <Text
                  style={[
                    styles.typePillText,
                    generalEnabled ? null : styles.typePillTextDisabled,
                    selectedType && selectedType === generalType
                      ? styles.typePillTextSelected
                      : null,
                  ]}
                >
                  {TYPE_LABELS.general}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typePill,
                  platformEnabled ? null : styles.typePillDisabled,
                  selectedType && selectedType === platformType
                    ? styles.typePillSelected
                    : null,
                ]}
                onPress={() => {
                  if (!platformEnabled || !platformType) return;
                  setSelectedType(platformType);
                }}
                activeOpacity={0.7}
                disabled={!platformEnabled}
              >
                <Text
                  style={[
                    styles.typePillText,
                    platformEnabled ? null : styles.typePillTextDisabled,
                    selectedType && selectedType === platformType
                      ? styles.typePillTextSelected
                      : null,
                  ]}
                >
                  {TYPE_LABELS.platform}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <View style={styles.inputWrapper}>
                <TextField
                  value={input}
                  onChangeText={handleWordSearch}
                  placeholder="Entrez un mot"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                />
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!canSend}
                activeOpacity={0.7}
              >
                <FontAwesome5 name="paper-plane" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#FFFFFF",
    flexShrink: 0,
  },

  panel: {
    flex: 1,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  scoreCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 120,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.funPink,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.funPinkLight,
    marginTop: 2,
    lineHeight: 40,
  },
  indexButton: {
    alignItems: "flex-end",
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typePill: {
    flexBasis: "48%",
    maxWidth: "48%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.funPinkLight,
    marginBottom: 8,
  },
  typePillSelected: {
    backgroundColor: COLORS.funPink,
    borderColor: COLORS.funPink,
  },
  typePillDisabled: {
    backgroundColor: "#F0F1F5",
    borderColor: "#E3E5EC",
    opacity: 0.4,
  },
  typePillText: {
    fontWeight: "700",
    color: COLORS.funPink,
  },
  typePillTextSelected: {
    color: "#fff",
  },
  typePillTextDisabled: {
    color: "#9AA0A6",
  },

  formRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.funPink,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.funPinkLight,
    opacity: 0.4,
  },
});
