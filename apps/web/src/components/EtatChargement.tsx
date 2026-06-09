// Composant EtatChargement
import styles from "./EtatChargement.module.css";

interface Props {
  chargement: boolean;
  erreur: string | null;
  onReessayer: () => void;
}

const EtatChargement = ({ chargement, erreur, onReessayer }: Props) => {
  if (chargement) {
    return (
      <p className={styles.message}>Chargement des événements...</p>
    );
  }

  if (erreur) {
    return (
      <div className={styles.erreur}>
        <p>Erreur : {erreur}</p>
        <button className={styles.bouton} onClick={onReessayer}>
          Réessayer
        </button>
      </div>
    );
  }

  return null;
};

export default EtatChargement;