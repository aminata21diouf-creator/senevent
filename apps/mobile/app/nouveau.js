import { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { creerEvenement } from "@senevent/shared";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["concert", "expo", "conference", "atelier", "soutenance"];

export default function Nouveau() {
  const { session } = useAuth();
  const router = useRouter();
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("concert");
  const [lieu, setLieu] = useState("");
  const [prix, setPrix] = useState("");
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false);

  const soumettre = async () => {
    setErreur(null);

    if (titre.trim().length < 3) {
      setErreur("Le titre doit faire au moins 3 caracteres.");
      return;
    }
    if (!session) {
      setErreur("Vous devez etre connecte.");
      return;
    }

    setEnCours(true);
    try {
      await creerEvenement({
        titre: titre.trim(),
        categorie,
        lieu_nom: lieu.trim(),
        date_debut: new Date().toISOString(),
        prix: Number(prix) || 0,
        organisateur_id: session.user.id,
      });
      router.back(); // retour a la liste
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.label}>Titre</Text>
        <TextInput
          style={styles.input}
          value={titre}
          onChangeText={setTitre}
        />

        <Text style={styles.label}>Categorie</Text>
        <View style={styles.categories}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip,
                categorie === c && styles.chipActif]}
              onPress={() => setCategorie(c)}
            >
              <Text style={categorie === c
                ? styles.chipTexteActif : styles.chipTexte}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Lieu</Text>
        <TextInput
          style={styles.input}
          value={lieu}
          onChangeText={setLieu}
        />

        <Text style={styles.label}>Prix (FCFA, 0 = gratuit)</Text>
        <TextInput
          style={styles.input}
          value={prix}
          onChangeText={setPrix}
          keyboardType="numeric"
        />

        {erreur && <Text style={styles.erreur}>{erreur}</Text>}

        <Pressable
          style={styles.bouton}
          onPress={soumettre}
          disabled={enCours}
        >
          <Text style={styles.boutonTexte}>
            {enCours ? "Envoi..." : "Ajouter l'evenement"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contenu: { padding: 16 },
  label: {
    fontSize: 14, fontWeight: "600", color: "#1a3a5c",
    marginTop: 12, marginBottom: 4,
  },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 12, fontSize: 16,
  },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  chipActif: { backgroundColor: "#1a3a5c", borderColor: "#1a3a5c" },
  chipTexte: { color: "#444", fontSize: 13 },
  chipTexteActif: { color: "#fff", fontSize: 13 },
  bouton: {
    backgroundColor: "#1a3a5c", padding: 14, borderRadius: 8,
    alignItems: "center", marginTop: 24,
  },
  boutonTexte: { color: "#fff", fontSize: 16, fontWeight: "600" },
  erreur: { color: "#a01a1a", marginTop: 12 },
});
