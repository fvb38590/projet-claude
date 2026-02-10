// ============================================================
// Pack Industrie - Maintenance Preventive : Code Node n8n
// ============================================================
// Ce script recoit les items de la base Notion "Parc Machines"
// et genere les alertes pour les machines dont la revision
// est en retard ou imminente.
//
// Regle : alerte si Date du jour > Derniere revision + Frequence
//         (= la prochaine revision est depassee ou imminente)
//
// Branchement n8n :
//   [Schedule Trigger: cron quotidien 7h]
//       → [Notion - Get DB Items: base "Parc Machines"]
//       → [Code Node: preventive-logic.js (ce fichier)]
//       → [IF: _type != "synthese"]
//           → [Send Email au responsable maintenance]
//
// Proprietes Notion attendues en entree :
//   - "Machine"                    (title)
//   - "Designation"                (text)
//   - "Localisation"               (select)
//   - "Frequence revision (jours)" (number)
//   - "Derniere revision"          (date)
//   - "Etat"                       (select)
//   - "Criticite"                  (select)
//   - "Responsable maintenance"    (text)
//   - "Email responsable"          (email)
//   - "Prestataire externe"        (text)
//   - "Cout derniere revision"     (number)
//   - "Notes"                      (text)
// ============================================================

const SEUIL_ALERTE_JOURS = 7; // alerter X jours AVANT l'echeance
const ETATS_EXCLUS = ["Hors service", "En panne"]; // pas de preventif sur ces etats

const maintenant = new Date();
maintenant.setHours(0, 0, 0, 0); // comparer sur les jours, pas les heures

const alertes = [];

