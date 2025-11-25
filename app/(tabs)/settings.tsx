import { Image } from "expo-image";
import { Pressable, Switch, Text, TextInput, View } from "react-native";

import { SettingCard } from "../../components/settings/SettingCard";

import image from "../../assets/beluga.png";
import Button from "../../components/Button";
import { styles } from "../styles";
import { auth, db } from "../../FirebaseConfig";
import { useState } from "react";
import { updateCurrentUser, updatePassword, updateProfile } from "firebase/auth";
import { doc, getDoc, runTransaction } from "firebase/firestore";

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
    const [ email, setEmail ] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [userNotifications, setUserNotifications] = useState(true);
    const onSave = function () {
        //let infoToUpdate = {};
        //const unameRef = doc(db, "usernames", userName);
        //const unameSnap = getDoc(unameRef);
        
        //if (unameSnap.exists()) {
            //alert("Epost addressenn er allerede tatt.");
            //return;
        //}
        if (userName && (userName?.length < 3 || userName.length > 20)) {
            alert("Brukernavnet må vere mellom 3 og 20 tegn");
            return;
        }
        infoToUpdate["displayName"] = userName ? userName : auth.currentUser?.displayName;
        if (email && !(email?.includes("@") && email.includes("."))) {
            alert("E-post addressen er ugyldig, "+email);
            return;
        }
        infoToUpdate["email"] = email ? email : auth.currentUser?.email;
        if (password && password != confirmPassword) {
            alert("Passordene er ikke like");
            return;
        }
        if (password && password.length <= 3) {
            alert("Passordet må vere lengere en tre tegn");
            return;
        }
        if (phone && !(phone.match("^[0-9]{8}$"))) {
            alert("Ugyldig telefon nummer");
            return;
        }
        infoToUpdate["phoneNumber"] = phone ? phone : auth.currentUser?.phoneNumber
        updateProfile(auth.currentUser, infoToUpdate);
        if (password) {
            updatePassword(auth.currentUser, password);
        }
        //auth.currentUser.phoneNumber = phone;
        //auth.currentUser.displayName = userName;
        //auth.currentUser.notifications = userNotifications;
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
          <SettingCard setting="Passord" settingInfo="********" btnText="Endre" settingComponent=<TextInput onChangeText={setPassword} secureTextEntry></TextInput>/>
          <SettingCard setting = "gjenta passord" settingInfo = "********" btnText = "" settingComponent = <TextInput secureTextEntry onChangeText = {setConfirmPassword} value = {confirmPassword}></TextInput>/>
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
          <Pressable onPress={ onSave} accessibilityRole = "button"><Text>lagre</Text></Pressable>
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
