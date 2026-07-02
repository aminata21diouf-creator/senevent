import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";

const NavBar = () => {
  const lienActif = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.lien} ${styles.lienActif}` : styles.lien;

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>SenEvent</div>
      <div className={styles.liens}>
        <NavLink to="/" end className={lienActif}>
          Accueil
        </NavLink>
        <NavLink to="/nouveau" className={lienActif}>
          Nouvel événement
        </NavLink>
      </div>
    </nav>
  );
};

export default NavBar;