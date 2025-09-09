import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = {
  username: string;
  index: number;
};

export default function PlayerCard({ username, index }: Props) {
  const avatarPalette = useMemo(
    () => [
      COLORS.funPink,
      COLORS.funBlue,
      COLORS.funGreen,
      COLORS.funOrange,
      COLORS.funYellow,
      COLORS.tertiary,
      COLORS.secondary,
    ],
    [],
  );

  const initials =
    username
      ?.trim()
      ?.split(/\s+/)
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?";
  const avatarBg = avatarPalette[index % avatarPalette.length];

  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.name}>{username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.textOnPrimary, fontWeight: "800", fontSize: 16 },
  name: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
});
