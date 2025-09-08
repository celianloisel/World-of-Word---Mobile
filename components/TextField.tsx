import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";
import { COLORS } from "@/constants/colors";

type Props = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
};

export function TextField({ value, onChangeText, ...rest }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      placeholderTextColor={COLORS.textLight}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.funPinkLight,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: COLORS.backgroundStrong,
    color: COLORS.text,
  },
});
