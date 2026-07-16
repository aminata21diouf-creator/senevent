import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BoutonInscription from "../components/BoutonInscription";
import styles from "./Detail.module.css";

const Detail = ({ evenements, session }: { evenements: any[]; session: any }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const evenement = evenements.find(ev => ev.id === Number(id));

  if (!evenement) {
    return (
      <div className={styles.container}>
        <p>Evenement introuvable.</p>
        <Link to="/" className={styles.retour}>Retour a la liste</Link>
      </div>
    );
  }

  const prix = evenement.prix === 0 ? "Gratuit" : `${evenement.prix} FCFA`;
  const date = new Date(evenement.date_debut).toLocaleString("fr-FR");

  const supprimer = async () => {
    const confirme = window.confirm("Supprimer cet evenement ?");
    if (!confirme) return;

    const { error } = await supabase
      .from("evenements")
      .delete()
      .eq("id", evenement.id);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.retour}>
        &lt;- Retour
      </button>
      <h1 className={styles.titre}>{evenement.titre}</h1>
      <p className={styles.meta}>
        <span className={styles.categorie}>{evenement.categorie}</span>
      </p>
      <img
        src={evenement.image_url}
        alt={evenement.titre}
        className={styles.image}
      />
      <dl className={styles.infos}>
        <dt>Lieu</dt><dd>{evenement.lieu_nom}</dd>
        <dt>Date</dt><dd>{date}</dd>
        <dt>Prix</dt><dd className={styles.prix}>{prix}</dd>
      </dl>
      <BoutonInscription evenementId={evenement.id} session={session} />
      {session && session.user.id === evenement.organisateur_id && (
        <button onClick={supprimer} className={styles.supprimer}>
          Supprimer cet evenement
        </button>
      )}
    </div>
  );
};

export default Detail;