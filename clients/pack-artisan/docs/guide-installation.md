# Guide d'Installation - Pack Artisan

**Pack d'automatisation pour artisans du bâtiment**
Version 1.0 | Vazbolota Consulting

---

## Prérequis

### Comptes et accès
- **Notion** : compte avec accès API (intégration interne)
- **Google Workspace** : compte Gmail + Google Calendar avec OAuth2
- **n8n** ou **Bytechef** : instance opérationnelle (cloud ou self-hosted)

### Outils côté client
- Site web avec formulaire de contact (ou tout système envoyant des webhooks POST)
- Fiche Google My Business (pour le lien avis Google)

---

## Étape 1 : Configuration des variables d'environnement

Copier les variables du `.env.example` (section "PACK ARTISAN") et personnaliser :

```env
# Identité de l'artisan
ARTISAN_NOM_ENTREPRISE=Durand Plomberie
ARTISAN_TELEPHONE=06 12 34 56 78
ARTISAN_EMAIL=contact@durand-plomberie.fr
ARTISAN_EMAIL_RGPD=rgpd@durand-plomberie.fr
ARTISAN_GOOGLE_REVIEW_LINK=https://g.page/r/CxxxxXxxxx/review

# Bases Notion
NOTION_DB_DEVIS_ARTISAN=<id-base-devis>
NOTION_DB_INTERVENTIONS_ARTISAN=<id-base-interventions>
```

