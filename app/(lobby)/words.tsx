import React, { useState, useCallback, useMemo, useEffect, JSX } from "react";
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { WordIndex } from "@/components/WordIndex";
import { TextField } from "@/components/TextField";
import { useGame } from "@/contexts/gameContext";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useSocket } from "@/contexts/socketContext";

const TYPE_LABELS: Record<string, string> = {
  general: "Général",
  platform: "Plateforme",
};

const isPlatformType = (t: string | null) => !!t && /(^|:)platform$/.test(t);

type PlatformItem = {
  id: string;
  x: number;
  y: number;
  width: number;
};

export default function Words() {
  const VIEW_WIDTH_UNITS = 100;
  const VIEW_PADDING_UNITS = 2;
  const GRID_STEP = 10;

  const [viewStart, setViewStart] = useState(0);
  const { words } = useGame();
  const [input, setInput] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { emit, on, off } = useSocket() as {
    emit: (event: string, payload?: any) => void;
    on?: (event: string, cb: (...args: any[]) => void) => void;
    off?: (event: string, cb: (...args: any[]) => void) => void;
  };

  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [heroSize, setHeroSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  const unitToPxX = useCallback(
    (xUnit: number, totalW: number) => {
      if (!Number.isFinite(xUnit) || totalW <= 0) return 0;
      return ((xUnit - viewStart) / VIEW_WIDTH_UNITS) * totalW;
    },
    [viewStart],
  );

  const pctToPxY = useCallback((yPct: number, totalH: number) => {
    if (!Number.isFinite(yPct) || totalH <= 0) return 0;
    return (Math.max(0, yPct) / 100) * totalH;
  }, []);

  const onHeroLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setHeroSize({ w: width, h: height });
  }, []);

  useEffect(() => {
    if (!on || !off) return;

    const handleAdd = (payload: {
      roomId: string;
      id: string;
      x: number;
      y: number;
      width: number;
    }) => {
      const { id, x, y, width } = payload;
      setPlatforms((prev) => [...prev, { id, x, y, width }]);

      setViewStart((prev) => {
        const right = x + width;
        const viewEnd = prev + VIEW_WIDTH_UNITS;

        if (right > viewEnd - VIEW_PADDING_UNITS) {
          return right - VIEW_WIDTH_UNITS + VIEW_PADDING_UNITS;
        }
        if (x < prev + VIEW_PADDING_UNITS) {
          return Math.max(0, x - VIEW_PADDING_UNITS);
        }
        return prev;
      });
    };

    const handleRemove = (payload: { roomId: string; id: string }) => {
      const { id } = payload;
      setPlatforms((prev) => prev.filter((p) => p.id !== id));
    };

    on("game:platform:add:notify", handleAdd);
    on("game:platform:remove:notify", handleRemove);
    return () => {
      off("game:platform:add:notify", handleAdd);
      off("game:platform:remove:notify", handleRemove);
    };
  }, [on, off]);

  const lower = useMemo(() => input.trim().toLocaleLowerCase("fr"), [input]);
  const found = useMemo(
    () => words.find((w) => w.text.toLocaleLowerCase("fr") === lower),
    [words, lower],
  );

  const foundTypes: string[] = found?.types ?? [];
  const hasMultipleTypes = foundTypes.length > 1;
  const platformType = useMemo(
    () => foundTypes.find((t) => isPlatformType(t)) ?? null,
    [foundTypes],
  );
  const generalType = useMemo(
    () => foundTypes.find((t) => !isPlatformType(t)) ?? null,
    [foundTypes],
  );

  const platformEnabled = hasMultipleTypes && !!platformType;
  const generalEnabled = hasMultipleTypes && !!generalType;

  useEffect(() => {
    setSelectedType(null);
  }, [lower]);

  const canSend =
    input.trim().length > 0 && (!hasMultipleTypes || !!selectedType);

  const handleSend = useCallback(() => {
    const raw = input.trim();
    if (!raw) return;
    if (found && foundTypes.length > 1 && !selectedType) return;

    const typeCandidate =
      foundTypes.length === 1 ? foundTypes[0] : selectedType || "event:player";

    const platform = isPlatformType(typeCandidate);
    const eventName = platform ? "event:add:platform" : "event:add";
    const payload: any = {
      word: raw,
      type: platform ? "event:platform" : "event:player",
    };
    if (platform) {
      payload.platform = "a25d";
    }

    emit(eventName, payload);
    setInput("");
    setSelectedType(null);
  }, [emit, input, found, foundTypes, selectedType]);

  const handleWordSearch = useCallback((text: string) => setInput(text), []);

  const gridCols = useMemo(
    () =>
      Array.from(
        { length: Math.floor(VIEW_WIDTH_UNITS / GRID_STEP) + 2 },
        (_, i) => viewStart - (viewStart % GRID_STEP) + i * GRID_STEP,
      ),
    [viewStart],
  );
  const gridRows = useMemo(
    () =>
      Array.from(
        { length: Math.floor(100 / GRID_STEP) + 1 },
        (_, i) => i * GRID_STEP,
      ),
    [],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.hero} onLayout={onHeroLayout}>
            {/* Grille */}
            {gridCols.map((xUnit) => {
              const x = unitToPxX(xUnit, heroSize.w);
              return (
                <View
                  key={`vx-${xUnit}`}
                  style={[styles.gridV, { left: x, height: heroSize.h }]}
                />
              );
            })}
            {gridRows.map((yPct) => {
              const y = pctToPxY(yPct, heroSize.h);
              return (
                <View
                  key={`hz-${yPct}`}
                  style={[styles.gridH, { top: y, width: heroSize.w }]}
                />
              );
            })}

            {/* Plateformes */}
            {platforms.flatMap((p, idx) => {
              const pixels: JSX.Element[] = [];
              const pixelW = heroSize.w / VIEW_WIDTH_UNITS;
              const pixelH = heroSize.h / 100;

              for (let i = 0; i < p.width; i++) {
                const cellX = p.x - 0.5 + i;
                const cellY = p.y - 0.5;

                const viewEnd = viewStart + VIEW_WIDTH_UNITS;
                if (cellX + 1 < viewStart - 1 || cellX > viewEnd + 1) continue;

                const left = unitToPxX(cellX, heroSize.w);
                const top = pctToPxY(cellY, heroSize.h);

                pixels.push(
                  <View
                    key={`${p.id}-${idx}-${i}`}
                    style={[
                      styles.pixel,
                      { left, top, width: pixelW, height: pixelH },
                    ]}
                  />,
                );
              }
              return pixels;
            })}
          </View>

          {/* Panel du bas */}
          <View style={styles.panel}>
            <View style={styles.headerRow}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={styles.scoreValue}>0</Text>
              </View>

              <View style={styles.indexButton}>
                <WordIndex words={words}>
                  <FontAwesome6 name="book-open" size={24} color="#fff" />
                </WordIndex>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* Boutons type */}
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typePill,
                  generalEnabled ? null : styles.typePillDisabled,
                  selectedType && selectedType === generalType
                    ? styles.typePillSelected
                    : null,
                ]}
                onPress={() =>
                  generalEnabled && generalType && setSelectedType(generalType)
                }
                disabled={!generalEnabled}
              >
                <Text
                  style={[
                    styles.typePillText,
                    generalEnabled ? null : styles.typePillTextDisabled,
                    selectedType && selectedType === generalType
                      ? styles.typePillTextSelected
                      : null,
                  ]}
                >
                  {TYPE_LABELS.general}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typePill,
                  platformEnabled ? null : styles.typePillDisabled,
                  selectedType && selectedType === platformType
                    ? styles.typePillSelected
                    : null,
                ]}
                onPress={() =>
                  platformEnabled &&
                  platformType &&
                  setSelectedType(platformType)
                }
                disabled={!platformEnabled}
              >
                <Text
                  style={[
                    styles.typePillText,
                    platformEnabled ? null : styles.typePillTextDisabled,
                    selectedType && selectedType === platformType
                      ? styles.typePillTextSelected
                      : null,
                  ]}
                >
                  {TYPE_LABELS.platform}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View style={styles.formRow}>
              <View style={styles.inputWrapper}>
                <TextField
                  value={input}
                  onChangeText={handleWordSearch}
                  placeholder="Entrez un mot"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                />
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!canSend}
              >
                <FontAwesome5 name="paper-plane" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E8EF",
    overflow: "hidden",
    position: "relative",
  },

  pixel: {
    position: "absolute",
    backgroundColor: "#111",
  },

  gridV: {
    position: "absolute",
    width: 1,
    backgroundColor: "#EEF0F5",
  },
  gridH: {
    position: "absolute",
    height: 1,
    backgroundColor: "#F1F3F8",
  },

  panel: { flex: 1 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 10,
  },

  scoreCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 120,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.funPink,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.funPinkLight,
    marginTop: 2,
    lineHeight: 40,
  },

  indexButton: { alignItems: "flex-end" },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 8,
  },
  typePill: {
    flexBasis: "48%",
    maxWidth: "48%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.funPinkLight,
    marginBottom: 8,
  },
  typePillSelected: {
    backgroundColor: COLORS.funPink,
    borderColor: COLORS.funPink,
  },
  typePillDisabled: {
    backgroundColor: "#F0F1F5",
    borderColor: "#E3E5EC",
    opacity: 0.4,
  },
  typePillText: {
    fontWeight: "700",
    color: COLORS.funPink,
  },
  typePillTextSelected: {
    color: "#fff",
  },
  typePillTextDisabled: {
    color: "#9AA0A6",
  },

  formRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: { flex: 1 },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.funPink,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.funPinkLight,
    opacity: 0.4,
  },
});
