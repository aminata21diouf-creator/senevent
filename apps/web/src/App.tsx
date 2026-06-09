import { useState, useEffect } from "react";
import EvenementCarte from "./components/EvenementCarte";
import SearchBar from "./components/SearchBar";
import EtatChargement from "./components/EtatChargement";
import styles from "./App.module.css";

const App = () => {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");

  const charger = async () => {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await fetch("/evenements.json");
      if (!reponse.ok) {
        throw new Error(`Erreur HTTP ${reponse.status}`);
      }
      const data = await reponse.json();
      setEvenements(data);
    } catch (e: any) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const evenementsFiltres = evenements.filter((ev: any) =>
    ev.titre.toLowerCase().includes(recherche.toLowerCase())
  );

  useEffect(() => {
    if (evenementsFiltres.length > 0) {
      document.title = `(${evenementsFiltres.length}) SenEvent`;
    } else {
      document.title = "SenEvent";
    }
  }, [evenementsFiltres.length]);

  return (
    <div className={styles.container}>
      <h1 className={styles.titre}>SenEvent — Événements à Dakar</h1>

      <EtatChargement
        chargement={chargement}
        erreur={erreur}
        onReessayer={charger}
      />

      {!chargement && !erreur && (
        <>
          <SearchBar recherche={recherche} onRecherche={setRecherche} />
          <p className={styles.compteur}>
            {evenementsFiltres.length} événement(s) trouvé(s)
          </p>
          {evenementsFiltres.length === 0 ? (
            <p className={styles.messageVide}>
              Aucun événement ne correspond.
            </p>
          ) : (
            evenementsFiltres.map((ev: any) => (
              <EvenementCarte key={ev.id} ev={ev} afficherDetails={true} />
            ))
          )}
        </>
      )}
    </div>
  );
};

export default App;