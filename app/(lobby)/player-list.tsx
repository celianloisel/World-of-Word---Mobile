import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSocket } from "@/contexts/socketContext";
import { useGame } from "@/contexts/gameContext";
import { COLORS } from "@/constants/colors";
import PlayerCard from "@/components/PlayerCard";

type Player = { username: string; socketId: string };
type PlayerJoinedPayload = {
  roomId: string;
  username: string;
  socketId: string;
};
type GameStartPayload = { roomId?: string };
type GameWordsPayload = { words: string[]; roomId?: string };

export default function PlayerList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { connected, on, off } = useSocket();
  const { setRoomId, setWords } = useGame();

  const initialPlayers: Player[] = params.players
    ? JSON.parse(params.players as string)
    : [];
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  useEffect(() => {
    const handlePlayerJoined = (payload: PlayerJoinedPayload) => {
      setPlayers((prev) => {
        if (prev.some((p) => p.socketId === payload.socketId)) return prev;
        return [
          ...prev,
          { username: payload.username, socketId: payload.socketId },
        ];
      });
    };

    const handleGameStart = (payload: GameStartPayload) => {
      const roomIdFromParams =
        (params.roomId as string | undefined) || undefined;
      const roomId = payload?.roomId ?? roomIdFromParams;

      if (roomId) setRoomId(roomId);

      router.replace({
        pathname: "/words",
        params: roomId ? { roomId } : undefined,
      });
    };

    const handleGameWords = (payload: GameWordsPayload) => {
      if (payload?.words) {
        setWords(payload.words);
      }
    };

    if (connected) {
      on("lobby:player:joined", handlePlayerJoined);
      on("game:start:notify", handleGameStart);
      on("game:word", handleGameWords);
    }

    return () => {
      off("lobby:player:joined", handlePlayerJoined);
      off("game:start:notify", handleGameStart);
      off("game:word", handleGameWords);
    };
  }, [connected, on, off, params.roomId, router, setRoomId, setWords]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des joueurs</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.socketId}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <PlayerCard username={item.username} index={index} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>En attente de joueurs…</Text>
        }
      />
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
  empty: { textAlign: "center", color: COLORS.text, marginTop: 24 },
  footer: { marginTop: "auto", gap: 8 },
});
