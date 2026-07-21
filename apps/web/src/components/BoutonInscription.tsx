import { useState, useEffect } from "react";
import { estInscrit, inscrire, desinscrire } from "@senevent/shared";
import styles from "./BoutonInscription.module.css";

const BoutonInscription = ({ evenementId, session }: { evenementId: number; session: any }) => {
  const [inscrit, setInscrit] = useState(false);
  const [chargement, setChargement] = useState(true);

  // Verifier si deja inscrit au montage
  useEffect(() => {
    const verifier = async () => {
      if (!session) {
        setChargement(false);
        return;
      }
      const dejaInscrit = await estInscrit(evenementId, session.user.id);
      setInscrit(dejaInscrit);
      setChargement(false);
    };
    verifier();
  }, [evenementId, session]);

  const gererInscription = async () => {
    try {
      await inscrire(evenementId, session.user.id);
      setInscrit(true);
    } catch (e) {
      // on pourrait afficher une erreur ici si besoin
    }
  };

  const gererDesinscription = async () => {
    try {
      await desinscrire(evenementId, session.user.id);
      setInscrit(false);
    } catch (e) {
      // on pourrait afficher une erreur ici si besoin
    }
  };

  if (!session) {
    return <p className={styles.info}>Connectez-vous pour vous inscrire.</p>;
  }

  if (chargement) {
    return <p className={styles.info}>...</p>;
  }

  return inscrit ? (
    <button onClick={gererDesinscription} className={styles.desinscrire}>
      Se desinscrire
    </button>
  ) : (
    <button onClick={gererInscription} className={styles.inscrire}>
      S'inscrire
    </button>
  );
};

export default BoutonInscription;