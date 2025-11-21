import { ProfileSettingCard } from "../../components/profile/ProfileSettingCard";

import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";

import image from "../../assets/beluga.png";
import PostCard from "../../components/profile/PostCard";
import { styles } from "../styles";

import React from "react";
import Button from "../../components/Button";
import { auth } from "../../FirebaseConfig";

interface ProfileProps {
  imageUrl?: string;
  username?: string;
  verified?: boolean;
  phoneNumber?: string;
  email?: string;
  posts?: Post[];
}

interface Post {
  title: string;
  imageUrl?: string;
  id: string;
}

const postsDummy = [
  { title: "Post 1", id: "1" },
  { title: "Post 2", id: "2" },
  { title: "Post 3", id: "3" },
  { title: "Post 4", id: "4" },
  { title: "Post 5", id: "5" },
  { title: "Post 6", id: "6" },
  { title: "Post 7", id: "7" },
  { title: "Post 8", id: "8" },
  { title: "Post 9", id: "9" },
  { title: "Post 10", id: "10" },
];

const dummyProfileData = {
  imageUrl: image,
  username: "Katt",
  verified: true,
  phoneNumber: "12345678",
  email: "katt@example.com",
};

const Profile = ({
  imageUrl = dummyProfileData.imageUrl,
  username = dummyProfileData.username,
  verified = dummyProfileData.verified,
  phoneNumber = dummyProfileData.phoneNumber,
  email = dummyProfileData.email,
  posts = postsDummy,
}: ProfileProps) => {
  return (
    <ScrollView>
      <View style={styles.profileContainer}>
        <View style={styles.profileHeaderContainer}>
          <Image
            source={typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl}
            style={styles.profileImage}
          />
          <Text style={styles.profileHeaderText}>{auth.currentUser?.displayName}</Text>
          <Text style={styles.profileHeaderText}>
            {verified ? "Verifisert medlem" : "Uverifisert medlem"}
          </Text>
        </View>
        <View style={styles.profileContainerMiddle}>
          <ProfileSettingCard
            setting="Telefonnummer"
            settingInfo={auth.currentUser?.phoneNumber}
          />
          <ProfileSettingCard setting="E-post" settingInfo={auth.currentUser?.email} />
          <Button
            text="Endre instillinger"
            path="./settings"
            buttonStyle={styles.profileButton}
            buttonTextStyle={styles.profileText}
          />
        </View>
        <View style={styles.profileContainerMiddle}>
          <Text>Mine innlegg</Text>
          <View style={styles.profilePostsView}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                imageUrl={post.imageUrl}
                id={post.id}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;
