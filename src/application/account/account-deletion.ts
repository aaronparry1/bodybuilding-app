import { Alert, Linking } from "react-native";

export const ACCOUNT_DELETION_URL = "https://adaptivestrengthcoach.com/delete-account/";

export async function openAccountDeletionRequest(): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(ACCOUNT_DELETION_URL);
    if (!supported) throw new Error("unsupported");
    await Linking.openURL(ACCOUNT_DELETION_URL);
  } catch {
    Alert.alert(
      "Unable to open deletion page",
      "Visit adaptivestrengthcoach.com/delete-account/ in your browser or contact support@adaptivestrengthcoach.com.",
    );
  }
}
