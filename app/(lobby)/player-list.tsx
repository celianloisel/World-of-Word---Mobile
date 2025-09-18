import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSocket } from "@/contexts/socketContext";
import { useGame, Word } from "@/contexts/gameContext";
import { COLORS } from "@/constants/colors";
import PlayerCard from "@/components/PlayerCard";
import { AvatarConfig } from "@zamplyy/react-native-nice-avatar";

type Player = {
  username: string;
  socketId: string;
  avatar?: string | AvatarConfig;
};

type PlayerJoinedPayload = {
  roomId: string;
  username: string;
  socketId: string;
  avatar?: string | AvatarConfig;
};

type PlayerDisconnectedPayload = {
  roomId?: string;
  socketId?: string;
  username?: string;
  actor?: "Mobile" | "PC";
  device?: "mobile" | "pc";
};

const coerceAvatar = (raw?: unknown) => {
  if (!raw) return undefined;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  if (typeof raw === "object") return raw as Record<string, unknown>;
  return undefined;
};

type GameStartPayload = { roomId?: string };

type GameWordsPayload = {
  roomId?: string;
  words?: (Word | string | { word: string; type?: string })[];
  wordTypes?: { word: string; type?: string }[];
};

export default function PlayerList() {
  const router = useRouter();
  const params = useLocalSearchParams<{ roomId?: string; players?: string }>();
  const socket = useSocket(); // ⚠️ on garde la ref entière
  const { setRoomId, setWords } = useGame();

  const currentRoomId = params.roomId;
  const initialPlayers: Player[] = params.players
    ? JSON.parse(params.players)
    : [];
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  useEffect(() => {
    const handlePlayerJoined = (payload: PlayerJoinedPayload) => {
      if (payload?.roomId && currentRoomId && payload.roomId !== currentRoomId)
        return;
      setPlayers((prev) => {
        if (prev.some((p) => p.socketId === payload.socketId)) return prev;
        return [
          ...prev,
          {
            username: payload.username,
            socketId: payload.socketId,
            avatar: payload.avatar,
          },
        ];
      });
    };

    const handlePlayerDisconnected = (payload: PlayerDisconnectedPayload) => {
      if (__DEV__) console.log("[lobby:player:disconnected]", payload);

      if (payload?.roomId && currentRoomId && payload.roomId !== currentRoomId)
        return;

      const source = (payload?.actor ?? payload?.device ?? "")
        .toString()
        .toLowerCase();

      if (source === "mobile") {
        setPlayers((prev) => {
          if (payload?.socketId) {
            return prev.filter((p) => p.socketId !== payload.socketId);
          }
          if (payload?.username) {
            return prev.filter((p) => p.username !== payload.username);
          }
          return prev;
        });
      }
    };

    const handleGameStart = (payload: GameStartPayload) => {
      const roomId = payload?.roomId ?? currentRoomId ?? undefined;
      if (roomId) setRoomId(roomId);
      router.replace({
        pathname: "/words",
        params: roomId ? { roomId } : undefined,
      });
    };

    const handleGameWords = (payload: GameWordsPayload) => {
      if (payload.wordTypes !== undefined && payload.wordTypes.length) {
        setWords(payload.wordTypes);
      } else if (payload?.words?.length) {
        setWords(payload.words);
      }
    };

    if (!socket?.on || !socket?.off) return;

    socket.on("lobby:player:joined", handlePlayerJoined);
    socket.on("lobby:player:disconnected", handlePlayerDisconnected);
    socket.on("game:start:notify", handleGameStart);
    socket.on("game:word", handleGameWords);

    return () => {
      socket.off("lobby:player:joined", handlePlayerJoined);
      socket.off("lobby:player:disconnected", handlePlayerDisconnected);
      socket.off("game:start:notify", handleGameStart);
      socket.off("game:word", handleGameWords);
    };
  }, [socket, router, currentRoomId, setRoomId, setWords]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des joueurs</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.socketId}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <PlayerCard
            username={item.username}
            index={index}
            avatarConfig={coerceAvatar(item.avatar)}
          />
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
