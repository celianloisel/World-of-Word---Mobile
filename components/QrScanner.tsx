import React, { useCallback, useRef } from "react";
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
  title = "Scanne le QR de la salle",
  boxSize = 300,
  autoPauseAfterScanMs,
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

  if (!permission)
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>…</Text>
      </View>
    );

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: "transparent" }]}>
        <Text style={styles.title}>Accès à la caméra requis</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Autoriser</Text>
        </TouchableOpacity>
        {onCancel ? (
          <TouchableOpacity onPress={onCancel} style={styles.linkBtn}>
            <Text style={styles.linkText}>Annuler</Text>
          </TouchableOpacity>
        ) : null}
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

      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={[styles.card, { width: boxSize, padding: 10 }]}>
        <View style={[styles.cameraShell, { borderRadius: 24 }]}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleScanned}
          />

          <View style={styles.frame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>
      </View>

      {onCancel ? (
        <TouchableOpacity onPress={onCancel} style={styles.linkBtn}>
          <Text style={styles.linkText}>Annuler</Text>
        </TouchableOpacity>
      ) : null}
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
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 28 : 0,
    paddingBottom: 24,
  },
  header: {
    width: "100%",
    alignItems: "center",
    paddingTop: 8,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loading: { color: "white", fontSize: 16, opacity: 0.8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

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

  primaryBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  primaryBtnText: { color: "white", fontWeight: "700" },
  linkBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  linkText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
