import React, { createContext, useContext, useState, useMemo } from "react";

export type Word = {
  text: string;
  types: string[];
};

type IncomingWord =
  | Word
  | string
  | {
      word: string;
      types: string[];
    };

type GameContextType = {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  words: Word[];
  setWords: (
    words: (Word | string | { word: string; type?: string })[],
  ) => void;
};

const GameContext = createContext<GameContextType | null>(null);

function normalizeWord(w: IncomingWord): Word {
  if (typeof w === "string") return { text: w, types: [] };
  if ("text" in w) return w as Word;
  return { text: w.word, types: w.types };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [words, _setWords] = useState<Word[]>([]);

  const setWords = (ws: IncomingWord[]) => {
    const normalized = ws.map(normalizeWord);
    _setWords(
      [...normalized].sort((a, b) =>
        a.text.localeCompare(b.text, "fr", { sensitivity: "base" }),
      ),
    );
  };

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
