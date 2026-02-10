// ============================================================
// Pack Industrie - Pre-check Stock avant Production
// ============================================================
// Ce script verifie la disponibilite des matieres premieres
// AVANT qu'un OF ne passe au statut "3 - En production".
//
// Branchement n8n (Code Node en mode "Run Once for All Items") :
//
//   [Notion Trigger: OF passe a "2 - En preparation"]
//       → [Notion - Get DB Items: Stock Matieres]
//       → [Merge: combine OF + stocks]
//       → [Code Node: stock-pre-check.js (ce fichier)]
//       → [IF: danger == true]
//           → OUI: [Send Email: alerte "Approvisionnement necessaire"]
//           → NON: (rien, production peut demarrer)
//
// Le Merge node doit combiner :
//   - Input 1 : l'OF concerne (1 item)
//   - Input 2 : tous les items de la base "Stock Matieres"
//
// Prerequis Notion :
//   L'OF doit avoir une propriete "Matieres requises" (Text)
//   contenant les references matieres separees par des virgules.
//   Exemple : "ACR-001, PLA-042, CHM-007"
//   Ces references correspondent au champ "Reference matiere"
//   de la base "Stock Matieres" (module 01).
// ============================================================

const STATUT_PRE_PRODUCTION = "2 - En preparation";
const STATUTS_DANGER = ["CRITIQUE", "A commander"];
const MARGE_SECURITE = 0.20;

const items = $input.all();
const maintenant = new Date();

// --- Separation OF / Stock ---
// Le Merge node produit des items mixtes.
// Les items OF ont "Numero OF", les items stock ont "Reference matiere".
const ofItems = [];
const stockItems = [];

for (const item of items) {
  const props = item.json.properties || item.json;
  if (props["Numero OF"] || props["Designation produit"]) {
    ofItems.push(props);
  } else if (props["Reference matiere"] || props["Nom matiere"]) {
    stockItems.push(props);
  }
}

// --- Index des stocks par reference ---
const stockParRef = new Map();
for (const s of stockItems) {
  const ref = extraireTexte(s["Reference matiere"]) || s["Reference matiere"] || "";
  if (ref) {
    stockParRef.set(ref.trim().toUpperCase(), s);
  }
}

// --- Traitement de chaque OF ---
const resultats = [];

