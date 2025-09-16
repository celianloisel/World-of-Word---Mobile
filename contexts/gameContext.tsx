import React, { createContext, useContext, useState, useMemo } from "react";

type GameContextType = {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  words: string[];
  setWords: (words: string[]) => void;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);

  const value = useMemo(
    () => ({
      roomId,
      setRoomId,
      words,
      setWords,
    }),
    [roomId, words],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
