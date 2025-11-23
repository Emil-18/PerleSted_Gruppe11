import { router } from "expo-router";
import { Text, View } from "react-native";
import { styles } from "../../app/styles";
import Button from "../Button";

interface SettingCardProps {
  setting: string;
  settingInfo?: string;
  btnText: string;
  path?: Parameters<typeof router.push>[0];
}

export const SettingCard = ({
  setting,
  settingInfo,
  btnText,
  settingComponent,
  // route = "changesetting",
  path = "/usersettings",
}: SettingCardProps) => {
  return (
    <View style={styles.settingsCardContainer}>
      <View style={styles.settingsTextContainer}>
        <Text style={styles.textBold}>{setting + ": "}</Text>
        <Text style={styles.text}>{settingInfo ? settingInfo : "ERROR"}</Text>
        {settingComponent}
      </View>
    </View>
  );
};
