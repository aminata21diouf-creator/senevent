import { NavLink } from "react-router-dom";
import { seDeconnecter } from "@senevent/shared";
import styles from "./NavBar.module.css";

const NavBar = ({ session }: { session: any }) => {
  const lienActif = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.lien} ${styles.lienActif}` : styles.lien;

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>SenEvent</div>
      <div className={styles.liens}>
        <NavLink to="/" end className={lienActif}>Accueil</NavLink>
        {session && (
          <NavLink to="/nouveau" className={lienActif}>Nouvel événement</NavLink>
        )}
        {session ? (
          <>
            <span className={styles.email}>{session.user.email}</span>
            <button onClick={() => seDeconnecter()} className={styles.deconnexion}>
              Se deconnecter
            </button>
          </>
        ) : (
          <NavLink to="/auth" className={lienActif}>Se connecter</NavLink>
        )}
      </div>
    </nav>
  );
};

export default NavBar;