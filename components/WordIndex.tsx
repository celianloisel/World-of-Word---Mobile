import Modal from "react-native-modal";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

type Props = {
  disabled?: boolean;
};

const WORDS = [
  "Chat",
  "Chien",
  "Maison",
  "Voiture",
  "Soleil",
  "Lune",
  "Arbre",
  "Mer",
  "Montagne",
  "Neige",
  "Livre",
  "Musique",
  "Pomme",
  "Étoile",
  "Amour",
];

export function WordIndex({ disabled = false }: Props) {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => setModalVisible((v) => !v);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={toggleModal}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <FontAwesome5 name="book-open" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* FlatList en 2 colonnes */}
            <FlatList
              data={WORDS}
              keyExtractor={(item, index) => `${item}-${index}`}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.wordList}
              style={{ flex: 1, width: "100%" }}
              renderItem={({ item }) => (
                <View style={styles.wordItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.wordText}>{item}</Text>
                </View>
              )}
            />

            {/* boutons alignés */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.moreButton, disabled && styles.disabled]}
                onPress={() => {
                  /* action voir plus */
                }}
                disabled={disabled}
              >
                <Text style={styles.modalButtonText}>Voir plus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.closeButton, disabled && styles.disabled]}
                onPress={toggleModal}
                disabled={disabled}
              >
                <Text style={styles.modalButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    width: "40%",
  },
  disabled: { opacity: 0.6 },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // boîte centrée et non pleine largeur (important pour numColumns)
  modalContent: {
    backgroundColor: COLORS.funPink,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "90%", // <- important : ne pas laisser 100% si tu veux 2 colonnes visibles
    height: "70%",
  },

  wordList: {
    paddingVertical: 8,
  },

  // gère l'espacement horizontal entre les 2 colonnes
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },

  // chaque item ~48% de la largeur du parent (permet 2 colonnes)
  wordItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bullet: {
    color: "#fff",
    fontSize: 18,
    marginRight: 8,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
  },
  closeButton: {
    backgroundColor: COLORS.funPinkLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
  },
  moreButton: {
    backgroundColor: COLORS.funPinkDark,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
  },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
});
