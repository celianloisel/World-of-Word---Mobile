import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

type Props = {
  onPress?: () => void;
  style?: ViewStyle;
  label?: string;
};

export default function BackButton({
  onPress,
  style,
  label = "Retour",
}: Props) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.back())}
      style={[styles.btn, style]}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Revenir en arrière"
    >
      <FontAwesome6 name="chevron-left" style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  chevron: { color: "#fff", fontSize: 16, fontWeight: "700" },
  label: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
