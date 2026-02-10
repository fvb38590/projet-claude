// ============================================================
// Pack Industrie - Gestion Stocks : Code Node n8n
// ============================================================
// Ce script recoit les items d'une base Notion "Stock Matieres"
// et genere les commandes de reapprovisionnement.
//
// Branchement n8n :
//   [Notion - Get DB Items] → [Code Node (ce fichier)] → [Send Email]
//
// Proprietes Notion attendues en entree :
//   - "Reference matiere"    (title)
//   - "Nom matiere"          (text)
//   - "Categorie"            (select)
//   - "Fournisseur principal"(text)
//   - "Email fournisseur"    (email)
//   - "Quantite en stock"    (number)
//   - "Unite de mesure"      (select)
//   - "Seuil mini"           (number)
//   - "Seuil critique"       (number)
//   - "Statut stock"         (formula → string)
//   - "Prix unitaire HT"     (number)
//   - "Delai livraison"      (number)
// ============================================================

const MARGE_SECURITE = 0.20; // 20% au-dessus du seuil mini
const STATUTS_A_COMMANDER = ["CRITIQUE", "A commander"];

const resultats = [];

for (const item of $input.all()) {
  const props = item.json.properties || item.json;

  // --- Extraction des valeurs Notion ---
  // Notion renvoie des structures imbriquees, on gere les deux formats
  const reference = extraireTexte(props["Reference matiere"]) || props["Reference matiere"] || "";
  const nom = extraireTexte(props["Nom matiere"]) || props["Nom matiere"] || "";
  const categorie = extraireSelect(props["Categorie"]) || props["Categorie"] || "";
  const fournisseur = extraireTexte(props["Fournisseur principal"]) || props["Fournisseur principal"] || "";
  const emailFournisseur = extraireEmail(props["Email fournisseur"]) || props["Email fournisseur"] || "";
  const unite = extraireSelect(props["Unite de mesure"]) || props["Unite de mesure"] || "";
  const quantiteStock = extraireNombre(props["Quantite en stock"]) ?? props["Quantite en stock"] ?? 0;
  const seuilMini = extraireNombre(props["Seuil mini"]) ?? props["Seuil mini"] ?? 0;
  const seuilCritique = extraireNombre(props["Seuil critique"]) ?? props["Seuil critique"] ?? 0;
  const prixUnitaire = extraireNombre(props["Prix unitaire HT"]) ?? props["Prix unitaire HT"] ?? 0;
  const delaiLivraison = extraireNombre(props["Delai livraison"]) ?? props["Delai livraison"] ?? 0;

  // Statut stock : formule Notion ou valeur directe
  let statutStock = "";
  if (props["Statut stock"]?.formula?.string) {
    statutStock = props["Statut stock"].formula.string;
  } else if (typeof props["Statut stock"] === "string") {
    statutStock = props["Statut stock"];
  }

  // --- Filtrage : uniquement CRITIQUE et A commander ---
  if (!STATUTS_A_COMMANDER.includes(statutStock)) {
    continue;
  }

  // --- Calcul de la quantite a commander ---
  // Objectif : revenir au seuil mini + 20% de marge de securite
  const cibleStock = Math.ceil(seuilMini * (1 + MARGE_SECURITE));
  const quantiteACommander = Math.max(0, cibleStock - quantiteStock);

  if (quantiteACommander === 0) {
    continue;
  }

  // --- Cout estime ---
  const coutEstime = Math.round(quantiteACommander * prixUnitaire * 100) / 100;

  // --- Niveau d'urgence ---
  const estCritique = statutStock === "CRITIQUE";
  const urgence = estCritique ? "URGENT" : "Standard";

  // --- Masquage email pour les logs (RGPD) ---
  const emailMasque = emailFournisseur
    ? emailFournisseur.replace(/(.{2}).*(@.*)/, "$1***$2")
    : "non renseigne";

  // --- Generation de la sortie pour le noeud Email ---
  const sujetEmail = estCritique
    ? `[URGENT] Commande reapprovisionnement - ${reference} ${nom}`
    : `Commande reapprovisionnement - ${reference} ${nom}`;

  const corpsEmail =
    `Bonjour,\n\n` +
    `Nous souhaitons passer commande pour le reapprovisionnement suivant :\n\n` +
    `---------------------------------------------\n` +
    `Reference    : ${reference}\n` +
    `Matiere      : ${nom}\n` +
    `Categorie    : ${categorie}\n` +
    `---------------------------------------------\n` +
    `Stock actuel : ${quantiteStock} ${unite}\n` +
    `Seuil mini   : ${seuilMini} ${unite}\n` +
    `Cible stock  : ${cibleStock} ${unite} (seuil + 20%)\n` +
    `---------------------------------------------\n` +
    `QUANTITE A COMMANDER : ${quantiteACommander} ${unite}\n` +
    `Cout estime HT       : ${coutEstime} EUR\n` +
    `---------------------------------------------\n\n` +
    (estCritique
      ? `⚠ STOCK CRITIQUE - Merci de traiter cette commande en priorite.\n` +
        `Delai de livraison habituel : ${delaiLivraison} jours ouvres.\n\n`
      : `Delai de livraison habituel : ${delaiLivraison} jours ouvres.\n\n`) +
    `Merci de confirmer la disponibilite et le delai de livraison.\n\n` +
    `Cordialement,\n` +
    `Service Approvisionnement\n\n` +
    `---\n` +
    `Ce message a ete genere automatiquement par le systeme de gestion des stocks.\n` +
    `Pour toute question, contactez le service approvisionnement.\n` +
    `Ref. tracabilite : STOCK-${reference}-${new Date().toISOString().slice(0, 10)}`;

  resultats.push({
    json: {
      // Champs pour le noeud Send Email
      to: emailFournisseur,
      subject: sujetEmail,
      body: corpsEmail,

      // Metadata pour logging / noeuds suivants
      reference,
      nom,
      categorie,
      fournisseur,
      emailMasque,
      quantiteStock,
      seuilMini,
      seuilCritique,
      cibleStock,
      quantiteACommander,
      unite,
      prixUnitaire,
      coutEstime,
      statutStock,
      urgence,
      delaiLivraison,
      dateCommande: new Date().toISOString(),
    },
  });
}

