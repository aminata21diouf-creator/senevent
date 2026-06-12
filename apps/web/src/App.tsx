import { useState, useEffect } from "react";
import EvenementCarte from "./components/EvenementCarte";
import SearchBar from "./components/SearchBar";
import styles from "./App.module.css";

const App = () => {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true); // true dès le départ
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    const charger = async () => {
      try {
        const reponse = await fetch("/evenements.json");
        const data = await reponse.json();
        setEvenements(data);
      } catch (error) {
        console.error("Erreur :", error);
      }
      setChargement(false);
    };
    charger();
  }, []); // [] = une seule fois au montage

  const evenementsFiltres = evenements.filter((ev: any) =>
    ev.titre.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.titre}>SenEvent — Événements à Dakar</h1>
      {chargement && (
        <p className={styles.message}>Chargement des événements...</p>
      )}
      {!chargement && (
        <>
          <SearchBar recherche={recherche} onRecherche={setRecherche} />
          <p className={styles.compteur}>
            {evenementsFiltres.length} événement(s) trouvé(s)
          </p>
          {evenementsFiltres.map((ev: any) => (
            <EvenementCarte key={ev.id} ev={ev} afficherDetails={true} />
          ))}
        </>
      )}
    </div>
  );
};

export default App;