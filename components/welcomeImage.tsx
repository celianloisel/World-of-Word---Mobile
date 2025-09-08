import { View, Image, StyleSheet } from "react-native";

export default function WelcomeImage() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/welcome.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 250,
    height: 250,
  },
});
