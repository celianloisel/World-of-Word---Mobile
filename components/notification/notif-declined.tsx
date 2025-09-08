import Toast from "react-native-toast-message";
import { Button } from "react-native";
import { errorToastConfig } from "../../app/toastLayouts";

export function NotifDeclined(props: any) {
  const showDeclinedToast = () => {
    Toast.show({
      type: "error",
      text1: "Demande refusée",
      text2: "Votre demande a été refusée ❌",
      visibilityTime: 2000, // 2 secondes
    });
  };

  return <Button title="Simuler refus" onPress={showDeclinedToast} />;
}
