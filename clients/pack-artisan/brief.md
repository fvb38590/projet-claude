# Brief Client - Pack Artisan

**Date**: 04/02/2026
**Consultant**: Vazbolota Consulting
**Statut**: [x] En cours | [ ] Livré | [ ] Maintenance

---

## 1. Informations Client

| Champ | Valeur |
|-------|--------|
| Entreprise | Pack générique - Artisans du bâtiment |
| Secteur | Artisanat / BTP (plomberie, électricité, menuiserie, peinture, chauffage, serrurerie, carrelage, maçonnerie, couverture) |
| Contact principal | [À personnaliser par client] |
| Taille | 1-10 employés (TPE artisanale) |

---

## 2. Contexte & Besoin

### Situation actuelle
Les artisans gèrent leurs demandes de devis, planifications d'interventions et suivis clients manuellement (téléphone, papier, tableur). Pas de CRM structuré ni de processus automatisé.

### Problème à résoudre
- Perte de leads par manque de réactivité
- Oubli de relance des devis non signés
- Pas de rappels automatiques avant intervention
- Aucun suivi post-intervention ni collecte d'avis Google
- Non-conformité RGPD sur les données clients

### Objectif du projet
Automatiser le cycle complet : demande de devis → planification → rappel → suivi post-intervention → relance devis, avec conformité RGPD intégrée et collecte d'avis Google.

---

## 3. Périmètre Technique

### Outils existants
- [x] Google Workspace (Gmail, Calendar)
- [x] Notion (CRM artisan)
- [ ] Autre: Site web avec formulaire de contact

### Intégrations demandées
1. Formulaire site web → Notion : Capture de demandes de devis
2. Notion → Google Calendar : Planification interventions
3. Google Calendar → Gmail : Rappels J-1
4. Notion → Gmail : Suivi post-intervention + lien avis Google
5. Notion → Gmail : Relance devis non signés

### Volume de données
- Nombre de leads/contacts par mois: 20-100
- Nombre d'interventions par semaine: 5-20
- Pic d'activité: Septembre-Novembre, Mars-Mai

---

## 4. Contraintes

### RGPD
- [x] Données personnelles traitées (nom, email, téléphone, adresse chantier)
- [x] Consentement requis (formulaire de demande de devis)
- [x] Durée de conservation: 3 ans
- [x] Localisation données: France / UE (Notion + Google)

### Techniques
- Hébergement n8n/Bytechef: Cloud ou Self-hosted
- Disponibilité requise: Heures bureau (8h-18h, lun-sam)
- Temps de réponse max: 30 secondes (webhook)

### Budget & Délais
- Budget estimé: Pack standard
- Priorité: Haute

---

## 5. Livrables Attendus

- [x] 5 workflows n8n fonctionnels
- [x] 5 workflows Bytechef équivalents
- [x] Guide d'installation
- [x] Documentation RGPD intégrée
- [ ] Formation équipe (à planifier)

---

## 6. Schéma Notion

### Base "Devis & Leads"
| Propriété | Type | Valeurs |
|-----------|------|---------|
| Lead ID | rich_text | Auto-généré (LEAD-xxx) |
| Client | title | Nom complet |
| Email | email | |
| Téléphone | phone_number | |
| Adresse Chantier | rich_text | |
| Code Postal | rich_text | |
| Type Travaux | select | plomberie / electricite / menuiserie / peinture / chauffage / serrurerie / carrelage / maconnerie / couverture / autre |
| Description | rich_text | Max 500 caractères |
| Urgence | select | normale / urgente / tres_urgente |
| Montant Devis | number | En euros |
| Statut | status | Nouveau / Devis envoyé / Devis signé / Refusé / Expiré |
| Consentement RGPD | checkbox | |
| Date Consentement RGPD | date | |
| Date Suppression Prévue | date | +3 ans |
| Opposition Prospection | checkbox | |
| Source | select | site_web / telephone / bouche_a_oreille / autre |
| Date Devis Envoyé | date | Pour calcul relance |

