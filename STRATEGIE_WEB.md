# 🚀 CATALOGUE DES OFFRES AUTOMATISATION

## 1. Pack "Artisan Connecté" (via ByteChef/n8n)
- Synchronisation stock/factures/RDV.
- Support multi-plateforme.

## 2. Pack "Immo-Furtif" (via Scraper-ym)
- Extraction automatique de leads (annuaires/portails).
- Nettoyage des données et injection CRM.

## 3. Pack "LeadGen Pro" (via OVH/n8n)
- Envois automatisés via automat@vazbolotaconsulting.fr.
- Gestion des bounces et désinscriptions.

---

# Strategie Web - Hub de Vente Vazbolota Consulting

**Document de reference** | Derniere mise a jour : 12/02/2026

---

## 1. Architecture des Domaines

```
vazbolotaconsulting.fr              (site principal - vitrine + blog)
    |
    |--- /packs/artisan             landing page Pack Artisan
    |--- /packs/industrie           landing page Pack Industrie 4.0
    |--- /packs/notaire             landing page Pack Notaire Premium
    |--- /blog/                     etudes de cas + articles SEO
    |
    +--- vazbolota.gumroad.com      (boutique - paiement + livraison)
    |       |--- /l/pack-artisan        produit Pack Artisan
    |       |--- /l/pcffpq             produit Pack Notaire Premium (existant)
    |       |--- /l/pack-industrie     produit Pack Industrie 4.0
    |
    +--- n8n (self-hosted)          (back-office - livraison auto)
            |--- webhook: /gumroad/purchase    reception achat
            |--- workflow: livraison email      envoi ZIP + guide
            |--- adresse: automat@vazbolotaconsulting.fr
```

### Liens entre composants

| Composant | Role | Connexion |
|-----------|------|-----------|
| **vazbolotaconsulting.fr** | Vitrine, SEO, confiance | CTA renvoient vers Gumroad |
| **Gumroad** | Paiement, TVA, factures | Webhook POST vers n8n a chaque vente |
| **n8n** | Livraison automatique | Recoit webhook Gumroad, envoie le pack par email |
| **automat@vazbolotaconsulting.fr** | Adresse expediteur | Emails de livraison + support post-achat |

### Flux technique Gumroad → n8n

```
1. Client clique "Acheter" sur landing page
2. Gumroad traite le paiement (CB, PayPal)
3. Gumroad envoie un webhook POST vers n8n :
   - email acheteur
   - produit achete (product_id / product_name)
   - prix paye
   - timestamp
4. n8n identifie le pack achete (IF product_name)
5. n8n envoie l'email de livraison via automat@vazbolotaconsulting.fr :
   - fichiers JSON workflows en piece jointe (ou lien de telechargement)
   - guide d'installation PDF
   - lien vers support
6. n8n log la vente (Google Sheets ou Notion "Ventes")
```

---

## 2. Sitemap du Hub

```
vazbolotaconsulting.fr/
|
|--- index.html                    ACCUEIL
|     |  Proposition de valeur
|     |  3 packs mis en avant (cards)
|     |  Temoignages / chiffres cles
|     |  CTA vers chaque pack
|
|--- /packs/
|     |--- artisan/                PACK ARTISAN
|     |     |  Hero : "Automatisez votre activite d'artisan"
|     |     |  6 workflows detailles
|     |     |  Stack technique (Notion + n8n + Gmail)
|     |     |  Tarif + CTA Gumroad
|     |     |  FAQ
|     |
|     |--- industrie/             PACK INDUSTRIE 4.0
|     |     |  Hero : "Zero panne, zero rupture, zero retard"
|     |     |  3 modules detailles (stocks, production, maintenance)
|     |     |  ROI chiffre (pannes evitees, heures gagnees)
|     |     |  Tarif 149 EUR HT + CTA Gumroad
|     |     |  FAQ
|     |
|     |--- notaire/               PACK NOTAIRE PREMIUM
|           |  Hero : "Automatisation premium pour etudes notariales"
|           |  3 workflows IA (extraction, relances, alertes SRU)
|           |  Conformite RGPD mise en avant
|           |  Tarif 249 EUR HT + CTA Gumroad
|           |  FAQ
|
|--- /blog/                        BLOG - ETUDES DE CAS
|     |--- artisan-plombier-gagne-5h.html
|     |     "Comment un plombier a gagne 5h/semaine avec l'automatisation"
|     |
|     |--- notaire-zero-oubli-sru.html
|     |     "Plus aucun oubli de delai SRU grace a l'IA"
|     |
|     |--- industrie-panne-evitee.html
|     |     "Une panne a 15 000 EUR evitee grace a la maintenance predictive"
|     |
|     |--- pourquoi-automatiser-tpe.html
|     |     "5 raisons d'automatiser sa TPE en 2026" (article pilier SEO)
|     |
|     |--- n8n-vs-zapier-pme.html
|     |     "n8n vs Zapier : quel outil pour une PME francaise ?"
|
|--- /mentions-legales/            MENTIONS LEGALES + CGV
|--- /politique-confidentialite/   RGPD
```

