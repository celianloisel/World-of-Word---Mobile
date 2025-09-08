import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  connected: boolean;
  roomId: string;
};

export function ConnectionStatus({ connected, roomId }: Props) {
  const text = connected ? `Connecté` : "Hors ligne";

  return (
    <View style={styles.footer}>
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: connected ? COLORS.successDark : COLORS.errorDark,
          },
        ]}
      />
      <Text style={styles.statusText}>{text}</Text>
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
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { color: COLORS.text, fontWeight: "500" },
});
