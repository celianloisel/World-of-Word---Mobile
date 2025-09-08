import { CameraView } from "expo-camera";
import { Platform, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function QrScan() {
  const router = useRouter();

  return (
    <SafeAreaView style={styleSheet.container}>
      {Platform.OS === "android" ? <StatusBar hidden /> : null}

      <CameraView
        style={styleSheet.camStyle}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={({ data }) => {
          console.log("QR Code:", data);
          router.replace("/components/welcomeImage");
        }}
      />
    </SafeAreaView>
  );
}

const styleSheet = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    rowGap: 20,
  },
  camStyle: {
    position: "absolute",
    width: 300,
    height: 300,
  },
});