---

## 3. Flux de Conversion

### Parcours visiteur type

```
                    DECOUVERTE                    CONSIDERATION                 ACHAT                LIVRAISON
               ┌─────────────────┐          ┌──────────────────┐        ┌──────────────┐     ┌───────────────────┐
Google SEO ──> | Article blog    | ──CTA──> | Landing page     | ─CTA─> | Gumroad      | ──> | n8n webhook       |
Linkedin   ──> | (etude de cas)  |          | pack dedie       |        | paiement     |     | email livraison   |
Bouche a   ──> |                 |          | (details + prix) |        | (CB/PayPal)  |     | via automat@...   |
oreille    ──> └─────────────────┘          └──────────────────┘        └──────────────┘     └───────────────────┘
                                                                              |                       |
                                                                              v                       v
                                                                        Webhook POST           Email contient :
                                                                        vers n8n               - fichiers JSON
                                                                                               - guide install
                                                                                               - lien support
```

### Etapes detaillees

| Etape | Action visiteur | Outil | Declencheur |
|-------|----------------|-------|-------------|
| 1 | Cherche "automatiser artisan" sur Google | Google Search | SEO organique |
| 2 | Lit un article blog (etude de cas) | vazbolotaconsulting.fr/blog | - |
| 3 | Clique CTA "Decouvrir le Pack Artisan" | Lien interne | Bouton dans l'article |
| 4 | Consulte la landing page du pack | vazbolotaconsulting.fr/packs/artisan | - |
| 5 | Clique "Acheter maintenant" | Redirect Gumroad | Bouton CTA |
| 6 | Paye sur Gumroad (CB ou PayPal) | Gumroad checkout | - |
| 7 | Gumroad envoie webhook POST | n8n webhook /gumroad/purchase | Achat confirme |
| 8 | n8n identifie le pack et prepare l'email | n8n workflow | Webhook recu |
| 9 | Client recoit le pack par email | automat@vazbolotaconsulting.fr | Envoi automatique |
| 10 | Client suit le guide et installe | Guide PDF / Markdown | - |

### Metriques a suivre

| Metrique | Outil de suivi | Objectif |
|----------|---------------|----------|
| Visiteurs blog | Google Analytics / Plausible | > 500/mois a 6 mois |
| Taux clic CTA article → landing | UTM + Analytics | > 8% |
| Taux conversion landing → achat | Gumroad analytics | > 3% |
| Delai livraison post-achat | Logs n8n | < 2 minutes |
| Taux ouverture email livraison | SMTP tracking | > 90% |

---

## 4. Stack Technique

| Outil | Usage | Cout |
|-------|-------|------|
| **Kili CLI** | Deploiement des landing pages HTML depuis le repo Git | Gratuit / low-cost |
| **Claude Code** | Redaction SEO (articles blog, descriptions produits, meta) | Licence Anthropic |
| **Gumroad** | Paiement, facturation, TVA automatique | 10% par vente |
| **n8n** (self-hosted) | Livraison auto, CRM interne, webhooks | Gratuit (self-hosted) |
| **Gmail / SMTP** | Envoi emails via automat@vazbolotaconsulting.fr | Inclus Google Workspace |
| **Notion** | CRM ventes, suivi clients, base de connaissances | Gratuit ou Team |
| **GitHub** | Versioning workflows JSON, deploiement CI/CD | Gratuit (repo prive) |
| **Plausible** | Analytics respect RGPD (alternative GA) | ~9 EUR/mois |

