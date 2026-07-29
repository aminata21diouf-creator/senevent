import { useState, useEffect } from "react";
import {
  StyleSheet, Text, View, FlatList,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { initSupabase, getEvenements } from "@senevent/shared";
import EvenementCarte from "./components/EvenementCarte";

initSupabase(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

export default function App() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [rafraichissement, setRafraichissement] = useState(false);

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

  const rafraichir = async () => {
    setRafraichissement(true);
    try {
      const data = await getEvenements();
      setEvenements(data);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setRafraichissement(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.entete}>
        <Text style={styles.titre}>SenEvent</Text>
        <Text style={styles.sousTitre}>Événements à Dakar</Text>
      </View>

      {chargement && (
        <ActivityIndicator size="large" color="#1a3a5c"
          style={styles.centre} />
      )}

      {erreur && (
        <Text style={styles.erreur}>Erreur : {erreur}</Text>
      )}

      {!chargement && !erreur && (
        <FlatList
          data={evenements}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <EvenementCarte evenement={item} />}
          contentContainerStyle={styles.liste}
          refreshing={rafraichissement}
          onRefresh={rafraichir}
        />
      )}

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  entete: {
    padding: 16,
    backgroundColor: "#1a3a5c",
  },
  titre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  sousTitre: {
    fontSize: 14,
    color: "#a8c5e0",
    marginTop: 2,
  },
  liste: {
    paddingVertical: 8,
  },
  centre: {
    marginTop: 40,
  },
  erreur: {
    color: "#a01a1a",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 16,
  },
});
