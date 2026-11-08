// Composant SearchBar - realise par Bibou Diagne
import styles from "./SearchBar.module.css";

type Props = {
  recherche: string;
  onRecherche: (valeur: string) => void;
};

const SearchBar = ({ recherche, onRecherche }: Props) => {
  return (
    <div className={styles.conteneur}>
      <input
        className={styles.input}
        type="text"
        placeholder="Rechercher un evenement..."
        value={recherche}
        onChange={e => onRecherche(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;