### Pipeline de publication

```
1. Redaction contenu avec Claude Code (SEO-optimise)
2. Integration HTML dans le repo Git (clients/pack-*/landing/)
3. Deploiement via Kili CLI vers vazbolotaconsulting.fr
4. Mise a jour Gumroad (produit, prix, description)
5. Configuration webhook Gumroad → n8n
6. Test end-to-end : achat test → livraison email
```

### Structure de deploiement Kili

```
repo Git
|--- clients/pack-artisan/landing/       → vazbolotaconsulting.fr/packs/artisan/
|--- clients/pack-industrie/landing/     → vazbolotaconsulting.fr/packs/industrie/
|--- clients/notaire-premium/landing/    → vazbolotaconsulting.fr/packs/notaire/
|--- landing-pme-automation/             → vazbolotaconsulting.fr/ (accueil)
|--- blog/                               → vazbolotaconsulting.fr/blog/
```

---

## 5. Catalogue Produits - Prets a la Vente

### Pack Artisan - Automatisation TPE Batiment

| Element | Detail |
|---------|--------|
| **Cible** | Artisans batiment (plombier, electricien, menuisier...) 1-10 employes |
| **Prix** | A definir |
| **Plateformes** | n8n (6 workflows) + ByteChef (6 workflows) |
| **Landing page** | A creer dans clients/pack-artisan/landing/ |
| **Gumroad** | Produit a creer |

**6 workflows inclus :**

| # | Workflow | Fichiers |
|---|----------|----------|
| W1 | Demande de devis (lead capture RGPD) | `artisan-crm-demande-devis-v1.0.json` |
| W2 | Planification intervention (Calendar) | `artisan-planning-intervention-v1.0.json` |
| W3 | Rappels intervention J-1 | `artisan-rappel-intervention-v1.0.json` |
| W4 | Suivi post-intervention + avis Google | `artisan-suivi-post-intervention-v1.0.json` |
| W5 | Relance devis non signes (7j / 30j) | `artisan-relance-devis-v1.0.json` |
| W6 | Qualification IA leads (Anthropic Claude) | `artisan-ai-qualif-lead-v1.0.json` |

**Livrables supplementaires :** guide d'installation, schema Notion (2 bases), conformite RGPD

**Statut : PRET** - 12 fichiers JSON + guide installation + brief complet

---

### Pack Industrie 4.0 - L'Usine Intelligente

| Element | Detail |
|---------|--------|
| **Cible** | TPE/PME industrielles (usinage, tolerie, injection) 3-50 salaries |
| **Prix** | 149 EUR HT |
| **Plateforme** | n8n uniquement (approche code-first) |
| **Landing page** | `clients/pack-industrie/landing/index.html` (existante) |
| **Gumroad** | Produit a creer |

**3 modules / 5 workflows :**

| Module | Contenu | Fichiers cles |
|--------|---------|---------------|
| 01 - Gestion des stocks | Auto-reorder fournisseurs, seuils critiques | `notion-setup.md` + `logic-n8n.js` |
| 02 - Suivi de production | Alertes echeances, verif pre-prod, notifications | `notion-of-config.md` + 3 fichiers JS |
| 03 - Maintenance preventive | Alertes revisions par criticite | `notion-machinery-setup.md` + `preventive-logic.js` |

**Livrables supplementaires :** 3 bases Notion (45 proprietes, 12+ vues), 4 code nodes JS, guide installation, guide triggers

**Statut : PRET** - Page de vente redigee, landing page existante, tous les fichiers presents

---

### Pack Notaire Premium - Automatisation & IA

| Element | Detail |
|---------|--------|
| **Cible** | Etudes notariales, 5-15 collaborateurs |
| **Prix** | 249 EUR HT |
| **Plateforme** | n8n uniquement |
| **Landing page** | `clients/notaire-premium/landing/index.html` (existante) |
| **Gumroad** | Lien actif : `vazbolota.gumroad.com/l/pcffpq` |

**3 workflows IA :**

| # | Workflow | Fichier |
|---|----------|---------|
| W1 | Extracteur IA de compromis PDF | `notaire-ia-extracteur-v1.0.json` |
| W2 | Chasseur de pieces manquantes (relances auto) | `notaire-relance-documents-v1.0.json` |
| W3 | Alertes delais SRU automatiques | `notaire-alerte-sru-v1.0.json` |

