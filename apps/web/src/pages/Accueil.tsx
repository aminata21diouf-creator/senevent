import { useState, useEffect } from "react";
import EvenementCarte from "../components/EvenementCarte";
import SearchBar from "../components/SearchBar";
import EtatChargement from "../components/EtatChargement";
import styles from "./Accueil.module.css";

const Accueil = ({ evenements, chargement, erreur, onReessayer }: {
  evenements: any[];
  chargement: boolean;
  erreur: string | null;
  onReessayer: () => void;
}) => {
  const [recherche, setRecherche] = useState("");

  const evenementsFiltres = evenements.filter(ev =>
    ev.titre.toLowerCase().includes(recherche.toLowerCase())
  );

  useEffect(() => {
    document.title = evenementsFiltres.length > 0
      ? `(${evenementsFiltres.length}) SenEvent`
      : "SenEvent";
  }, [evenementsFiltres.length]);

  return (
    <div className={styles.container}>
      <h1 className={styles.titre}>SenEvent — Événements à Dakar</h1>
      <EtatChargement
        chargement={chargement}
        erreur={erreur}
        onReessayer={onReessayer}
      />
      {!chargement && !erreur && (
        <>
          <SearchBar recherche={recherche} onRecherche={setRecherche} />
          <p className={styles.compteur}>
            {evenementsFiltres.length} événement(s) trouvé(s)
          </p>
          {evenementsFiltres.length === 0 ? (
            <p className={styles.messageVide}>Aucun événement ne correspond.</p>
          ) : (
            evenementsFiltres.map(ev => (
              <EvenementCarte key={ev.id} ev={ev} afficherDetails={true} />
            ))
          )}
        </>
      )}
    </div>
  );
};

export default Accueil;