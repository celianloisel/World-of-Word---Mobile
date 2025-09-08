import React from "react";
import { Image, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { RoundedPrimaryButton } from "@/components/RoundedPrimaryButton";
import { TextField } from "@/components/TextField";

export default function PlayerList() {
  return (
    <View>
      <TextField value={"test"} onChangeText={() => {}}></TextField>
    </View>
  );
}