**Statut : EN VENTE** - Lien Gumroad actif, landing page deployee

---

### Pack Notaire Starter (base)

| Element | Detail |
|---------|--------|
| **Cible** | Etudes notariales debutant en automatisation |
| **Prix** | A definir (< Pack Premium) |
| **Plateforme** | n8n |
| **Landing page** | A creer |
| **Gumroad** | Produit a creer |

**3 workflows :**

| # | Workflow | Fichier |
|---|----------|---------|
| W1 | Capture leads RGPD | `notaire-crm-lead-capture-rgpd-v1.0.json` |
| W2 | Prise de RDV en ligne | `notaire-appointment-booking-v1.0.json` |
| W3 | Rappels RDV automatiques | `notaire-appointment-reminder-v1.0` |

**Statut : PRET** (workflows existants, pas encore commercialise separement)

---

## 6. Priorites de Lancement

| Priorite | Action | Effort | Impact |
|----------|--------|--------|--------|
| **P0** | Creer le workflow n8n de livraison auto (Gumroad webhook → email) | 2h | Critique |
| **P1** | Creer landing page Pack Artisan | 3h | Fort (nouveau produit) |
| **P1** | Creer produit Gumroad Pack Artisan + Pack Industrie | 1h | Fort |
| **P2** | Deployer les 3 landing pages via Kili CLI | 2h | Fort |
| **P2** | Configurer automat@vazbolotaconsulting.fr (alias Gmail) | 30min | Moyen |
| **P3** | Rediger 3 articles blog SEO avec Claude Code | 4h | Moyen (SEO long terme) |
| **P3** | Configurer analytics (Plausible) | 30min | Suivi |
| **P4** | Creer landing page accueil hub (refonte landing-pme-automation) | 3h | Image de marque |
| **P4** | Commercialiser le Pack Notaire Starter separement | 1h | Revenu additionnel |

---

## 7. Recapitulatif

| Pack | Prix | Workflows | Statut | Gumroad | Landing |
|------|------|-----------|--------|---------|---------|
| Notaire Premium | 249 EUR HT | 3 (IA) | EN VENTE | Actif | Existante |
| Industrie 4.0 | 149 EUR HT | 5 | PRET | A creer | Existante |
| Artisan | A definir | 6 x 2 plateformes | PRET | A creer | A creer |
| Notaire Starter | A definir | 3 | PRET | A creer | A creer |

**Total produits prets : 4 packs / 23 workflows uniques**

## FOCUS OFFRE : Le Pack "Immo-Furtif" (Audit & Acquisition)

### Probleme Client
Les agences immobilieres perdent 30% de leurs leads parce que leurs emails finissent en SPAM (mauvaise config SPF/DKIM) et passent des heures a copier-coller des annonces manuellement.

### Ma Solution (Le Workflow)
1. **Scraping Furtif** : Extraction quotidienne des nouvelles agences et annonces sans blocage (Gestion 429 & User-Agents).
2. **Audit Flash** : Verification automatique de la sante technique de leur domaine.
3. **Approche Automatisee** : Envoi d'un email d'audit personnalise via mon infrastructure OVH securisee.

### Prix suggere
- **Setup initial** : 450EUR (Mise en place du workflow)
- **Abonnement** : 99EUR/mois (Maintenance et rapport de leads hebdomadaire)

---

## FOCUS OFFRE : Le Pack "Artisan-Connect" (Secretariat IA)

### Modele d'Email (Cold Outreach)
Objet : Question planning pour {{ json.nom }}

Bonjour,

Je suis tombe sur votre fiche, vous semblez avoir de bons retours mais je n'ai pas trouve votre module de reservation en ligne.

Est-ce que vous gerez encore vos rendez-vous manuellement par telephone ?

J'installe des systemes automatises (n8n/IA) qui :
1. Repondent a vos clients par SMS/Email 24h/24.
2. Qualifient le besoin (type de travaux).
3. Prennent le RDV directement dans votre agenda.

Cela vous eviterait de rater des chantiers quand vousetes deja en intervention.

Disponible pour un test de 5 min ?

Cordialement,
Expert Automatisation Vazbolota
---
