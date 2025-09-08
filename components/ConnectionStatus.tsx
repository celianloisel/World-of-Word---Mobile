import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  connected: boolean;
  joined: boolean;
};

export function ConnectionStatus({ connected, joined }: Props) {
  return (
    <View style={styles.footer}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: connected ? "#16a34a" : "#dc2626" },
        ]}
      />
      <Text style={styles.statusText}>
        {connected
          ? joined
            ? "Connecté • Salon rejoint"
            : "Connecté • En attente…"
          : "Hors ligne"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    backgroundColor: COLORS.backgroundStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: COLORS.text,
  },
});
