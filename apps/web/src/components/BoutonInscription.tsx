import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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
      const { data } = await supabase
        .from("inscriptions")
        .select("id")
        .eq("evenement_id", evenementId)
        .eq("utilisateur_id", session.user.id);

      setInscrit(!!(data && data.length > 0));
      setChargement(false);
    };
    verifier();
  }, [evenementId, session]);

  const sInscrire = async () => {
    const { error } = await supabase.from("inscriptions").insert({
      evenement_id: evenementId,
      utilisateur_id: session.user.id,
    });
    if (!error) setInscrit(true);
  };

  const seDesinscrire = async () => {
    const { error } = await supabase
      .from("inscriptions")
      .delete()
      .eq("evenement_id", evenementId)
      .eq("utilisateur_id", session.user.id);
    if (!error) setInscrit(false);
  };

  if (!session) {
    return <p className={styles.info}>Connectez-vous pour vous inscrire.</p>;
  }

  if (chargement) {
    return <p className={styles.info}>...</p>;
  }

  return inscrit ? (
    <button onClick={seDesinscrire} className={styles.desinscrire}>
      Se desinscrire
    </button>
  ) : (
    <button onClick={sInscrire} className={styles.inscrire}>
      S'inscrire
    </button>
  );
};

export default BoutonInscription;