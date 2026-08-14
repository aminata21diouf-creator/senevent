import { useState, useEffect } from "react";
import {
  View, Text, Image, StyleSheet, ScrollView, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getEvenements } from "@senevent/shared";

export default function Detail() {
  const { id } = useLocalSearchParams();
  const [evenement, setEvenement] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      const tous = await getEvenements();
      const trouve = tous.find((ev) => ev.id === Number(id));
      setEvenement(trouve ?? null);
      setChargement(false);
    };
    charger();
  }, [id]);

  if (chargement) {
    return (
      <ActivityIndicator size="large" color="#1a3a5c"
        style={styles.centre} />
    );
  }

  if (!evenement) {
    return <Text style={styles.centre}>Evenement introuvable.</Text>;
  }

  const prix = evenement.prix === 0
    ? "Gratuit"
    : `${evenement.prix} FCFA`;
  const date = new Date(evenement.date_debut).toLocaleString("fr-FR");

  return (
    <ScrollView style={styles.container}>
      {evenement.image_url && (
        <Image source={{ uri: evenement.image_url }} style={styles.image} />
      )}
      <View style={styles.contenu}>
        <Text style={styles.titre}>{evenement.titre}</Text>
        <Text style={styles.categorie}>{evenement.categorie}</Text>
        <View style={styles.ligne}>
          <Text style={styles.label}>Lieu</Text>
          <Text style={styles.valeur}>{evenement.lieu_nom}</Text>
        </View>
        <View style={styles.ligne}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.valeur}>{date}</Text>
        </View>
        <View style={styles.ligne}>
          <Text style={styles.label}>Prix</Text>
          <Text style={styles.prix}>{prix}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 200 },
  contenu: { padding: 16 },
  titre: { fontSize: 22, fontWeight: "bold", color: "#1a3a5c" },
  categorie: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#ea7d2b",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    textTransform: "uppercase",
    marginTop: 8,
  },
  ligne: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  label: { fontSize: 14, color: "#888" },
  valeur: { fontSize: 14, color: "#1a3a5c", fontWeight: "600" },
  prix: { fontSize: 16, color: "#ea7d2b", fontWeight: "bold" },
  centre: { textAlign: "center", marginTop: 40 },
});