for (const of_ of ofItems) {
  const numeroOF = extraireTexte(of_["Numero OF"]) || of_["Numero OF"] || "";
  const designation = extraireTexte(of_["Designation produit"]) || of_["Designation produit"] || "";
  const client = extraireTexte(of_["Client"]) || of_["Client"] || "";
  const emailClient = extraireEmail(of_["Email client"]) || of_["Email client"] || "";
  const statut = extraireSelect(of_["Statut"]) || of_["Statut"] || "";
  const responsable = extraireTexte(of_["Responsable production"]) || of_["Responsable production"] || "";
  const quantiteCommandee = extraireNombre(of_["Quantite commandee"]) ?? of_["Quantite commandee"] ?? 0;

  // Extraction des references matieres requises
  const matieresRequisesBrut = extraireTexte(of_["Matieres requises"]) || of_["Matieres requises"] || "";
  const refsRequises = matieresRequisesBrut
    .split(",")
    .map((r) => r.trim().toUpperCase())
    .filter((r) => r.length > 0);

  if (refsRequises.length === 0) {
    continue;
  }

  // --- Verification de chaque matiere ---
  const matieresEnDanger = [];
  const matieresOK = [];
  const matieresInconnues = [];

  for (const ref of refsRequises) {
    const stock = stockParRef.get(ref);

    if (!stock) {
      matieresInconnues.push(ref);
      continue;
    }

    const nom = extraireTexte(stock["Nom matiere"]) || stock["Nom matiere"] || "";
    const quantiteStock = extraireNombre(stock["Quantite en stock"]) ?? stock["Quantite en stock"] ?? 0;
    const seuilMini = extraireNombre(stock["Seuil mini"]) ?? stock["Seuil mini"] ?? 0;
    const seuilCritique = extraireNombre(stock["Seuil critique"]) ?? stock["Seuil critique"] ?? 0;
    const unite = extraireSelect(stock["Unite de mesure"]) || stock["Unite de mesure"] || "";
    const fournisseur = extraireTexte(stock["Fournisseur principal"]) || stock["Fournisseur principal"] || "";
    const emailFournisseur = extraireEmail(stock["Email fournisseur"]) || stock["Email fournisseur"] || "";
    const delaiLivraison = extraireNombre(stock["Delai livraison"]) ?? stock["Delai livraison"] ?? 0;
    const prixUnitaire = extraireNombre(stock["Prix unitaire HT"]) ?? stock["Prix unitaire HT"] ?? 0;

    // Statut stock via formule Notion ou recalcul local
    let statutStock = "";
    if (stock["Statut stock"]?.formula?.string) {
      statutStock = stock["Statut stock"].formula.string;
    } else if (typeof stock["Statut stock"] === "string") {
      statutStock = stock["Statut stock"];
    } else {
      // Recalcul local si la formule n'est pas disponible
      if (quantiteStock <= seuilCritique) {
        statutStock = "CRITIQUE";
      } else if (quantiteStock <= seuilMini) {
        statutStock = "A commander";
      } else {
        statutStock = "OK";
      }
    }

    const cibleStock = Math.ceil(seuilMini * (1 + MARGE_SECURITE));
    const quantiteManquante = Math.max(0, cibleStock - quantiteStock);

    const detail = {
      reference: ref,
      nom,
      quantiteStock,
      seuilMini,
      seuilCritique,
      cibleStock,
      quantiteManquante,
      unite,
      statutStock,
      fournisseur,
      emailFournisseur,
      delaiLivraison,
      coutReappro: Math.round(quantiteManquante * prixUnitaire * 100) / 100,
    };

    if (STATUTS_DANGER.includes(statutStock)) {
      matieresEnDanger.push(detail);
    } else {
      matieresOK.push(detail);
    }
  }

  // --- Verdict ---
  const danger = matieresEnDanger.length > 0 || matieresInconnues.length > 0;

  // --- Construction de l'alerte si danger ---
  let sujetEmail = "";
  let corpsEmail = "";

  if (danger) {
    sujetEmail = `⚠ Approvisionnement necessaire AVANT production - OF ${numeroOF}`;

    // Bloc matieres en danger
    let blocDanger = "";
    for (const m of matieresEnDanger) {
      const marqueur = m.statutStock === "CRITIQUE" ? "🔴 CRITIQUE" : "🟠 A commander";
      blocDanger +=
        `  ${m.reference} - ${m.nom}\n` +
        `    Statut       : ${marqueur}\n` +
        `    Stock actuel : ${m.quantiteStock} ${m.unite}\n` +
        `    Cible (mini+20%) : ${m.cibleStock} ${m.unite}\n` +
        `    Manquant     : ${m.quantiteManquante} ${m.unite}\n` +
        `    Fournisseur  : ${m.fournisseur}\n` +
        `    Delai livr.  : ${m.delaiLivraison} jours\n` +
        `    Cout reappro : ${m.coutReappro} EUR HT\n\n`;
    }

    // Bloc matieres inconnues
    let blocInconnues = "";
    if (matieresInconnues.length > 0) {
      blocInconnues =
        `MATIERES NON TROUVEES EN BASE :\n` +
        matieresInconnues.map((r) => `  - ${r} (verifier la reference)`).join("\n") +
        `\n\n`;
    }

    const coutTotalReappro = Math.round(
      matieresEnDanger.reduce((sum, m) => sum + m.coutReappro, 0) * 100
    ) / 100;

    const delaiMax = matieresEnDanger.length > 0
      ? Math.max(...matieresEnDanger.map((m) => m.delaiLivraison))
      : 0;

    corpsEmail =
      `Bonjour,\n\n` +
      `L'OF suivant est en phase de preparation et ne peut PAS passer en production ` +
      `tant que les matieres ci-dessous ne sont pas reapprovisionnees :\n\n` +
      `=============================================\n` +
      `OF           : ${numeroOF}\n` +
      `Produit      : ${designation}\n` +
      `Client       : ${client}\n` +
      `Quantite     : ${quantiteCommandee} pieces\n` +
      `Responsable  : ${responsable}\n` +
      `=============================================\n\n` +
      `MATIERES EN RUPTURE OU INSUFFISANTES :\n\n` +
      blocDanger +
      blocInconnues +
      `---------------------------------------------\n` +
      `Cout total reapprovisionnement estime : ${coutTotalReappro} EUR HT\n` +
      `Delai fournisseur le plus long        : ${delaiMax} jours\n` +
      `---------------------------------------------\n\n` +
      `⚠ ACTION REQUISE : Commander les matieres manquantes avant de lancer la production.\n` +
      `Le passage au statut "3 - En production" est deconseille tant que ces ` +
      `matieres ne sont pas disponibles.\n\n` +
      `Cordialement,\n` +
      `Systeme de suivi de production\n\n` +
      `---\n` +
      `Message genere automatiquement.\n` +
      `Ref. tracabilite : PRECHECK-${numeroOF}-${maintenant.toISOString().slice(0, 10)}`;
  }

  // Masquage email pour logs (RGPD)
  const emailMasque = emailClient
    ? emailClient.replace(/(.{2}).*(@.*)/, "$1***$2")
    : "non renseigne";

  resultats.push({
    json: {
      // Verdict principal
      danger,
      numeroOF,
      designation,
      client,
      emailMasque,
      responsable,
      statut,

      // Detail matieres
      matieresVerifiees: refsRequises.length,
      matieresEnDanger: matieresEnDanger.length,
      matieresOK: matieresOK.length,
      matieresInconnues: matieresInconnues.length,
      detailDanger: matieresEnDanger,
      detailInconnues: matieresInconnues,

      // Champs email (vides si pas de danger)
      to: danger ? emailClient : "",
      subject: sujetEmail,
      body: corpsEmail,

      timestamp: maintenant.toISOString(),
    },
  });
}

// --- Resultat ---
if (resultats.length === 0) {
  return [
    {
      json: {
        message: "Aucun OF en preparation a verifier ou aucune matiere requise renseignee",
        timestamp: maintenant.toISOString(),
        itemsRecus: items.length,
      },
    },
  ];
}

return resultats;

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
