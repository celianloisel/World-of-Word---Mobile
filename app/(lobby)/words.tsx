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
  Pressable,
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

type PlatformItem = { id: string; x: number; y: number; width: number };

export default function Words() {
  const VIEW_WIDTH_UNITS = 100;
  const VIEW_PADDING_UNITS = 2;
  const GRID_STEP = 10;

  const [viewStart, setViewStart] = useState(0);
  const { words } = useGame();
  const [input, setInput] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { emit, on, off } = useSocket() as {
    emit: (event: string, payload?: any, cb?: (res: any) => void) => void;
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
    return totalH - (Math.max(0, yPct) / 100) * totalH;
  }, []);

  const onHeroLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setHeroSize({ w: width, h: height });
  }, []);

  const groupedById = useMemo(() => {
    const map = new Map<
      string,
      { cells: { x: number; y: number }[]; set: Set<string> }
    >();
    for (const p of platforms) {
      if (!map.has(p.id)) map.set(p.id, { cells: [], set: new Set() });
      const bucket = map.get(p.id)!;

      for (let i = 0; i < p.width; i++) {
        const cx = Math.round(p.x) + i;
        const topY = Math.round(p.y);
        for (let cy = 0; cy <= topY; cy++) {
          const key = `${cx},${cy}`;
          if (!bucket.set.has(key)) {
            bucket.set.add(key);
            bucket.cells.push({ x: cx, y: cy });
          }
        }
      }
    }
    return map;
  }, [platforms]);

  const edgesById = useMemo(() => {
    type Edges = {
      H: Array<{ cx: number; y: number }>;
      V: Array<{ x: number; cy: number }>;
    };
    const out = new Map<string, Edges>();

    groupedById.forEach((bucket, id) => {
      const edgeSet = new Set<string>();

      for (const { x: cx, y: cy } of bucket.cells) {
        const topKey = `H|${cx}|${2 * cy + 1}`;
        const bottomKey = `H|${cx}|${2 * cy - 1}`;
        const leftKey = `V|${2 * cx - 1}|${cy}`;
        const rightKey = `V|${2 * cx + 1}|${cy}`;
        for (const k of [topKey, bottomKey, leftKey, rightKey]) {
          if (edgeSet.has(k)) edgeSet.delete(k);
          else edgeSet.add(k);
        }
      }

      const H: Edges["H"] = [];
      const V: Edges["V"] = [];
      edgeSet.forEach((k) => {
        const [type, a, b] = k.split("|");
        if (type === "H") {
          const cx = parseInt(a, 10);
          const y = parseInt(b, 10) / 2;
          H.push({ cx, y });
        } else {
          const x = parseInt(a, 10) / 2;
          const cy = parseInt(b, 10);
          V.push({ x, cy });
        }
      });

      out.set(id, { H, V });
    });

    return out;
  }, [groupedById]);

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
        if (right > viewEnd - VIEW_PADDING_UNITS)
          return right - VIEW_WIDTH_UNITS + VIEW_PADDING_UNITS;
        if (x < prev + VIEW_PADDING_UNITS)
          return Math.max(0, x - VIEW_PADDING_UNITS);
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

    if (platform && !selectedGroup) {
      console.log("❌ Vous devez sélectionner une plateforme avant d'envoyer.");
      return;
    }

    const eventName = platform ? "event:add:platform" : "event:add";
    const payload: any = {
      word: raw,
      type: platform ? "event:platform" : "event:player",
    };

    if (platform) {
      payload.platform = selectedGroup;
    }

    emit(eventName, payload);
    console.log("✅ Mot envoyé :", payload);

    setInput("");
    setSelectedType(null);
  }, [emit, input, found, foundTypes, selectedType, selectedGroup]);

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

  const pixelW = heroSize.w / VIEW_WIDTH_UNITS;
  const pixelH = heroSize.h / 100;

  const viewEnd = viewStart + VIEW_WIDTH_UNITS;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.hero} onLayout={onHeroLayout}>
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

            {Array.from(groupedById.entries()).flatMap(([id, bucket]) =>
              bucket.cells.map(({ x: cx, y: cy }) => {
                if (cx + 1 < viewStart - 1 || cx > viewEnd + 1) return null;
                const left = unitToPxX(cx - 0.5, heroSize.w);
                const top = pctToPxY(cy - 0.5, heroSize.h);
                return (
                  <Pressable
                    key={`cell-${id}-${cx}-${cy}`}
                    onPress={() => {
                      setSelectedGroup(id === selectedGroup ? null : id);
                    }}
                    style={[
                      styles.pixel,
                      {
                        left,
                        top,
                        width: pixelW,
                        height: pixelH,
                        backgroundColor:
                          selectedGroup === id ? "#32CD32" : "#8B4513",
                        borderWidth: selectedGroup === id ? 2 : 0,
                        borderColor:
                          selectedGroup === id ? "yellow" : "transparent",
                      },
                    ]}
                  />
                );
              }),
            )}

            {Array.from(edgesById.entries()).flatMap(([id, edges]) => {
              const lines: JSX.Element[] = [];
              const HbyY = new Map<number, number[]>();
              edges.H.forEach(({ cx, y }) => {
                if (!HbyY.has(y)) HbyY.set(y, []);
                HbyY.get(y)!.push(cx);
              });

              HbyY.forEach((cxs, y) => {
                cxs.sort((a, b) => a - b);
                let runStart = cxs[0];
                let prev = cxs[0];
                for (let i = 1; i <= cxs.length; i++) {
                  const cur = cxs[i];
                  if (cur !== prev + 1) {
                    const unitStart = runStart - 0.5;
                    const unitEnd = prev + 0.5;
                    const viewEnd = viewStart + VIEW_WIDTH_UNITS;
                    if (!(unitEnd < viewStart || unitStart > viewEnd)) {
                      const left = unitToPxX(
                        Math.max(unitStart, viewStart),
                        heroSize.w,
                      );
                      const rightPx = unitToPxX(
                        Math.min(unitEnd, viewEnd),
                        heroSize.w,
                      );
                      const top = pctToPxY(y, heroSize.h);
                      lines.push(
                        <View key={`H-bg-${id}-${y}-${runStart}-${prev}`}>
                          <View
                            style={{
                              position: "absolute",
                              left,
                              top: top,
                              width: Math.max(1, rightPx - left),
                              height: 2,
                              backgroundColor: "lime",
                            }}
                          />
                          <View
                            style={{
                              position: "absolute",
                              left,
                              top,
                              width: Math.max(1, rightPx - left),
                              height: 1,
                              backgroundColor: "#000",
                            }}
                          />
                        </View>,
                      );
                    }
                    runStart = cur;
                  }
                  prev = cur;
                }
              });

              const VbyX = new Map<number, number[]>();
              edges.V.forEach(({ x, cy }) => {
                if (!VbyX.has(x)) VbyX.set(x, []);
                VbyX.get(x)!.push(cy);
              });

              VbyX.forEach((cys, x) => {
                cys.sort((a, b) => a - b);
                let runStart = cys[0];
                let prev = cys[0];
                for (let i = 1; i <= cys.length; i++) {
                  const cur = cys[i];
                  if (cur !== prev + 1) {
                    const unitTop = prev + 0.5;
                    const unitBottom = runStart - 0.5;
                    const viewEnd = viewStart + VIEW_WIDTH_UNITS;
                    if (!(x < viewStart || x > viewEnd)) {
                      const left = unitToPxX(x, heroSize.w);
                      const top = pctToPxY(unitTop, heroSize.h);
                      const bottomPx = pctToPxY(unitBottom, heroSize.h);
                      lines.push(
                        <View
                          key={`V-${id}-${x}-${runStart}-${prev}`}
                          style={[
                            styles.edgeV,
                            { left, top, height: Math.max(1, bottomPx - top) },
                          ]}
                          pointerEvents="none"
                        />,
                      );
                    }
                    runStart = cur;
                  }
                  prev = cur;
                }
              });

              return lines;
            })}
          </View>

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

            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typePill,
                  generalEnabled ? null : styles.typePillDisabled,
                  selectedType && selectedType === (generalType ?? "")
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
                    selectedType && selectedType === (generalType ?? "")
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
                  selectedType && selectedType === (platformType ?? "")
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
                    selectedType && selectedType === (platformType ?? "")
                      ? styles.typePillTextSelected
                      : null,
                  ]}
                >
                  {TYPE_LABELS.platform}
                </Text>
              </TouchableOpacity>
            </View>

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
    backgroundColor: "#87CEEB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E8EF",
    overflow: "hidden",
    position: "relative",
  },

  pixel: {
    position: "absolute",
  },

  edgeH: {
    position: "absolute",
    height: 1,
    backgroundColor: "#000",
  },
  edgeV: {
    position: "absolute",
    width: 1,
    backgroundColor: "#000",
  },

  gridV: {
    position: "absolute",
    width: 1,
    backgroundColor: "lightgrey",
  },
  gridH: {
    position: "absolute",
    height: 1,
    backgroundColor: "lightgrey",
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
