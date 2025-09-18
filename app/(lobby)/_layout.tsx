import React, { useEffect } from "react";
import { Slot, useLocalSearchParams, useRouter } from "expo-router";
import { useSocket } from "@/contexts/socketContext";

type PlayerDisconnectedPayload = {
  roomId?: string;
  socketId?: string;
  actor?: "Mobile" | "PC";
};

export default function LobbyLayout() {
  const params = useLocalSearchParams<{ roomId?: string | string[] }>();
  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : params.roomId;

  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    socket?.setLobbyId?.(roomId ?? "lobby");
    return () => socket?.setLobbyId?.(null);
  }, [roomId, socket]);

  useEffect(() => {
    if (!socket?.on || !socket?.off) return;

    const handlePlayerDisconnected = (payload: PlayerDisconnectedPayload) => {
      if (payload?.actor === "PC") {
        router.replace("/");
      }
    };

    socket.on("lobby:player:disconnected", handlePlayerDisconnected);
    return () => {
      socket.off("lobby:player:disconnected", handlePlayerDisconnected);
    };
  }, [socket, router]);

  return <Slot />;
}
