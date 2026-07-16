import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Accueil from "./pages/Accueil";
import NouvelEvenement from "./pages/NouvelEvenement";
import Detail from "./pages/Detail";
import Auth from "./pages/Auth";
import NavBar from "./components/NavBar";

const App = () => {
  const [evenements, setEvenements] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Recuperer la session actuelle au montage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Ecouter tout changement de session
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  const charger = async () => {
    setChargement(true);
    setErreur(null);

    const { data, error } = await supabase
      .from("evenements")
      .select("*")
      .order("date_debut", { ascending: true });

    if (error) {
      setErreur(error.message);
    } else {
      setEvenements(data);
    }

    setChargement(false);
  };

  useEffect(() => {
    charger();
  }, []);

  return (
    <BrowserRouter>
      <NavBar session={session} />
      <Routes>
        <Route
          path="/"
          element={
            <Accueil
              evenements={evenements}
              chargement={chargement}
              erreur={erreur}
              onReessayer={charger}
            />
          }
        />
        <Route
          path="/nouveau"
          element={<NouvelEvenement onAjoutReussi={charger} />}
        />
        <Route
          path="/evenement/:id"
          element={<Detail evenements={evenements} />}
        />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;