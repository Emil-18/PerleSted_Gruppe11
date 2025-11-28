
import { ProfileSettingCard } from "../../components/profile/ProfileSettingCard";
import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";

import image from "../../assets/beluga.png";
import PostCard from "../../components/profile/PostCard";
import { styles } from "../styles";

import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import { auth, db } from "../../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface ProfileProps {
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

const Profile = ({ posts = postsDummy }: ProfileProps) => {
    const user = auth.currentUser;
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                const userDoc = doc(db, "users", user.uid);
                const userData = await getDoc(userDoc);

                if (userData.exists()) {
                    setProfileData(userData.data());
                } else {
                    alert("Kunne ikke hente bruker data");
                }
            } catch (error) {
                alert("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    
    if (!user) {
        return (
            <View>
                <Text>Du er ikke logget inn.</Text>
            </View>
        );
    }

    
    if (loading || !profileData) {
        return (
            <View>
                <Text>Laster profil...</Text>
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={styles.profileContainer}>
                <View style={styles.profileHeaderContainer}>
                    <Image
                        source={profileData.imageUrl ? { uri: profileData.imageUrl } : image}
                        style={styles.profileImage}
                    />
                    <Text style={styles.profileHeaderText}>
                        {profileData.username || user.displayName}
                    </Text>

                    <Text style={styles.profileHeaderText}>
                        {profileData.verified ? "Verifisert medlem" : "Uverifisert medlem"}
                    </Text>
                </View>

                <View style={styles.profileContainerMiddle}>
                    <ProfileSettingCard
                        setting="Telefonnummer"
                        settingInfo={profileData.phoneNumber}
                    />

                    <ProfileSettingCard setting="E-post" settingInfo={user.email} />

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
