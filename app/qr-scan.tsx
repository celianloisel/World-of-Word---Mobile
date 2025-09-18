import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { QrScanner } from "@/components/QrScanner";
import Toast from "react-native-toast-message";

export default function QrScan() {
  const router = useRouter();
  const isFocused = useIsFocused();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scanne le QR de la salle</Text>
      </View>

      <View style={styles.scannerWrapper}>
        <QrScanner
          active={isFocused}
          onCode={(raw) => {
            try {
              const parsed = JSON.parse(raw);
              router.push({
                pathname: "/username",
                params: {
                  roomId: parsed.qrPayload.roomId,
                  token: parsed.qrPayload.joinToken,
                },
              });
            } catch {
              Toast.show({
                type: "error",
                text1: "QR invalide",
                text2: "Le code scanné n'est pas reconnu",
                visibilityTime: 2000,
              });
            }
          }}
          boxSize={300}
          autoPauseAfterScanMs={1200}
        />
      </View>

      <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
        <Text style={styles.linkText}>Annuler</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-between" },
  header: { width: "100%", alignItems: "center" },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scannerWrapper: { alignItems: "center", justifyContent: "center" },
  linkBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  linkText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
