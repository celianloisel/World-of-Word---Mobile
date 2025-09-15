import { SuccessToast, ErrorToast } from "react-native-toast-message";
import { COLORS } from "@/constants/colors";

export const successToastConfig = (props: any) => (
  <SuccessToast
    {...props}
    style={{
      borderLeftColor: COLORS.success,
      borderLeftWidth: 6,
      backgroundColor: COLORS.backgroundAlt,
      marginTop: 16,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    }}
    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
    text1Style={{
      fontSize: 16,
      fontWeight: "700",
      color: COLORS.funPink,
    }}
    text2Style={{
      fontSize: 14,
      fontWeight: "500",
      color: COLORS.text,
      marginTop: 2,
    }}
  />
);

export const errorToastConfig = (props: any) => (
  <ErrorToast
    {...props}
    style={{
      borderLeftColor: COLORS.error,
      borderLeftWidth: 6,
      backgroundColor: COLORS.backgroundAlt,
      marginTop: 16,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    }}
    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
    text1Style={{
      fontSize: 16,
      fontWeight: "700",
      color: COLORS.errorDark,
    }}
    text2Style={{
      fontSize: 14,
      fontWeight: "500",
      color: COLORS.text,
      marginTop: 2,
    }}
  />
);

export const toastConfig = {
  success: successToastConfig,
  error: errorToastConfig,
};
