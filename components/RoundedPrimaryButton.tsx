import { COLORS } from "@/constants/colors";
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function RoundedPrimaryButton({
  title,
  onPress,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.funPink,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
    letterSpacing: 1,
  },
  disabled: {
    opacity: 0.6,
  },
});
