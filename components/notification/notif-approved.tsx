import Toast from "react-native-toast-message";
import { Button } from "react-native";
import { successToastConfig } from "../../app/toastLayouts";

export function NotifApproved(props: any) {
  const showApprovedToast = () => {
    Toast.show({
      type: "success",
      text1: "Demande approuvée",
      text2: "Votre demande a été approuvée ✅",
      visibilityTime: 2000, // 2 secondes
    });
  };

  return <Button title="Simuler approbation" onPress={showApprovedToast} />;
}
