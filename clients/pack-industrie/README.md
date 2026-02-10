# Pack Industrie Automatisee

**Par Vazbolota Consulting**

---

## Flux Predictif

Les arrets de production non planifies coutent en moyenne 20 000 EUR par heure aux PME industrielles.
Le Pack Industrie Automatisee connecte vos stocks, vos ordres de fabrication et vos machines dans un ecosysteme predictif unique, pilote depuis Notion et orchestre par n8n.
Resultat : zero rupture, zero retard, zero oubli de maintenance.

---

## Modules

### 01 - Gestion des stocks

Surveillance en continu des niveaux de matieres premieres. Commandes de reapprovisionnement generees automatiquement lorsqu'un seuil est atteint (seuil mini + 20% de marge de securite).

| Fichier | Role |
|---------|------|
| `notion-setup.md` | Configuration de la base Notion "Stock Matieres" (17 proprietes) |
| `logic-n8n.js` | Code Node n8n : filtrage CRITIQUE / A commander, calcul quantites, email fournisseur |

### 02 - Suivi de production

Pilotage des ordres de fabrication a travers 5 etapes (Planifie → En preparation → En production → Controle qualite → Termine). Alertes automatiques sur les echeances et verification des stocks avant lancement.

| Fichier | Role |
|---------|------|
| `notion-of-config.md` | Configuration de la base Notion "Ordres de Fabrication" (14 proprietes) |
| `check-deadlines.js` | Code Node n8n : alertes echeances (Urgent < 24h, Tendu < 72h) |
| `stock-pre-check.js` | Code Node n8n : cross-reference OF / stocks avant mise en production |
| `notif-logic.md` | Guide triggers n8n : Webhook vs Schedule vs Polling (3 workflows) |

### 03 - Maintenance preventive

Planification automatique des revisions machines basee sur la frequence definie et la date de derniere intervention. Priorisation par criticite pour eviter les pannes sur les equipements cles.

| Fichier | Role |
|---------|------|
| `notion-machinery-setup.md` | Configuration de la base Notion "Parc Machines" (14 proprietes) |
| `preventive-logic.js` | Code Node n8n : detection retards et revisions imminentes, alertes par criticite |

---

## Stack technique

| Composant | Usage |
|-----------|-------|
| **Notion** | 3 bases de donnees (Stock, OF, Machines) avec formules automatiques |
| **n8n** | Orchestration des workflows (5 scripts, 4+ workflows) |
| **Email** | Alertes fournisseurs, responsables production, equipe maintenance |
| **Slack** (optionnel) | Alertes urgentes en temps reel |

---

## Installation rapide

1. Creer les 3 bases Notion en suivant les guides `notion-*.md` de chaque module
2. Configurer les credentials Notion dans n8n
3. Importer les workflows n8n (Menu → Import from File)
4. Copier le code des fichiers `.js` dans les Code Nodes correspondants
5. Configurer les credentials email (SMTP ou Gmail)
6. Activer les workflows et tester avec des donnees de demo

---

## Mots-cles / SEO

`automatisation industrielle PME` · `maintenance preventive connectee` · `gestion stocks temps reel n8n` · `suivi production Notion` · `flux predictif industrie 4.0`

---

## Licence

Usage commercial reserve - Vazbolota Consulting.
