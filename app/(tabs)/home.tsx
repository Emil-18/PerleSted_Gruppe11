import Button from "@/components/Button";
import React from "react";
import { View } from "react-native";
import { styles } from "../styles";
import Feed from "./feedSide/feed";

interface Pearl {
  id: string;
  title: string;
}

const placeHolderPearls = [
  { id: "1", title: "pearl1" },
  { id: "2", title: "pearl2" },
];

const home = () => {
  return (
    <View>
      <Button
        text="Min profil"
        path="/profile"
        buttonStyle={styles.profileButton}
        buttonTextStyle={styles.profileText}
      />
      <Button
        text="Innstillinger"
        path="/settings"
        buttonStyle={styles.profileButton}
        buttonTextStyle={styles.profileText}
          />
      <Feed></Feed>
    </View>
  );
};

export default home;