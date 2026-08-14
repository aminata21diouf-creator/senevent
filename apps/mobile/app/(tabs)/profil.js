import { View, Text, StyleSheet } from "react-native";

export default function Profil() {
  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Mon profil</Text>
      <Text style={styles.texte}>
        La connexion et l'inscription arriveront au Lab 10.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f0f4f8",
  },
  titre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a3a5c",
  },
  texte: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});
