import { useState, useEffect } from "react";
import {
  StyleSheet, Text, View, FlatList, ActivityIndicator,
} from "react-native";
import { getEvenements } from "@senevent/shared";
import EvenementCarte from "../../components/EvenementCarte";

export default function Evenements() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const charger = async () => {
      try {
        const data = await getEvenements();
        setEvenements(data);
      } catch (e) {
        setErreur(e.message);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  if (chargement) {
    return (
      <ActivityIndicator size="large" color="#1a3a5c"
        style={styles.centre} />
    );
  }

  if (erreur) {
    return <Text style={styles.erreur}>Erreur : {erreur}</Text>;
  }

  return (
    <FlatList
      style={styles.liste}
      data={evenements}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <EvenementCarte evenement={item} />}
      contentContainerStyle={styles.contenu}
    />
  );
}

const styles = StyleSheet.create({
  liste: { backgroundColor: "#f0f4f8" },
  contenu: { paddingVertical: 8 },
  centre: { marginTop: 40 },
  erreur: {
    color: "#a01a1a",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 16,
  },
});