### Obtenir le lien Google Review
1. Aller sur [Google Business Profile](https://business.google.com/)
2. Sélectionner l'établissement
3. Menu > "Demander des avis" > Copier le lien

---

## Étape 2 : Créer les bases Notion

### Base "Devis & Leads"

Créer une base de données Notion avec les propriétés suivantes :

| Propriété | Type Notion | Obligatoire |
|-----------|-------------|-------------|
| Client | Title | Oui |
| Lead ID | Text | Oui |
| Email | Email | Oui |
| Téléphone | Phone | Oui |
| Adresse Chantier | Text | Oui |
| Code Postal | Text | Oui |
| Type Travaux | Select | Oui |
| Description | Text | Non |
| Urgence | Select | Oui |
| Montant Devis | Number | Non |
| Statut | Status | Oui |
| Date Consentement RGPD | Date | Oui |
| Date Suppression Prévue | Date | Oui |
| Opposition Prospection | Checkbox | Oui |
| Source | Select | Oui |
| Date Devis Envoyé | Date | Non |

**Valeurs Select "Type Travaux"** : plomberie, electricite, menuiserie, peinture, chauffage, serrurerie, carrelage, maconnerie, couverture, autre

**Valeurs Select "Urgence"** : normale, urgente, tres_urgente

**Valeurs Status "Statut"** : Nouveau, Devis envoyé, Devis signé, Refusé, Expiré

**Valeurs Select "Source"** : site_web, telephone, bouche_a_oreille, autre

### Base "Interventions"

| Propriété | Type Notion | Obligatoire |
|-----------|-------------|-------------|
| Client | Title | Oui |
| Intervention ID | Text | Oui |
| Email | Email | Oui |
| Téléphone | Phone | Oui |
| Adresse | Text | Oui |
| Date Intervention | Date | Oui |
| Durée Prévue | Number | Oui |
| Statut | Status | Oui |
| Devis Lié | Relation | Non |
| Google Event ID | Text | Oui |
| Rappel Envoyé | Checkbox | Oui |
| Suivi Envoyé | Checkbox | Oui |
| Avis Google Demandé | Checkbox | Oui |

**Valeurs Status "Statut"** : Planifié, Rappel envoyé, Terminé, Annulé

**Relation "Devis Lié"** : vers la base "Devis & Leads"

### Intégration Notion API
1. Aller sur [developers.notion.com](https://developers.notion.com/)
2. Créer une intégration interne
3. Copier le token (`secret_xxxxx`)
4. Partager les deux bases avec l'intégration (bouton "..." > Connexions)
5. Récupérer les IDs des bases (dans l'URL : `notion.so/<workspace>/<DATABASE_ID>?v=...`)

---

## Étape 3 : Configuration Google OAuth2

### Gmail + Google Calendar
1. [Google Cloud Console](https://console.cloud.google.com/) > Créer un projet
2. Activer les APIs : Gmail API, Google Calendar API
3. Écran de consentement OAuth > Type "Externe" (ou "Interne" si Workspace)
4. Créer des identifiants OAuth 2.0 (type "Application Web")
5. Ajouter l'URL de callback de n8n/Bytechef
6. Récupérer Client ID et Client Secret

### Dans n8n
- Ajouter credential "Gmail OAuth2" avec les identifiants
- Ajouter credential "Google Calendar OAuth2" avec les mêmes identifiants
- Autoriser l'accès via le bouton "Connect"

### Dans Bytechef
- Aller dans Connections > Ajouter Gmail et Google Calendar
- Suivre le flux OAuth2

---

## Étape 4 : Importer les workflows

### Version n8n

1. Ouvrir n8n > Menu > Import from file
2. Importer dans l'ordre :
   - `workflows/n8n/artisan-crm-demande-devis-v1.0.json`
   - `workflows/n8n/artisan-planning-intervention-v1.0.json`
   - `workflows/n8n/artisan-rappel-intervention-v1.0.json`
   - `workflows/n8n/artisan-relance-devis-v1.0.json`
   - `workflows/n8n/artisan-suivi-post-intervention-v1.0.json`
3. Pour chaque workflow : associer les credentials (Notion, Gmail, Google Calendar)
4. Activer les workflows avec schedule trigger (W3, W4, W5)

### Version Bytechef

1. Ouvrir Bytechef > Projects > Import
2. Importer les 5 fichiers depuis `workflows/bytechef/`
3. Configurer les connexions (Notion, Gmail, Google Calendar)
4. Publier et activer

---

## Étape 5 : Connecter le formulaire du site web

### Webhook W1 - Demande de devis
Envoyer un POST vers l'URL du webhook avec ce payload :

```json
{
  "nom": "DUPONT",
  "prenom": "Marie",
  "email": "marie.dupont@example.com",
  "telephone": "06 12 34 56 78",
  "adresse_chantier": "12 rue de la Paix",
  "code_postal": "75001",
  "type_travaux": "plomberie",
  "description": "Fuite sous évier cuisine",
  "urgence": "urgente",
  "consentement_rgpd": true,
  "source": "site_web"
}
```

### Webhook W2 - Planification intervention
```json
{
  "nom": "DUPONT",
  "prenom": "Marie",
  "email": "marie.dupont@example.com",
  "telephone": "06 12 34 56 78",
  "adresse_chantier": "12 rue de la Paix",
  "type_travaux": "plomberie",
  "date_intervention": "2026-02-15",
  "heure_debut": "09:00",
  "duree_heures": 2,
  "description": "Réparation fuite évier",
  "devis_lie": "LEAD-xxx",
  "consentement_rgpd": true
}
```

---

## Étape 6 : Tests de validation

### Test W1 - Demande de devis
```bash
# Happy path
curl -X POST https://votre-n8n.com/webhook/artisan-demande-devis \
  -H "Content-Type: application/json" \
  -d '{"nom":"TEST","prenom":"Client","email":"test@example.com","telephone":"0612345678","adresse_chantier":"1 rue Test","code_postal":"75001","type_travaux":"plomberie","description":"Test","urgence":"normale","consentement_rgpd":true}'

# Refus RGPD
curl -X POST https://votre-n8n.com/webhook/artisan-demande-devis \
  -H "Content-Type: application/json" \
  -d '{"nom":"TEST","prenom":"Client","email":"test@example.com","consentement_rgpd":false}'

# Données invalides
curl -X POST https://votre-n8n.com/webhook/artisan-demande-devis \
  -H "Content-Type: application/json" \
  -d '{"nom":"TEST","email":"invalide","consentement_rgpd":true}'
```

### Test W2 - Planification
```bash
curl -X POST https://votre-n8n.com/webhook/artisan-planning-intervention \
  -H "Content-Type: application/json" \
  -d '{"nom":"TEST","prenom":"Client","email":"test@example.com","telephone":"0612345678","adresse_chantier":"1 rue Test","type_travaux":"plomberie","date_intervention":"2026-02-20","heure_debut":"09:00","duree_heures":2,"consentement_rgpd":true}'
```

### Vérifications à effectuer
- [ ] Email de confirmation reçu (W1, W2)
- [ ] Page Notion créée avec bonnes données (W1, W2)
- [ ] Événement Google Calendar créé avec adresse (W2)
- [ ] Rappel reçu la veille (W3) - tester en créant un événement pour demain
- [ ] Email de suivi reçu 2 jours après intervention terminée (W4)
- [ ] Lien avis Google fonctionnel dans l'email (W4)
- [ ] Relance reçue pour devis >7 jours (W5)
- [ ] Devis >30 jours marqué "Expiré" dans Notion (W5)
- [ ] Emails masqués dans les logs (`jo***@example.com`)
- [ ] Footer RGPD présent dans chaque email
- [ ] Refus RGPD renvoie erreur 400 (W1, W2)

---

## Personnalisation par client

### Ce qu'il faut adapter pour chaque artisan
1. **Variables d'environnement** : nom entreprise, téléphone, email, lien Google Review
2. **IDs Notion** : créer les 2 bases et renseigner les IDs
3. **Credentials Google** : OAuth2 du compte Gmail/Calendar de l'artisan
4. **Couleurs emails** (optionnel) : modifier les codes couleur dans les templates HTML
5. **Types de travaux** : ajouter/retirer des types dans le select Notion et dans le code de validation

### Intégration assistant virtuel
Ce pack est conçu pour être déclenché par un assistant virtuel via webhooks :
- L'assistant collecte les informations client par conversation
- Il envoie les données au webhook approprié (W1 ou W2)
- Il reçoit la réponse JSON (succès/erreur) et la communique au client
- Les workflows schedulés (W3, W4, W5) fonctionnent de manière autonome

---

## Conformité RGPD

Chaque workflow intègre :
- **Consentement explicite** : vérifié avant tout traitement
- **Minimisation** : seules les données nécessaires sont collectées
- **Traçabilité** : ID unique par opération (LEAD-xxx, INTERV-xxx, RAPPEL-xxx)
- **Droit d'opposition** : champ `opposition_prospection` respecté (W4, W5)
- **Logs anonymisés** : emails masqués (`jo***@example.com`)
- **Footer RGPD** : mention des droits dans chaque email
- **Conservation** : date de suppression prévue à 3 ans
- **Base légale** :
  - W1, W2, W3 : Exécution du contrat (Art. 6.1.b)
  - W4, W5 : Intérêt légitime avec droit d'opposition (Art. 6.1.f)

---

## Support

**Vazbolota Consulting**
- Email : consulting@vazbolota.fr
- Documentation technique : `docs/n8n-patterns.md`
- Checklist RGPD : `docs/rgpd-checklist.md`
