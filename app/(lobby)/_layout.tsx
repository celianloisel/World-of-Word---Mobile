import React, { useEffect } from "react";
import { Slot, useLocalSearchParams } from "expo-router";
import { useSocket } from "@/contexts/socketContext";

export default function LobbyLayout() {
  const params = useLocalSearchParams<{ roomId?: string | string[] }>();
  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : params.roomId;

  const socket = useSocket();

  useEffect(() => {
    socket?.setLobbyId?.(roomId ?? "lobby");
    return () => socket?.setLobbyId?.(null);
  }, [roomId, socket]);

  return <Slot />;
}