for (const item of $input.all()) {
  const props = item.json.properties || item.json;

  // --- Extraction des valeurs Notion ---
  const machine = extraireTexte(props["Machine"]) || props["Machine"] || "";
  const designation = extraireTexte(props["Designation"]) || props["Designation"] || "";
  const localisation = extraireSelect(props["Localisation"]) || props["Localisation"] || "";
  const frequenceJours = extraireNombre(props["Frequence revision (jours)"]) ?? props["Frequence revision (jours)"] ?? 0;
  const etat = extraireSelect(props["Etat"]) || props["Etat"] || "";
  const criticite = extraireSelect(props["Criticite"]) || props["Criticite"] || "";
  const responsable = extraireTexte(props["Responsable maintenance"]) || props["Responsable maintenance"] || "";
  const emailResponsable = extraireEmail(props["Email responsable"]) || props["Email responsable"] || "";
  const prestataire = extraireTexte(props["Prestataire externe"]) || props["Prestataire externe"] || "";
  const coutDerniere = extraireNombre(props["Cout derniere revision"]) ?? props["Cout derniere revision"] ?? 0;
  const notes = extraireTexte(props["Notes"]) || props["Notes"] || "";

  // Derniere revision : date Notion ou valeur directe
  let derniereRevision = null;
  if (props["Derniere revision"]?.date?.start) {
    derniereRevision = new Date(props["Derniere revision"].date.start);
  } else if (typeof props["Derniere revision"] === "string") {
    derniereRevision = new Date(props["Derniere revision"]);
  }

  // --- Filtrage : ignorer les machines hors service / en panne ---
  if (ETATS_EXCLUS.includes(etat)) {
    continue;
  }

  // --- Ignorer si donnees incompletes ---
  if (!derniereRevision || isNaN(derniereRevision.getTime()) || frequenceJours <= 0) {
    continue;
  }

  // --- Calcul de la prochaine revision ---
  const prochaineRevision = new Date(derniereRevision);
  prochaineRevision.setDate(prochaineRevision.getDate() + frequenceJours);
  prochaineRevision.setHours(0, 0, 0, 0);

  // --- Delta en jours ---
  const deltaMs = prochaineRevision.getTime() - maintenant.getTime();
  const deltaJours = Math.round(deltaMs / (1000 * 60 * 60 * 24));
  const enRetard = deltaJours < 0;

  // --- Alerte si en retard OU dans le seuil d'alerte ---
  if (deltaJours > SEUIL_ALERTE_JOURS) {
    continue;
  }

  // --- Niveau d'alerte ---
  let niveau;
  if (enRetard) {
    niveau = "EN RETARD";
  } else if (deltaJours <= 2) {
    niveau = "IMMINENTE";
  } else {
    niveau = "A PLANIFIER";
  }

  // Ponderation par criticite
  const ordresCriticite = { "Haute": 0, "Moyenne": 1, "Basse": 2 };
  const ordreCriticite = ordresCriticite[criticite] ?? 1;

  // --- Masquage email pour logs (RGPD) ---
  const emailMasque = emailResponsable
    ? emailResponsable.replace(/(.{2}).*(@.*)/, "$1***$2")
    : "non renseigne";

  // --- Construction du sujet email ---
  let sujetEmail;
  if (enRetard) {
    sujetEmail = criticite === "Haute"
      ? `🔴 [RETARD CRITIQUE] Maintenance ${machine} - ${designation}`
      : `🟠 [RETARD] Maintenance ${machine} - ${designation}`;
  } else if (deltaJours <= 2) {
    sujetEmail = `🟠 [IMMINENTE] Maintenance ${machine} dans ${deltaJours}j`;
  } else {
    sujetEmail = `🔵 [A PLANIFIER] Maintenance ${machine} dans ${deltaJours}j`;
  }

  // --- Construction du corps email ---
  const corpsEmail =
    `Bonjour,\n\n` +
    (enRetard
      ? `La maintenance preventive de la machine suivante est EN RETARD de ${Math.abs(deltaJours)} jour(s) :\n\n`
      : `La maintenance preventive de la machine suivante est a planifier :\n\n`) +
    `=============================================\n` +
    `Machine       : ${machine}\n` +
    `Designation   : ${designation}\n` +
    `Localisation  : ${localisation}\n` +
    `Criticite     : ${criticite}\n` +
    `Etat actuel   : ${etat}\n` +
    `=============================================\n` +
    `Derniere revision  : ${derniereRevision.toLocaleDateString("fr-FR")}\n` +
    `Frequence          : tous les ${frequenceJours} jours\n` +
    `Prochaine revision : ${prochaineRevision.toLocaleDateString("fr-FR")}\n` +
    `Delai              : ${enRetard ? `EN RETARD de ${Math.abs(deltaJours)} jour(s)` : `dans ${deltaJours} jour(s)`}\n` +
    `=============================================\n` +
    (prestataire
      ? `Prestataire        : ${prestataire}\n`
      : `Prestataire        : Interne\n`) +
    `Cout precedent     : ${coutDerniere} EUR HT\n` +
    (notes
      ? `Notes              : ${notes}\n`
      : ``) +
    `=============================================\n\n` +
    (enRetard && criticite === "Haute"
      ? `⚠ MACHINE CRITIQUE EN RETARD DE MAINTENANCE.\n` +
        `Risque de panne non planifiee et d'arret de production.\n` +
        `Planifier l'intervention en urgence.\n\n`
      : enRetard
        ? `⚠ Maintenance en retard. Planifier l'intervention des que possible.\n\n`
        : `Merci de planifier l'intervention avant le ${prochaineRevision.toLocaleDateString("fr-FR")}.\n\n`) +
    `Cordialement,\n` +
    `Systeme de maintenance preventive\n\n` +
    `---\n` +
    `Message genere automatiquement.\n` +
    `Ref. tracabilite : MAINT-${machine}-${maintenant.toISOString().slice(0, 10)}`;

  alertes.push({
    json: {
      // Champs pour le noeud Send Email
      to: emailResponsable,
      subject: sujetEmail,
      body: corpsEmail,

      // Metadata pour routage et logging
      machine,
      designation,
      localisation,
      etat,
      criticite,
      ordreCriticite,
      responsable,
      emailMasque,
      prestataire,
      frequenceJours,
      derniereRevision: derniereRevision.toISOString(),
      prochaineRevision: prochaineRevision.toISOString(),
      deltaJours,
      enRetard,
      niveau,
      dateAlerte: maintenant.toISOString(),
    },
  });
}

// --- Tri : retard d'abord, puis criticite haute, puis delta croissant ---
alertes.sort((a, b) => {
  if (a.json.enRetard !== b.json.enRetard) {
    return a.json.enRetard ? -1 : 1;
  }
  if (a.json.ordreCriticite !== b.json.ordreCriticite) {
    return a.json.ordreCriticite - b.json.ordreCriticite;
  }
  return a.json.deltaJours - b.json.deltaJours;
});

// --- Resultat ---
if (alertes.length === 0) {
  return [
    {
      json: {
        message: "Aucune machine a alerter - toutes les maintenances sont a jour",
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
    enRetard: alertes.filter((a) => a.json.enRetard).length,
    imminentes: alertes.filter((a) => a.json.niveau === "IMMINENTE").length,
    aPlanifier: alertes.filter((a) => a.json.niveau === "A PLANIFIER").length,
    critiquesEnRetard: alertes.filter((a) => a.json.enRetard && a.json.criticite === "Haute").length,
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
