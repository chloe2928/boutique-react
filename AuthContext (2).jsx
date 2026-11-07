import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Au démarrage : on restaure la session sauvegardée (si elle existe)
  useEffect(() => {
    const sauvegarde = localStorage.getItem("utilisateur");
    if (sauvegarde) {
      setUtilisateur(JSON.parse(sauvegarde));
    }
    setChargement(false);
  }, []);

  // La connexion interroge le BACKEND (route POST /api/connexion), là où
  // l'inscription enregistre les comptes. Le back répond { id, prenom, role, token? }.
  // Retourne la session si OK, sinon null.
  const connecter = useCallback(async (email, motDePasse) => {
    try {
      const res = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: motDePasse }),
      });
      if (!res.ok) return null;

      const data = await res.json();
      const session = {
        email,
        nom: data.prenom,
        role: data.role,
        token: data.token ?? null, // seulement pour l'admin
      };

      setUtilisateur(session);
      localStorage.setItem("utilisateur", JSON.stringify(session));
      return session;
    } catch {
      return null;
    }
  }, []);

  const deconnecter = useCallback(() => {
    setUtilisateur(null);
    localStorage.removeItem("utilisateur");
  }, []);

  // La valeur du contexte n'est recalculée que si l'un de ces éléments change
  const value = useMemo(
    () => ({
      utilisateur,
      estConnecte: utilisateur !== null,
      estAdmin: utilisateur?.role === "admin",
      chargement,
      connecter,
      deconnecter,
    }),
    [utilisateur, chargement, connecter, deconnecter]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }
  return ctx;
}
