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
  FlatList,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { WordIndex } from "@/components/WordIndex";
import { TextField } from "@/components/TextField";
import { useGame } from "@/contexts/gameContext";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { useSocket } from "@/contexts/socketContext";
import Toast from "react-native-toast-message";
import Avatar from "@zamplyy/react-native-nice-avatar";

const TYPE_LABELS: Record<string, string> = {
  general: "Général",
  platform: "Plateforme",
};

const isPlatformType = (t: string | null) => !!t && /(^|:)platform$/.test(t);

type PlatformItem = { id: string; x: number; y: number; width: number };

type HistoryItem = {
  id: string;
  word: string;
  username: string;
  date: string;
  avatar?: string | Record<string, unknown>;
};

const ALLOWED_AVATAR_KEYS = new Set([
  "sex",
  "faceColor",
  "earSize",
  "eyeStyle",
  "noseStyle",
  "mouthStyle",
  "shirtStyle",
  "glassesStyle",
  "hairColor",
  "hairStyle",
  "hatStyle",
  "hatColor",
  "eyeBrowStyle",
  "shirtColor",
  "bgColor",
]);

const parseAvatar = (raw?: string | Record<string, unknown>) => {
  if (!raw) return undefined;
  let obj: any = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  const clean: Record<string, unknown> = {};
  Object.keys(obj).forEach((k) => {
    if (ALLOWED_AVATAR_KEYS.has(k)) clean[k] = (obj as any)[k];
  });
  return clean;
};

const coerceAvatarConfig = (raw?: string | Record<string, unknown>) => {
  if (!raw) return undefined;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
  return raw as Record<string, unknown>;
};

