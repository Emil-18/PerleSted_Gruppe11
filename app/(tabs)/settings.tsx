import { Image } from "expo-image";
import { Switch, Text, TextInput, View } from "react-native";

import { SettingCard } from "../../components/settings/SettingCard";

import image from "../../assets/beluga.png";
import Button from "../../components/Button";
import { styles } from "../styles";
import { auth } from "../../FirebaseConfig";
import { useState } from "react";

interface ProfileHeaderProps {
  imageUrl?: string;
  username: string;
  verified: boolean;
  email: string;
  phoneNumber: string;
  notifications: boolean;
  password?: string;
}

const dummyProfileData = {
  imageUrl: image,
  username: auth.currentUser?.displayName,
  verified: auth.currentUser?.emailVerified,
  phoneNumber: "12345678",
  email: auth.currentUser?.email,
  notifications: true,
  password: "hashedpassword",
};

const Settings = ({
  imageUrl,
  username = dummyProfileData.username,
  verified = dummyProfileData.verified,
  emailFake = dummyProfileData.email,
  passwordFake = dummyProfileData.password,
  phoneNumberFake = dummyProfileData.phoneNumber,
  notificationsFake = dummyProfileData.notifications,
}: ProfileHeaderProps) => {
    const [ email, setEmail ] = useState(auth.currentUser?.email);
    const [userName, setUserName] = useState(auth.currentUser?.displayName);
    const [password, setPassword] = useState("********");
    const [confirmPassword, setConfirmPassword] = useState("********");
    const [phone, setPhone] = useState(auth.currentUser?.phoneNumber);
    const [userNotifications, setUserNotifications] = useState(false);
    const toggleSwitch = function (value) {
        setUserNotifications(!userNotifications);
        
    }
  return (
    <View style={styles.settingsContainer}>
      <Image
        source={imageUrl ? { uri: imageUrl } : image}
        style={styles.profileImage}
      />
      <Button
        text="Endre bilde"
        path="./profile"
        buttonStyle={styles.settingsBigButton}
        buttonTextStyle={styles.text}
      />
          <SettingCard
              setting="Brukernavn"
              settingInfo={auth.currentUser?.displayName}
              btnText="Endre"
              settingComponent=<TextInput onChangeText={setUserName}></TextInput>
      />
          <SettingCard setting="Passord" settingInfo="********" btnText="Endre" settingComponent=<TextInput onChangeText={ setPassword} secureTextEntry></TextInput>/>
      <SettingCard setting="E-post" settingInfo={auth.currentUser?.email} btnText="Endre" settingComponent = <TextInput keyboardType = "email-address" onChangeText = {setEmail}></TextInput>/>
      <SettingCard
        setting="Telefonnummer"
        settingInfo={auth.currentUser?.phoneNumber}
        btnText="Endre"
        settingComponent = <TextInput keyboardType = "number-pad" onChangeText = {setPhone}></TextInput>
      />
      <SettingCard
        setting="Varsler"
        settingInfo= " "
        btnText="Endre"
              settingComponent=<Switch onValueChange={ setUserNotifications} value = {userNotifications}></Switch>
      />
      <Text> </Text>
      <Button
        text="Logg ut"
        path=".././"
        buttonStyle={styles.settingsBigButton}
        buttonTextStyle={styles.text}
      />
    </View>
  );
};

export default Settings;