// --- Log de synthese ---
if (resultats.length === 0) {
  return [
    {
      json: {
        message: "Aucune matiere a reapprovisionner",
        timestamp: new Date().toISOString(),
        itemsAnalyses: $input.all().length,
      },
    },
  ];
}

// Ajouter un item de synthese en premier
const synthese = {
  json: {
    _type: "synthese",
    totalCommandes: resultats.length,
    commandesUrgentes: resultats.filter((r) => r.json.urgence === "URGENT").length,
    commandesStandard: resultats.filter((r) => r.json.urgence === "Standard").length,
    coutTotalEstime:
      Math.round(resultats.reduce((sum, r) => sum + r.json.coutEstime, 0) * 100) / 100,
    timestamp: new Date().toISOString(),
  },
};

return [synthese, ...resultats];

// ============================================================
// Fonctions utilitaires - Extraction proprietes Notion
// ============================================================

function extraireTexte(prop) {
  if (!prop) return null;
  if (prop.title) return prop.title.map((t) => t.plain_text).join("");
  if (prop.rich_text) return prop.rich_text.map((t) => t.plain_text).join("");
  return null;
}

function extraireSelect(prop) {
  if (!prop) return null;
  if (prop.select?.name) return prop.select.name;
  return null;
}

function extraireNombre(prop) {
  if (!prop) return null;
  if (typeof prop.number === "number") return prop.number;
  return null;
}

function extraireEmail(prop) {
  if (!prop) return null;
  if (prop.email) return prop.email;
  return null;
}