const AvatarBubble = ({
  avatar,
  username,
  size = 36,
}: {
  avatar?: string | Record<string, unknown>;
  username: string;
  size?: number;
}) => {
  const cfg = parseAvatar(avatar);
  if (cfg) return <Avatar size={size} {...cfg} />;
  const initial = username?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <View
      style={[
        styles.fallbackAvatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.fallbackAvatarText}>{initial}</Text>
    </View>
  );
};

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

  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!on || !off) return;

    const handleWordNotify = (
      payload:
        | { word: string; username: string; date: string; avatar?: any }
        | Array<{ word: string; username: string; date: string; avatar?: any }>,
    ) => {
      const items = Array.isArray(payload) ? payload : [payload];

      const next: HistoryItem[] = items.map((p) => ({
        id:
          `${p.username}-${p.word}-${p.date}-` +
          Math.random().toString(36).slice(2),
        word: p.word,
        username: p.username,
        date: p.date,
        avatar: p.avatar,
      }));

      next.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setHistory(next.slice(0, 6));
    };

    const handleRestart = () => {
      setHistory([]);
      setPlatforms([]);
    };

    on("game:word:notify", handleWordNotify);
    on("game:restart:notify", handleRestart);
    return () => {
      off("game:word:notify", handleWordNotify);
      off("game:restart:notify", handleRestart);
    };
  }, [on, off]);

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

    const handleSuccess = () => {
      Toast.show({
        type: "success",
        text1: "Mot envoyé",
        text2: "Le mot a bien été envoyé",
        visibilityTime: 2000,
      });
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      setInput("");
      setSelectedGroup(null);
      setSelectedType(null);
    };

    const handleError = (payload?: {
      code?: string | number;
      message?: string;
    }) => {
      Toast.show({
        type: "error",
        text1: payload?.code ? `Erreur ${payload.code}` : "Erreur",
        text2: payload?.message ?? "Une erreur est survenue.",
        visibilityTime: 2500,
      });
    };

    on("event:success", handleSuccess);
    on("event:error", handleError);

    return () => {
      off("event:success", handleSuccess);
      off("event:error", handleError);
    };
  }, [on, off]);

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

  // Cooldown d’envoi (3s après un envoi réussi)
  const COOLDOWN_MS = 3000;
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  // Tick léger pour rafraîchir l’affichage du temps restant
  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => setNowTs(Date.now()), 250);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const remainingMs = Math.max(0, cooldownUntil - nowTs);
  const cooldownActive = remainingMs > 0;
  const cooldownSec = Math.ceil(remainingMs / 1000);

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
    input.trim().length > 0 &&
    (!hasMultipleTypes || !!selectedType) &&
    (!(selectedType && isPlatformType(selectedType)) || !!selectedGroup) &&
    !cooldownActive; // ⬅️ ajoute ceci

  const handleSend = useCallback(() => {
    if (cooldownActive) {
      Toast.show({
        type: "info",
        text1: "Patiente un instant",
        text2: `Tu pourras renvoyer un mot dans ${cooldownSec}s.`,
        visibilityTime: 1500,
      });
      return;
    }

    const raw = input.trim();
    if (!raw) return;
    if (found && foundTypes.length > 1 && !selectedType) return;

    const typeCandidate =
      foundTypes.length === 1 ? foundTypes[0] : selectedType || "event:player";
    const isPlat = isPlatformType(typeCandidate);

    if (isPlat && !selectedGroup) {
      console.log("❌ Sélectionne une plateforme avant d'envoyer.");
      return;
    }

    const eventName = isPlat ? "event:add:platform" : "event:add";
    const payload: any = {
      word: raw,
      type: isPlat ? "event:platform" : "event:player",
    };

    if (isPlat) payload.platform = selectedGroup;

    emit(eventName, payload);
    console.log("✅ Mot envoyé :", payload);
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
          {/* Zone de jeu */}
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

          {/* Panneau de droite / bas */}
          <View style={styles.panel}>
            {/* Score + index */}
            <View style={styles.headerRow}>
              <View style={styles.indexButton}>
                <WordIndex words={words}>
                  <FontAwesome6 name="book-open" size={24} color="#fff" />
                </WordIndex>
              </View>
            </View>

            {/* Historique (rectangle sous le score, prend la place restante) */}
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Derniers mots joués</Text>
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.historyList}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => {
                  let dateStr = String(item.date);
                  try {
                    dateStr = new Date(item.date).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch {}
                  return (
                    <View style={styles.historyRow}>
                      <AvatarBubble
                        avatar={item.avatar}
                        username={item.username}
                        size={36}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyWord}>
                          &#34;{item.word}&#34;
                        </Text>
                        <Text style={styles.historyMeta}>
                          {item.username} • {dateStr}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.historyEmpty}>
                    — aucun mot pour l’instant —
                  </Text>
                }
              />
            </View>

            {/* Choix de type */}
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

            {/* Input + Send */}
            <View style={styles.formRow}>
              <View style={styles.inputWrapper}>
                <TextField
                  value={input}
                  onChangeText={handleWordSearch}
                  placeholder="Entrez un mot"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (canSend) handleSend();
                  }}
                />
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!canSend}
              >
                {cooldownActive ? (
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}
                  >
                    {cooldownSec}s
                  </Text>
                ) : (
                  <FontAwesome5 name="paper-plane" size={20} color="#fff" />
                )}
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

  pixel: { position: "absolute" },

  edgeH: { position: "absolute", height: 1, backgroundColor: "#000" },
  edgeV: { position: "absolute", width: 1, backgroundColor: "#000" },

  gridV: { position: "absolute", width: 1, backgroundColor: "lightgrey" },
  gridH: { position: "absolute", height: 1, backgroundColor: "lightgrey" },

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

  historyContainer: {
    flex: 1,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    overflow: "hidden",
  },
  historyTitle: {
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    fontSize: 14,
  },
  historyList: { paddingBottom: 4 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  historyWord: { fontWeight: "700", color: COLORS.text },
  historyMeta: { color: COLORS.textLight, fontSize: 12, marginTop: 2 },
  historyEmpty: {
    textAlign: "center",
    color: COLORS.textLight,
    paddingVertical: 12,
  },

  fallbackAvatar: {
    backgroundColor: COLORS.funPinkLight,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackAvatarText: { color: "#fff", fontWeight: "800" },

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
  typePillText: { fontWeight: "700", color: COLORS.funPink },
  typePillTextSelected: { color: "#fff" },
  typePillTextDisabled: { color: "#9AA0A6" },

  formRow: { flexDirection: "row", alignItems: "center" },
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
  sendBtnDisabled: { backgroundColor: COLORS.funPinkLight, opacity: 0.4 },
});
