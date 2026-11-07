import { useState, useRef, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";

export default function Login() {
  const { connecter, estConnecte, estAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // async : connecter() interroge maintenant le backend, on attend sa réponse
  const handleSubmit = async (e) => {
    e.preventDefault();
    const session = await connecter(email.trim(), motDePasse);
    if (session) {
      // L'admin arrive sur sa page, le client sur le catalogue
      navigate(session.role === "admin" ? "/admin" : "/catalogue", { replace: true });
    } else {
      setErreur("Email ou mot de passe incorrect");
      setMotDePasse("");
    }
  };

  if (estConnecte) {
    return <Navigate to={estAdmin ? "/admin" : "/catalogue"} replace />;
  }

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Connexion</h1>

        <div className={styles.champ}>
          <label htmlFor="email">Email</label>
          <input
            ref={emailRef}
            type="email"
            id="email"
            placeholder="nom@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className={styles.champ}>
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {erreur && <p className={styles.erreur}>{erreur}</p>}

        <button type="submit" disabled={!email || !motDePasse}>
          Se connecter
        </button>

        <p className={styles.lien}>
          Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
        </p>
      </form>
    </main>
  );
}
