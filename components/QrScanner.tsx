import React, { useCallback, useRef, useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

type QrScannerProps = {
  onCode: (data: string) => void;
  onCancel?: () => void;
  title?: string;
  boxSize?: number;
  autoPauseAfterScanMs?: number;
};

export function QrScanner({
  onCode,
  onCancel,
  title = "Scanne le QR",
  boxSize = 260,
  autoPauseAfterScanMs,
}: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState<"on" | "off">("off");
  const locked = useRef(false);

  const handleScanned = useCallback(
    ({ data }: { data: string }) => {
      if (locked.current) return;
      locked.current = true;
      onCode?.(data);

      if (autoPauseAfterScanMs && autoPauseAfterScanMs > 0) {
        setTimeout(() => {
          locked.current = false;
        }, autoPauseAfterScanMs);
      }
    },
    [onCode, autoPauseAfterScanMs],
  );

  if (!permission)
    return (
      <View style={styles.center}>
        <Text>...</Text>
      </View>
    );

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Accès à la caméra requis</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Autoriser</Text>
        </TouchableOpacity>
        {onCancel ? (
          <TouchableOpacity onPress={onCancel} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Annuler</Text>
          </TouchableOpacity>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}

      <Text style={styles.title}>{title}</Text>

      <View style={[styles.cameraWrapper, { width: boxSize, height: boxSize }]}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch === "on"}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleScanned}
        />

        <View style={[styles.frame, { width: boxSize, height: boxSize }]}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setTorch((t) => (t === "on" ? "off" : "on"))}
        >
          <Text style={styles.secondaryBtnText}>
            {torch === "on" ? "Éteindre la lampe" : "Allumer la lampe"}
          </Text>
        </TouchableOpacity>

        {onCancel ? (
          <TouchableOpacity onPress={onCancel} style={styles.linkBtn}>
            <Text style={styles.linkText}>Annuler</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const corner = {
  width: 28,
  height: 28,
  borderColor: "white",
  position: "absolute" as const,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "black",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
  },
  cameraWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
  },
  cornerTL: {
    ...corner,
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRadius: 2,
  },
  cornerTR: {
    ...corner,
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderRadius: 2,
  },
  cornerBL: {
    ...corner,
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderRadius: 2,
  },
  cornerBR: {
    ...corner,
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 2,
  },

  actions: { marginTop: 24, alignItems: "center", gap: 12 },
  primaryBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryBtnText: { color: "white", fontWeight: "700" },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  secondaryBtnText: { color: "white", fontWeight: "600" },
  linkBtn: { padding: 8 },
  linkText: { color: "rgba(255,255,255,0.8)" },
});
