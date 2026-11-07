import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import styles from "./AjoutProduit.module.css";

const CATEGORIES = ["Périphériques", "Écrans", "Audio", "Vidéo", "Accessoires"];

export default function AjoutProduit() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState(CATEGORIES[0]);
  const [prix, setPrix] = useState("");
  const [image, setImage] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  // useRef : accès direct au champ "nom" pour lui donner le focus
  const nomRef = useRef(null);

  // useEffect : au montage, focus sur le premier champ
  useEffect(() => {
    nomRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSucces("");

    if (!(Number(prix) > 0)) {
      setErreur("Le prix doit être supérieur à 0.");
      return;
    }

    try {
      const res = await fetch("/api/produits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // le jeton reçu à la connexion prouve au back qu'on est admin
          Authorization: `Bearer ${utilisateur.token}`,
        },
        body: JSON.stringify({ nom: nom.trim(), categorie, prix: Number(prix), image: image.trim() }),
      });

      // Jeton périmé (ex : serveur redémarré) : on déconnecte
      if (res.status === 401) {
        deconnecter();
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setErreur(data.message ?? "Erreur lors de l'ajout");
        return;
      }

      setSucces(`« ${data.nom} » a été ajouté au catalogue.`);
      setNom("");
      setPrix("");
      setImage("");
      nomRef.current?.focus();
    } catch {
      setErreur("Impossible de joindre le serveur.");
    }
  };

  const annuler = () => {
    setNom("");
    setPrix("");
    setImage("");
    setErreur("");
    setSucces("");
    nomRef.current?.focus();
  };

  return (
    <main className={styles.page}>
      <div className={styles.contenu}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Ajouter un produit</h1>

        <div className={styles.champ}>
          <label htmlFor="nom">Nom du produit</label>
          <input
            ref={nomRef}
            type="text"
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
        </div>

        <div className={styles.ligne}>
          <div className={styles.champ}>
            <label htmlFor="categorie">Catégorie</label>
            <select
              id="categorie"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.champ}>
            <label htmlFor="prix">Prix (€)</label>
            <input
              type="number"
              id="prix"
              min="0"
              step="0.01"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.champ}>
          <label htmlFor="image">Image (lien, facultatif)</label>
          <input
            type="text"
            id="image"
            placeholder="https://…"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        {erreur && <p className={styles.erreur}>{erreur}</p>}
        {succes && <p className={styles.succes}>{succes}</p>}

        <div className={styles.boutons}>
          <button type="button" className={styles.annuler} onClick={annuler}>
            Annuler
          </button>
          <button type="submit" disabled={!nom.trim() || !prix}>
            Enregistrer le produit
          </button>
        </div>
      </form>

      {/* Aperçu en direct : se met à jour à chaque frappe (mêmes states que le formulaire) */}
      <aside className={styles.apercu}>
        <h2>Aperçu dans le catalogue client</h2>
        <article className={styles.carte}>
          <div className={styles.visuel}>
            <span className={styles.badge}>{categorie}</span>
            {image.trim() ? (
              <img src={image.trim()} alt="" className={styles.img} />
            ) : (
              "Image du produit"
            )}
          </div>
          <div className={styles.details}>
            <h3>{nom.trim() || "Nom du produit"}</h3>
            <div className={styles.pied}>
              <span className={styles.prix}>{prix || 0} €</span>
              <span className={styles.plus}>+</span>
            </div>
          </div>
        </article>
        <p className={styles.note}>
          Seul l'admin voit cette page. Le produit enregistré apparaît ensuite dans le
          catalogue de tous les clients.
        </p>
      </aside>
      </div>
    </main>
  );
}
