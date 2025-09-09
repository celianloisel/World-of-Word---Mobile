import React, { useCallback, useEffect, useRef } from "react";
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
  boxSize?: number;
  autoPauseAfterScanMs?: number;
  active?: boolean;
};

export function QrScanner({
  onCode,
  boxSize = 300,
  autoPauseAfterScanMs,
  active = true,
}: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
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

  useEffect(() => {
    if (!active) {
      locked.current = false;
    }
  }, [active]);

  if (!permission)
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>…</Text>
      </View>
    );

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: "transparent" }]}>
        <Text style={styles.permTitle}>Accès à la caméra requis</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Autoriser</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={[styles.card, { width: boxSize, padding: 10 }]}>
        <View style={[styles.cameraShell, { borderRadius: 24 }]}>
          {/* ⬇️ Monter la caméra uniquement si actif */}
          {active && (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleScanned}
            />
          )}

          {/* Sinon, on peut garder le cadre visuel */}
          <View style={styles.frame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const corner = {
  width: 22,
  height: 22,
  borderColor: "white",
  position: "absolute" as const,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  loading: { color: "white", fontSize: 16, opacity: 0.8 },
  center: { alignItems: "center", justifyContent: "center" },

  card: {
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  cameraShell: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  frame: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderRadius: 24,
  },
  cornerTL: {
    ...corner,
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRadius: 2,
  },
  cornerTR: {
    ...corner,
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderRadius: 2,
  },
  cornerBL: {
    ...corner,
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderRadius: 2,
  },
  cornerBR: {
    ...corner,
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderRadius: 2,
  },

  permTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  primaryBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  primaryBtnText: { color: "white", fontWeight: "700" },
});
