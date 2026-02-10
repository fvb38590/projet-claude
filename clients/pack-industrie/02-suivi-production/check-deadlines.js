// ============================================================
// Pack Industrie - Suivi Production : Code Node n8n
// ============================================================
// Ce script recoit les items de la base Notion "Ordres de Fabrication"
// et genere les alertes pour les OF en retard ou proches de l'echeance.
//
// Branchement n8n :
//   [Notion - Get DB Items] → [Code Node (ce fichier)] → [IF Urgent] → [Send Email / Slack]
//                                                       → [IF Tendu]  → [Send Email]
//
// Proprietes Notion attendues en entree :
//   - "Numero OF"            (title)
//   - "Designation produit"  (text)
//   - "Client"               (text)
//   - "Email client"         (email)
//   - "Quantite commandee"   (number)
//   - "Statut"               (select)
//   - "Echeance"             (date)
//   - "Responsable production" (text)
//   - "Ligne de production"  (select)
//   - "Notes"                (text)
// ============================================================

const SEUIL_URGENT_H = 24;  // heures : 🔴 Urgent
const SEUIL_TENDU_H = 72;   // heures : 🟠 Tendu
const STATUT_TERMINE = "5 - Termine";

const maintenant = new Date();
const alertes = [];

for (const item of $input.all()) {
  const props = item.json.properties || item.json;

  // --- Extraction des valeurs Notion ---
  const numeroOF = extraireTexte(props["Numero OF"]) || props["Numero OF"] || "";
  const designation = extraireTexte(props["Designation produit"]) || props["Designation produit"] || "";
  const client = extraireTexte(props["Client"]) || props["Client"] || "";
  const emailClient = extraireEmail(props["Email client"]) || props["Email client"] || "";
  const quantite = extraireNombre(props["Quantite commandee"]) ?? props["Quantite commandee"] ?? 0;
  const statut = extraireSelect(props["Statut"]) || props["Statut"] || "";
  const responsable = extraireTexte(props["Responsable production"]) || props["Responsable production"] || "";
  const ligne = extraireSelect(props["Ligne de production"]) || props["Ligne de production"] || "";
  const notes = extraireTexte(props["Notes"]) || props["Notes"] || "";

  // Echeance : date Notion ou valeur directe
  let echeance = null;
  if (props["Echeance"]?.date?.start) {
    echeance = new Date(props["Echeance"].date.start);
  } else if (typeof props["Echeance"] === "string") {
    echeance = new Date(props["Echeance"]);
  }

  // --- Filtrage : ignorer les OF termines ---
  if (statut === STATUT_TERMINE) {
    continue;
  }

  // --- Ignorer les OF sans echeance ---
  if (!echeance || isNaN(echeance.getTime())) {
    continue;
  }

  // --- Calcul du delta horaire ---
  const deltaMs = echeance.getTime() - maintenant.getTime();
  const deltaHeures = Math.round((deltaMs / (1000 * 60 * 60)) * 10) / 10;
  const enRetard = deltaHeures < 0;

  // --- Determination de la priorite ---
  let priorite;
  if (deltaHeures <= SEUIL_URGENT_H) {
    priorite = "URGENT";
  } else if (deltaHeures <= SEUIL_TENDU_H) {
    priorite = "TENDU";
  } else {
    // OF encore dans les temps, pas d'alerte
    continue;
  }

  // --- Masquage email pour les logs (RGPD) ---
  const emailMasque = emailClient
    ? emailClient.replace(/(.{2}).*(@.*)/, "$1***$2")
    : "non renseigne";

  // --- Formatage du delai lisible ---
  let delaiTexte;
  if (enRetard) {
    const retardH = Math.abs(deltaHeures);
    delaiTexte = retardH >= 24
      ? `EN RETARD de ${Math.floor(retardH / 24)}j ${Math.round(retardH % 24)}h`
      : `EN RETARD de ${Math.round(retardH)}h`;
  } else {
    delaiTexte = deltaHeures >= 24
      ? `${Math.floor(deltaHeures / 24)}j ${Math.round(deltaHeures % 24)}h restantes`
      : `${Math.round(deltaHeures)}h restantes`;
  }

  // --- Construction du sujet email ---
  const prefixe = enRetard ? "[RETARD]" : "[ECHEANCE PROCHE]";
  const sujetEmail = priorite === "URGENT"
    ? `🔴 ${prefixe} OF ${numeroOF} - ${designation} (${client})`
    : `🟠 ${prefixe} OF ${numeroOF} - ${designation} (${client})`;

  // --- Construction du corps email ---
  const corpsEmail =
    `Bonjour,\n\n` +
    (enRetard
      ? `L'ordre de fabrication suivant a depasse son echeance :\n\n`
      : `L'ordre de fabrication suivant approche de son echeance :\n\n`) +
    `=============================================\n` +
    `OF           : ${numeroOF}\n` +
    `Produit      : ${designation}\n` +
    `Client       : ${client}\n` +
    `Quantite     : ${quantite} pieces\n` +
    `=============================================\n` +
    `Statut actuel : ${statut}\n` +
    `Echeance      : ${echeance.toLocaleDateString("fr-FR")} a ${echeance.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}\n` +
    `Delai         : ${delaiTexte}\n` +
    `Priorite      : ${priorite === "URGENT" ? "🔴 URGENT" : "🟠 TENDU"}\n` +
    `=============================================\n` +
    `Responsable  : ${responsable}\n` +
    `Ligne        : ${ligne}\n` +
    (notes ? `Notes        : ${notes}\n` : ``) +
    `=============================================\n\n` +
    (enRetard
      ? `⚠ Cet OF est en retard. Merci de mettre a jour le statut et de communiquer un nouveau delai au client.\n\n`
      : `Merci de vous assurer que cet OF sera termine dans les delais.\n\n`) +
    `Cordialement,\n` +
    `Systeme de suivi de production\n\n` +
    `---\n` +
    `Message genere automatiquement.\n` +
    `Ref. tracabilite : PROD-${numeroOF}-${maintenant.toISOString().slice(0, 10)}`;

  alertes.push({
    json: {
      // Champs pour le noeud Send Email
      to: emailClient,
      subject: sujetEmail,
      body: corpsEmail,

      // Metadata pour routage et logging
      numeroOF,
      designation,
      client,
      emailMasque,
      quantite,
      statut,
      responsable,
      ligne,
      echeance: echeance.toISOString(),
      deltaHeures,
      enRetard,
      priorite,
      delaiTexte,
      dateAlerte: maintenant.toISOString(),
    },
  });
}

// --- Tri : URGENT d'abord, puis par delta croissant ---
alertes.sort((a, b) => {
  if (a.json.priorite !== b.json.priorite) {
    return a.json.priorite === "URGENT" ? -1 : 1;
  }
  return a.json.deltaHeures - b.json.deltaHeures;
});

// --- Resultat ---
if (alertes.length === 0) {
  return [
    {
      json: {
        message: "Aucun OF a alerter - tous les OF sont dans les delais ou termines",
        timestamp: maintenant.toISOString(),
        itemsAnalyses: $input.all().length,
      },
    },
  ];
}

// Item de synthese en premier
const synthese = {
  json: {
    _type: "synthese",
    totalAlertes: alertes.length,
    urgent: alertes.filter((a) => a.json.priorite === "URGENT").length,
    tendu: alertes.filter((a) => a.json.priorite === "TENDU").length,
    enRetard: alertes.filter((a) => a.json.enRetard).length,
    timestamp: maintenant.toISOString(),
  },
};

return [synthese, ...alertes];

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
