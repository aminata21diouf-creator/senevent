import {
  createContext, useContext, useState, useEffect,
} from "react";
import { getSupabase } from "@senevent/shared";

// Le contexte : valeur par defaut avant tout chargement
const AuthContext = createContext({ session: null, chargement: true });

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    // Recuperer la session au demarrage
    getSupabase().auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChargement(false);
    });

    // Ecouter les changements (login, logout, refresh du token)
    const { data: sub } = getSupabase().auth.onAuthStateChange(
      (_event, nouvelleSession) => setSession(nouvelleSession)
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, chargement }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pratique pour lire la session depuis n'importe quel ecran
export function useAuth() {
  return useContext(AuthContext);
}
