import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NouvelEvenement.module.css";

const NouvelEvenement = ({ onAjouter }: { onAjouter: (ev: any) => void }) => {
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("concert");
  const [lieu, setLieu] = useState("");
  const [prix, setPrix] = useState(0);
  const [erreurs, setErreurs] = useState<any>({});
  const navigate = useNavigate();

  const valider = () => {
    const e: any = {};
    if (titre.trim().length < 3) {
      e.titre = "Le titre doit contenir au moins 3 caracteres.";
    }
    if (lieu.trim().length < 2) {
      e.lieu = "Le lieu est requis.";
    }
    if (prix < 0) {
      e.prix = "Le prix ne peut pas etre negatif.";
    }
    return e;
  };

  const soumettre = (event: React.FormEvent) => {
    event.preventDefault();
    const erreursTrouvees = valider();
    if (Object.keys(erreursTrouvees).length > 0) {
      setErreurs(erreursTrouvees);
      return;
    }
    const nouvel = {
      id: Date.now(),
      titre: titre.trim(),
      categorie,
      lieu_nom: lieu.trim(),
      prix: Number(prix),
      date_debut: new Date().toISOString(),
      image_url: `https://placehold.co/400x250/1a3a5c/fff?text=${categorie}`,
    };
    onAjouter(nouvel);
    navigate("/"); // redirection vers l'accueil
  };

  return (
    <form className={styles.form} onSubmit={soumettre}>
      <h2>Ajouter un evenement</h2>

      <label className={styles.champ}>
        Titre
        <input
          type="text"
          value={titre}
          onChange={e => setTitre(e.target.value)}
        />
        {erreurs.titre && <span className={styles.erreur}>{erreurs.titre}</span>}
      </label>

      <label className={styles.champ}>
        Categorie
        <select value={categorie} onChange={e => setCategorie(e.target.value)}>
          <option value="concert">Concert</option>
          <option value="expo">Exposition</option>
          <option value="conference">Conference</option>
          <option value="atelier">Atelier</option>
          <option value="soutenance">Soutenance</option>
        </select>
      </label>

      <label className={styles.champ}>
        Lieu
        <input
          type="text"
          value={lieu}
          onChange={e => setLieu(e.target.value)}
        />
        {erreurs.lieu && <span className={styles.erreur}>{erreurs.lieu}</span>}
      </label>

      <label className={styles.champ}>
        Prix (FCFA, 0 pour gratuit)
        <input
          type="number"
          min="0"
          value={prix}
          onChange={e => setPrix(Number(e.target.value))}
        />
        {erreurs.prix && <span className={styles.erreur}>{erreurs.prix}</span>}
      </label>

      <button type="submit" className={styles.bouton}>
        Ajouter
      </button>
    </form>
  );
};

export default NouvelEvenement;