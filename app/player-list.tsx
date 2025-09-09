import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { RoundedPrimaryButton } from "@/components/RoundedPrimaryButton";
import { useSocketIO } from "@/hooks/sockets/useSocketIO";
import { COLORS } from "@/constants/colors";

type Player = {
  username: string;
  socketId: string;
};

type PlayerJoinedPayload = {
  roomId: string;
  username: string;
  socketId: string;
};

export default function PlayerList() {
  if (!process.env.EXPO_PUBLIC_SERVER_URL) {
    throw new Error("SERVER_URL is not defined");
  }

  const router = useRouter();
  const params = useLocalSearchParams();

  const { socket } = useSocketIO(process.env.EXPO_PUBLIC_SERVER_URL);

  const initialPlayers: Player[] = params.players
    ? JSON.parse(params.players as string)
    : [];

  const [players, setPlayers] = useState<Player[]>(initialPlayers);

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

  useEffect(() => {
    if (!socket) return;

    const handlePlayerJoined = (payload: PlayerJoinedPayload) => {
      setPlayers((prev) => [...prev, payload]);
    };

    socket.on("lobby:player-joined", handlePlayerJoined);

    return () => {
      socket.off("lobby:player-joined", handlePlayerJoined);
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des joueurs</Text>

      <FlatList
        data={players}
        keyExtractor={(item) => item.socketId}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => {
          const initials =
            item.username
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
              <Text style={styles.name}>{item.username}</Text>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <RoundedPrimaryButton
          title="Commencer"
          onPress={() => router.push("/")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 16,
  },
  listContent: { paddingVertical: 8 },
  separator: { height: 12 },
  card: {
    backgroundColor: COLORS.backgroundAlt,
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
  footer: { marginTop: "auto", gap: 8 },
});