### Base "Interventions"
| Propriété | Type | Valeurs |
|-----------|------|---------|
| Intervention ID | rich_text | Auto-généré (INTERV-xxx) |
| Client | title | Nom complet |
| Email | email | |
| Téléphone | phone_number | |
| Adresse | rich_text | Adresse chantier |
| Date Intervention | date | |
| Durée Prévue | number | En heures (1-4) |
| Statut | status | Planifié / Rappel envoyé / Terminé / Annulé |
| Devis Lié | relation | Relation vers base Devis & Leads |
| Google Event ID | rich_text | |
| Rappel Envoyé | checkbox | |
| Suivi Envoyé | checkbox | |
| Avis Google Demandé | checkbox | |

---

## 7. Workflows à Créer

### W1: Demande de devis (Lead capture)
**Objectif**: Capturer les demandes depuis le formulaire site web avec conformité RGPD
```
Webhook POST → Validation RGPD → Déduplication → Créer Lead Notion → Email confirmation → Réponse webhook
```
**Fichiers**:
- n8n: `workflows/n8n/artisan-crm-demande-devis-v1.0.json`
- Bytechef: `workflows/bytechef/artisan-crm-demande-devis-v1.0.json`

### W2: Planification intervention (RDV)
**Objectif**: Planifier une intervention après signature du devis
```
Webhook POST → Validation → Check dispo Calendar → Créer événement → Notion → Email confirmation
```
**Spécificités**: horaires 8h-18h, durées 1-4h, samedi possible, adresse chantier obligatoire
**Fichiers**:
- n8n: `workflows/n8n/artisan-planning-intervention-v1.0.json`
- Bytechef: `workflows/bytechef/artisan-planning-intervention-v1.0.json`

### W3: Rappels intervention (J-1)
**Objectif**: Envoyer un rappel email la veille de chaque intervention
```
Schedule 8h → Lister interventions J+1 Calendar → Filtrer → Email rappel → Log
```
**Fichiers**:
- n8n: `workflows/n8n/artisan-rappel-intervention-v1.0.json`
- Bytechef: `workflows/bytechef/artisan-rappel-intervention-v1.0.json`

### W4: Suivi post-intervention + Avis Google
**Objectif**: Envoyer un email de satisfaction 2 jours après intervention + lien avis Google
```
Schedule 10h → Query Notion interventions terminées J-2 → Vérifier opposition → Email satisfaction → Log
```
**Fichiers**:
- n8n: `workflows/n8n/artisan-suivi-post-intervention-v1.0.json`
- Bytechef: `workflows/bytechef/artisan-suivi-post-intervention-v1.0.json`

### W5: Relance devis non signés
**Objectif**: Relancer automatiquement les devis non signés après 7 jours, expirer après 30 jours
```
Schedule 9h → Query Notion devis envoyés >7j → Si <30j relance email → Si >30j marquer expiré → Log
```
**Fichiers**:
- n8n: `workflows/n8n/artisan-relance-devis-v1.0.json`
- Bytechef: `workflows/bytechef/artisan-relance-devis-v1.0.json`

---

## 8. Suivi Projet

| Date | Action | Statut |
|------|--------|--------|
| 04/02/2026 | Brief initial | Fait |
| 04/02/2026 | Création workflows n8n | En cours |
| 04/02/2026 | Création workflows Bytechef | En cours |
| 04/02/2026 | Guide d'installation | En cours |
| - | Recette & tests | À planifier |

---

## 9. Notes & Décisions

- Pack générique adaptable à tout artisan du bâtiment
- Disponible en versions n8n ET Bytechef
- RGPD intégré à chaque workflow (consentement, traçabilité, masquage logs)
- Durée conservation données: 3 ans (standard artisan)
- Lien avis Google à personnaliser par client dans les variables d'environnement

---

**Contact Vazbolota**: consulting@vazbolota.fr
