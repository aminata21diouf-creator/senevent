import { useState } from "react";
import EvenementCarte from "./components/EvenementCarte";
import styles from "./App.module.css";

const App = () => {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [recherche, setRecherche] = useState("");

  const charger = async () => {
    setChargement(true);
    try {
      const reponse = await fetch("/evenements.json");
      const data = await reponse.json();
      setEvenements(data);
    } catch (error) {
      console.error("Erreur :", error);
    }
    setChargement(false);
  };

  const evenementsFiltres = evenements.filter(ev =>
    ev.titre.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.titre}>SenEvent --- Evenements a Dakar</h1>
      <button className={styles.bouton} onClick={charger} disabled={chargement}>
        {chargement ? "Chargement..." : "Charger les evenements"}
      </button>
      <input
        type="text"
        placeholder="Rechercher un evenement..."
        value={recherche}
        onChange={e => setRecherche(e.target.value)}
        style={{ display: "block", width: "100%", padding: "0.6rem 1rem",
          marginTop: "1rem", fontSize: "1rem", border: "1px solid #ccc",
          borderRadius: "6px", boxSizing: "border-box" }}
      />
      <p className={styles.compteur}>
        {evenementsFiltres.length} evenement(s) trouve(s)
      </p>
      {evenementsFiltres.map(ev => (
        <EvenementCarte key={ev.id} ev={ev} afficherDetails={true} />
      ))}
    </div>
  );
};

export default App;