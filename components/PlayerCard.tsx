import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Avatar from "@zamplyy/react-native-nice-avatar";
import { COLORS } from "@/constants/colors";

type Props = {
  username: string;
  index?: number;
  avatarConfig?: Record<string, unknown>;
};

export default function PlayerCard({ username, index, avatarConfig }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        {avatarConfig ? (
          <Avatar size={44} {...avatarConfig} />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>
              {username?.trim()?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{username}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: "#E6E8EF",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  rank: { fontSize: 14, fontWeight: "700", color: COLORS.textLight },
  fallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.funPinkLight,
  },
  fallbackText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
