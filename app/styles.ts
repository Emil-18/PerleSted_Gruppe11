import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
  },
  headerIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  // Tabs layout
  tabsLayoutContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Profile
  profileButton: {
    backgroundColor: "transparent",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0e8",
  },
  profileText: {
    fontSize: 16,
  },
  profileHeaderText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  profileContainerMiddle: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  profileContainer: {
    flex: 1,
    paddingBottom: 30,
    paddingTop: 20,
    gap: 45,
    width: "90%",
    alignItems: "center",
    alignSelf: "center",
  },
  profileHeaderContainer: {
    alignItems: "center",
  },
  profileSettingCardContainer: {
    flexDirection: "row",
    width: "100%",
  },
  profileImage: {
    width: 90,
    height: 90,
    borderWidth: 4,
    borderRadius: 90,
    borderColor: "#E1F8D7",
  },
  profilePostsView: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },

  // Pearl
  pearlTitle: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 8,
  },
  PearlCard: {
    width: "100%",
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  PearlImageWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
  PearlImage: {
    width: "100%",
    height: 180,
  },

  // Auth
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  authTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333333",
  },
  authInput: {
    width: "90%",
    height: 50,
    borderColor: "#DDDDDD",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
  },
  authButton: {
    backgroundColor: "#E1F8D7",
    paddingVertical: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  authLink: {
    marginTop: 20,
  },

  // new place detail form
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  formTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333333",
    textAlign: "center",
  },
  formInput: {
    width: "100%",
    height: 50,
    borderColor: "#DDDDDD",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
    color: "#000000",
  },
  formButton: {
    backgroundColor: "#E1F8D7",
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  formButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
});

export const appStyles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontWeight: "600",
    marginBottom: 6,
  },
});

export const inputStyle = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: "white",
} as const;
