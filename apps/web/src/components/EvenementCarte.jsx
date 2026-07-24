import { Link } from "react-router-dom";
import styles from "./EvenementCarte.module.css";

const EvenementCarte = ({ ev, afficherDetails }) => {
  const prix = ev.prix === 0 ? "Gratuit" : `${ev.prix} FCFA`;
  return (
    <Link to={`/evenement/${ev.id}`} className={styles.lien}>
      <div className={styles.carte}>
        <div className={styles.corps}>
          <span className={styles.badge}>{ev.categorie}</span>
          <h3 className={styles.titre}>{ev.titre}</h3>
          {afficherDetails && (
            <p className={styles.info}>Lieu : {ev.lieu_nom}</p>
          )}
        </div>
        <div className={styles.perforation}></div>
        <div className={styles.stub}>
          <p className={styles.prix}>{prix}</p>
        </div>
      </div>
    </Link>
  );
};

export default EvenementCarte;
