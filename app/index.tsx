import React from "react";
import { QrScanner } from "@/components/QrScanner";
import { useRouter } from "expo-router";

export default function QrScanScreen() {
  const router = useRouter();

  return (
    <QrScanner
      title="Scanne le QR de la salle"
      onCode={(raw) => {
        try {
          const parsed = JSON.parse(raw);
          router.push({
            pathname: "/username",
            params: { roomId: parsed.roomId },
          });
        } catch (e) {
          console.error("QR invalide", e);
        }
      }}
      onCancel={() => router.back()}
    />
  );
}
