import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useAuth } from "../../context/AuthContext";

// Bouton "+" affiche seulement si l'utilisateur est connecte
function BoutonAjouter() {
  const { session } = useAuth();
  const router = useRouter();

  if (!session) return null;

  return (
    <Pressable
      onPress={() => router.push("/nouveau")}
      style={{ marginRight: 16 }}
    >
      <Ionicons name="add-circle" size={28} color="#fff" />
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#1a3a5c" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#ea7d2b",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Evenements",
          headerRight: () => <BoutonAjouter />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
