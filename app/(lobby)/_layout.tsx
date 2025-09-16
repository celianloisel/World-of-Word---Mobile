import React, { useEffect } from "react";
import { Slot, useLocalSearchParams } from "expo-router";
import { useSocket } from "@/contexts/socketContext";

export default function LobbyLayout() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const { setLobbyId } = useSocket();

  useEffect(() => {
    setLobbyId(roomId ?? "lobby");
    return () => setLobbyId(null);
  }, [roomId, setLobbyId]);

  return <Slot />;
}
