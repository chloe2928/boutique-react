// randomUUID : génère un identifiant aléatoire, utilisé comme jeton de connexion admin
import { randomUUID } from "node:crypto";
// Importe la connexion à la base SQLite depuis db.js
import { db } from "../db.js";

// ATTENTION : mots de passe en clair, usage local uniquement.

// Compte administrateur : il n'est PAS dans la base, il est défini ici.
// (Tu peux le changer avec les variables d'environnement ADMIN_EMAIL et ADMIN_PASSWORD.)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@boutique.fr";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin-boutique-2026";

// Jetons des admins connectés. Gardés en mémoire : vidés quand le serveur redémarre.
export const tokensAdmin = new Set();

// Fonction exportée : appelée par la route POST /api/inscription
export function inscription(req, res) {
  const { nom, prenom, email, password } = req.body;

  // Validation : refuse si un champ est vide ou absent,
  // ou si le mot de passe fait moins de 12 caractères
  if (!nom || !prenom || !email || !password || password.length < 12) {
    return res.status(400).json({ message: "Données invalides" });
  }

  try {
    // Requête paramétrée : protège contre l'injection SQL
    db.prepare(
      "INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?)"
    ).run(nom, prenom, email, password);

    res.status(201).json({ message: "Compte créé" });
  } catch (err) {
    // Si l'email existe déjà, SQLite lève une erreur de contrainte d'unicité
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

// Fonction exportée : appelée par la route POST /api/connexion
export function connexion(req, res) {
  const { email, password } = req.body;

  // 1) Connexion ADMIN : email et mot de passe identiques à ceux définis en haut du fichier
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = randomUUID();
    tokensAdmin.add(token);
    return res.json({ id: 0, prenom: "Admin", role: "admin", token });
  }

  // 2) Connexion CLIENT : on cherche dans la base
  const user = db
    .prepare("SELECT id, prenom FROM utilisateurs WHERE email = ? AND mot_de_passe = ?")
    .get(email, password);

  if (!user) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }

  res.json({ id: user.id, prenom: user.prenom, role: "client" });
}
