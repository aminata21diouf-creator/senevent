import { useParams, useNavigate, Link } from "react-router-dom";
import { supprimerEvenement } from "@senevent/shared";
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
    try {
      await supprimerEvenement(evenement.id);
      navigate("/");
    } catch (e: any) {
      alert("Erreur : " + e.message);
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.retour}>
        &lt;- Retour
      </button>

      <div className={styles.ticket}>
        {evenement.image_url && (
          <img
            src={evenement.image_url}
            alt={evenement.titre}
            className={styles.image}
          />
        )}

        <div className={styles.corps}>
          <span className={styles.categorie}>{evenement.categorie}</span>
          <h1 className={styles.titre}>{evenement.titre}</h1>

          <dl className={styles.infos}>
            <dt>Lieu</dt><dd>{evenement.lieu_nom}</dd>
            <dt>Date</dt><dd>{date}</dd>
            <dt>Organise par</dt>
            <dd>{evenement.profiles ? evenement.profiles.nom : "Equipe SenEvent"}</dd>
          </dl>
        </div>

        <div className={styles.perforation}></div>

        <div className={styles.stub}>
          <div>
            <span className={styles.stubLabel}>Prix</span>
            <p className={styles.prix}>{prix}</p>
          </div>
          <BoutonInscription evenementId={evenement.id} session={session} />
        </div>
      </div>

      {session && session.user.id === evenement.organisateur_id && (
        <button onClick={supprimer} className={styles.supprimer}>
          Supprimer cet evenement
        </button>
      )}
    </div>
  );
};

export default Detail;
