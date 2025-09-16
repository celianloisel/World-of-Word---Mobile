import React from "react";
import {
  Image,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { RoundedPrimaryButton } from "@/components/RoundedPrimaryButton";
import Toast from "react-native-toast-message";

export default function Index() {
  const router = useRouter();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.topContainer}>
            <Image
              source={require("@/assets/images/wow.png")}
              style={styles.image}
              accessibilityLabel="Bienvenue"
            />
          </View>

          <RoundedPrimaryButton
            onPress={() => router.push("/words")}
            title={"Debug"}
          />
        </View>

        <View style={styles.buttonContainer}>
          <RoundedPrimaryButton
            onPress={() => router.push("/qr-scan")}
            title="Jouer !"
          />
          <View style={{ height: 12 }} />
          <RoundedPrimaryButton
            onPress={() =>
              Toast.show({
                type: "success",
                text1: "Succès",
                text2: "Ceci est une notification de test",
              })
            }
            title="Tester notification"
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  topContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  buttonContainer: {
    marginBottom: 128,
    width: "100%",
  },
});
