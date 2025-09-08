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
