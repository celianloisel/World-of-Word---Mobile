import Toast, { SuccessToast, ErrorToast } from "react-native-toast-message";

export const successToastConfig = (props: any) => (
  <SuccessToast
    {...props}
    style={{ borderLeftColor: "pink", marginTop: 20 }}
    contentContainerStyle={{ paddingHorizontal: 15 }}
    text1Style={{
      fontSize: 15,
      fontWeight: "400",
    }}
  />
);

export const errorToastConfig = (props: any) => (
  <ErrorToast
    {...props}
    style={{ borderLeftColor: "red", marginTop: 20 }}
    contentContainerStyle={{ paddingHorizontal: 15 }}
    text1Style={{
      fontSize: 15,
      fontWeight: "400",
    }}
  />
);

export const toastConfig = {
  success: successToastConfig,
  error: errorToastConfig,
};
