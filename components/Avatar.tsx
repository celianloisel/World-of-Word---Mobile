import Avatar, { genConfig } from "@zamplyy/react-native-nice-avatar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { COLORS } from "@/constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";

type AvatarGeneratorProps = {
  onExportJSON?: (json: string, config: Record<string, unknown>) => void;
};

export default function AvatarGenerator({
  onExportJSON,
}: AvatarGeneratorProps) {
  const [config, setConfig] = useState(() => genConfig());

  useEffect(() => {
    if (!onExportJSON) return;
    const json = JSON.stringify(config, null, 2);
    onExportJSON(json, config as Record<string, unknown>);
  }, [config, onExportJSON]);

  const regenerateAvatar = useCallback(() => {
    setConfig(genConfig());
  }, []);

  const facePresets = useMemo(
    () => [
      {
        earSize: "small",
        eyeStyle: "circle",
        noseStyle: "short",
        mouthStyle: "smile",
      },
      {
        earSize: "big",
        eyeStyle: "oval",
        noseStyle: "long",
        mouthStyle: "laugh",
      },
      {
        earSize: "small",
        eyeStyle: "smile",
        noseStyle: "round",
        mouthStyle: "peace",
      },
      {
        earSize: "big",
        eyeStyle: "oval",
        noseStyle: "short",
        mouthStyle: "laugh",
      },
    ],
    [],
  );

  const facePresetIndexRef = useRef(0);

  const cycleFacePreset = useCallback(() => {
    const nextIdx = (facePresetIndexRef.current + 1) % facePresets.length;
    facePresetIndexRef.current = nextIdx;
    const nextPreset = facePresets[nextIdx];
    setConfig((prev: any) => ({ ...prev, ...nextPreset }));
  }, [facePresets]);

  const exportAsJSON = useCallback(() => {
    const json = JSON.stringify(config, null, 2);
    if (onExportJSON) {
      onExportJSON(json, config as Record<string, unknown>);
    } else {
      try {
        Alert.alert("Avatar JSON", json);
      } catch {
        // Fallback to console if Alert is unavailable
      }
    }
  }, [config, onExportJSON]);

  const colorChoices = useMemo(
    () => ({
      faceColor: ["#FCD7B6", "#F1C27D", "#E0AC69", "#C68642", "#8D5524"],
      hairColor: [
        "#2C2C2C",
        "#4A2C2A",
        "#8B5E3C",
        "#D2B48C",
        "#000000",
        "#B5651D",
        "#4F86F7",
      ],
      shirtColor: [
        COLORS.primary,
        COLORS.secondary,
        COLORS.tertiary,
        COLORS.funPink,
        COLORS.funBlue,
        COLORS.funGreen,
        COLORS.funOrange,
        COLORS.funYellow,
      ],
      bgColor: [
        "#FFFFFF",
        COLORS.background,
        COLORS.backgroundMuted,
        "#F0F9FF",
        "#FFF7ED",
        COLORS.primary,
        COLORS.secondary,
        COLORS.tertiary,
        COLORS.funPink,
        COLORS.funBlue,
        COLORS.funGreen,
        COLORS.funOrange,
        COLORS.funYellow,
      ],
    }),
    [],
  );

  const hairStyles = useMemo(
    () => [
      "normal",
      "thick",
      "mohawk",
      "womanLong",
      "womanShort",
      "buzz",
      "bun",
      "pixie",
    ],
    [],
  );

  const cycleColor = useCallback(
    (key: keyof typeof colorChoices) => {
      setConfig((prev: any) => {
        const options = (colorChoices as any)[key] as string[];
        const current = (prev as any)[key];
        const idx = Math.max(
          0,
          options.findIndex((c) => c === current),
        );
        const next = options[(idx + 1) % options.length];
        return { ...prev, [key]: next };
      });
    },
    [colorChoices],
  );

  // Removed randomize all colors; we now only cycle hair color via the palette button

  const cycleHairStyle = useCallback(() => {
    setConfig((prev: any) => {
      const current = (prev as any).hairStyle;
      const idx = Math.max(
        0,
        hairStyles.findIndex((s) => s === current),
      );
      const next = hairStyles[(idx + 1) % hairStyles.length];
      return { ...prev, hairStyle: next };
    });
  }, [hairStyles]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
          <Avatar size={280} {...config} />
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.controlBar}>
          <TouchableOpacity
            onPress={cycleFacePreset}
            style={styles.smallButton}
          >
            <FontAwesome5 name="smile" size={16} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => cycleColor("faceColor")}
            style={styles.smallButton}
          >
            <FontAwesome5 name="user" size={16} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={cycleHairStyle} style={styles.smallButton}>
            <FontAwesome5 name="brush" size={16} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => cycleColor("shirtColor")}
            style={styles.smallButton}
          >
            <FontAwesome5
              name="tshirt"
              size={16}
              color={COLORS.textOnPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => cycleColor("bgColor")}
            style={styles.smallButton}
          >
            <FontAwesome5 name="image" size={16} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => cycleColor("hairColor")}
            style={styles.smallButton}
            onLongPress={exportAsJSON}
          >
            <FontAwesome5
              name="palette"
              size={16}
              color={COLORS.textOnPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={regenerateAvatar}
            style={styles.smallButtonPrimary}
          >
            <FontAwesome5 name="dice" size={16} color={COLORS.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 0,
    width: "100%",
    paddingBottom: 48,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    padding: 12,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: COLORS.funPinkDark,
    backgroundColor: COLORS.backgroundAlt,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  actions: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  smallButton: {
    backgroundColor: COLORS.funPink,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  smallButtonPrimary: {
    backgroundColor: COLORS.funPinkDark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  buttonText: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
});
