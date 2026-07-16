import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./NouvelEvenement.module.css";

const NouvelEvenement = ({ onAjoutReussi }: { onAjoutReussi: () => void }) => {
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("concert");
  const [lieu, setLieu] = useState("");
  const [prix, setPrix] = useState(0);
  const [dateDebut, setDateDebut] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreurs, setErreurs] = useState<any>({});
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
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
    if (!dateDebut) {
      e.dateDebut = "La date de l'evenement est requise.";
    }
    return e;
  };

  const soumettre = async (event: React.FormEvent) => {
    event.preventDefault();
    setErreurServeur(null);

    const erreursTrouvees = valider();
    if (Object.keys(erreursTrouvees).length > 0) {
      setErreurs(erreursTrouvees);
      return;
    }

    setEnCours(true);

    // Recuperer l'utilisateur connecte
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErreurServeur("Vous devez etre connecte.");
      setEnCours(false);
      return;
    }

    // Upload de l'image si un fichier a ete choisi
    let image_url: string | null = null;
    if (fichier) {
      const chemin = `${user.id}/${Date.now()}_${fichier.name}`;
      const { error: eUp } = await supabase.storage
        .from("affiches")
        .upload(chemin, fichier);

      if (eUp) {
        setErreurServeur(eUp.message);
        setEnCours(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("affiches")
        .getPublicUrl(chemin);

      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("evenements").insert({
      titre: titre.trim(),
      categorie,
      lieu_nom: lieu.trim(),
      prix: Number(prix),
      date_debut: new Date(dateDebut).toISOString(),
      organisateur_id: user.id,
      ...(image_url ? { image_url } : {}),
    });

    setEnCours(false);

    if (error) {
      setErreurServeur(error.message);
    } else {
      onAjoutReussi();
      navigate("/");
    }
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
        Date et heure de l'evenement
        <input
          type="datetime-local"
          value={dateDebut}
          onChange={e => setDateDebut(e.target.value)}
        />
        {erreurs.dateDebut && <span className={styles.erreur}>{erreurs.dateDebut}</span>}
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

      <label className={styles.champ}>
        Affiche (image, optionnel)
        <input
          type="file"
          accept="image/*"
          onChange={e => setFichier(e.target.files ? e.target.files[0] : null)}
        />
      </label>

      {erreurServeur && (
        <p className={styles.erreur}>Erreur : {erreurServeur}</p>
      )}

      <button type="submit" disabled={enCours} className={styles.bouton}>
        {enCours ? "Envoi..." : "Ajouter"}
      </button>
    </form>
  );
};

export default NouvelEvenement;