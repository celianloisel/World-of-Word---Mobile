import Modal from "react-native-modal";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  ImageBackground,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons"; // 👈 FA6
import { COLORS } from "@/constants/colors";
import { BlurView } from "expo-blur";
import { Word } from "@/contexts/gameContext";

type Props = {
  disabled?: boolean;
  words?: Word[];
  children?: React.ReactNode; // permet d'injecter une icône custom depuis le parent
};

export function WordIndex({ disabled = false, words = [], children }: Props) {
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible((v) => !v);

  const wordTexts = (words ?? []).map((w) => w.text);
  const isEmpty = wordTexts.length === 0;

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, (disabled || isEmpty) && styles.disabled]}
        onPress={toggleModal}
        activeOpacity={0.7}
        disabled={disabled || isEmpty}
      >
        <View style={styles.iconWrap}>
          {/* Icône injectée par le parent OU fallback fiable */}
          {children ?? <FontAwesome6 name="book" size={24} color="#fff" />}
          {/* Fallback ultime si jamais la font ne se charge pas */}
          <Text style={styles.emojiFallback} accessible={false}>
            📖
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={styles.modalContainer}>
          <ImageBackground
            source={require("@/assets/images/background.png")}
            resizeMode="cover"
            style={styles.modalContent}
            imageStyle={styles.modalImage}
          >
            <View style={styles.overlay} />
            <View style={styles.panel}>
              {isEmpty ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>En attente de mots…</Text>
                </View>
              ) : (
                <FlatList
                  data={wordTexts}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  numColumns={2}
                  columnWrapperStyle={styles.columnWrapper}
                  contentContainerStyle={styles.wordList}
                  style={{ flex: 1, width: "100%" }}
                  renderItem={({ item }) => (
                    <BlurView
                      intensity={40}
                      tint="light"
                      style={styles.wordItem}
                    >
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.wordText}>{item}</Text>
                    </BlurView>
                  )}
                />
              )}

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleModal}
                >
                  <Text style={styles.modalButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.funPink,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    width: "40%",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    minWidth: 24,
  },
  // petit fallback emoji positionné derrière (n'apparaît que si l'icône vectorielle ne se rend pas)
  emojiFallback: {
    position: "absolute",
    opacity: 0.0001, // quasi invisible, mais présent si la font FA ne charge pas
    fontSize: 18,
  },
  disabled: { opacity: 0.6 },

  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: {
    padding: 0,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "90%",
    height: "70%",
    overflow: "hidden",
  },
  modalImage: { borderRadius: 20, width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 20,
  },
  panel: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 16,
    padding: 18,
  },

  wordList: { paddingVertical: 8 },
  columnWrapper: { justifyContent: "space-between", paddingHorizontal: 6 },
  wordItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  bullet: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 18,
    marginRight: 8,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.98)",
    flexShrink: 1,
    flexWrap: "wrap",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 16,
  },
  closeButton: {
    backgroundColor: COLORS.funPink,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: { color: COLORS.textOnPrimary, fontWeight: "bold" },
  emptyText: {
    color: "rgba(255,255,255,0.98)",
    fontWeight: "700",
    fontSize: 16,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
});
