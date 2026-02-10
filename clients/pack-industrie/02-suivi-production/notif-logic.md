# Logique de notifications - Ordres de Fabrication

> Guide technique pour choisir le bon trigger n8n selon le type de changement a surveiller.

---

## Vue d'ensemble du workflow

```
                    ┌──────────────────────┐
                    │  Base Notion "OF"    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼───────┐ ┌─────▼──────┐ ┌───────▼────────┐
     │ Webhook Notion  │ │ Schedule   │ │ Notion Polling │
     │ (temps reel)    │ │ (cron)     │ │ (intervalle)   │
     └────────┬───────┘ └─────┬──────┘ └───────┬────────┘
              │                │                │
              ▼                ▼                ▼
     Changement de      Verification      Surveillance
     statut instantane   des echeances    des modifications
```

---

## Strategie par evenement

### 1. Changement de statut → Webhook Notion

| Parametre | Valeur |
|-----------|--------|
| **Trigger n8n** | Webhook |
| **Quand l'utiliser** | Notification temps reel a chaque transition de statut |
| **Latence** | < 5 secondes |

**Configuration :**

1. Dans n8n, creer un noeud **Webhook** (methode POST)
2. Copier l'URL du webhook
3. Dans Notion, aller dans **Settings & Members** > **Connections** > **Develop or manage integrations**
4. Configurer un webhook sortant pointant vers l'URL n8n

**Cas d'usage :**

| Transition | Action declenchee |
|------------|-------------------|
| `1 - Planifie` → `2 - En preparation` | Email interne au responsable : "OF lance, verifier matieres" |
| `2 - En preparation` → `3 - En production` | Email interne : "Production demarree sur [Ligne]" |
| `3 - En production` → `4 - Controle qualite` | Email equipe QC : "OF pret pour controle" |
| `4 - Controle qualite` → `5 - Termine` | Email client : "Votre commande est prete a l'expedition" |

**Avantage** : Reaction instantanee, pas de delai.
**Inconvenient** : Necessite l'API Notion (plan Team/Enterprise) ou une automation Notion tierce (Zapier, Make) comme relais si le plan ne supporte pas les webhooks natifs.

**Alternative sans webhook natif Notion :**

Si votre plan Notion ne supporte pas les webhooks, utilisez une **automation Notion** (bouton ou automation de base de donnees) qui appelle un webhook n8n via l'action "Send webhook" ou passez par Make/Zapier comme intermediaire.

---

### 2. Verification des echeances → Schedule Trigger (Cron)

| Parametre | Valeur |
|-----------|--------|
| **Trigger n8n** | Schedule Trigger |
| **Quand l'utiliser** | Scan periodique des echeances pour detecter les OF Urgent/Tendu |
| **Latence** | Selon la frequence configuree |

**Configuration recommandee :**

```
┌─────────────────────┬──────────────────────────────┐
│ Frequence           │ Expression cron              │
├─────────────────────┼──────────────────────────────┤
│ Toutes les heures   │ 0 * * * *                    │
│ (recommande)        │                              │
├─────────────────────┼──────────────────────────────┤
│ Toutes les 30 min   │ */30 * * * *                 │
│ (production intense)│                              │
├─────────────────────┼──────────────────────────────┤
│ 3x par jour         │ 0 8,13,17 * * 1-5           │
│ (eco API)           │ (8h, 13h, 17h en semaine)    │
└─────────────────────┴──────────────────────────────┘
```

**Workflow complet :**

```
[Schedule Trigger]
    → [Notion - Get DB Items] (filtre: Statut != "5 - Termine")
    → [Code Node: check-deadlines.js]
    → [IF: priorite == "URGENT"]
        → OUI: [Send Email] + [Slack Message]
        → NON: [IF: priorite == "TENDU"]
            → OUI: [Send Email]
            → NON: (rien)
```

**Avantage** : Simple, fiable, pas de dependance webhook.
**Inconvenient** : Delai entre l'apparition du probleme et la detection (jusqu'a 1 cycle).

**C'est le trigger utilise par `check-deadlines.js`.**

---

### 3. Surveillance des modifications → Notion Trigger (Polling)

| Parametre | Valeur |
|-----------|--------|
| **Trigger n8n** | Notion Trigger (Database - Page Updated) |
| **Quand l'utiliser** | Reagir a toute modification d'un OF (pas seulement le statut) |
| **Latence** | Depend de l'intervalle de polling (defaut : 1 min) |

**Configuration :**

1. Dans n8n, ajouter un noeud **Notion Trigger**
2. Selectionner **Event** : `Page Updated in Database`
3. Selectionner la base : **Ordres de Fabrication**
4. n8n interroge Notion a intervalle regulier et detecte les pages modifiees

**Cas d'usage :**

| Modification detectee | Action |
|----------------------|--------|
| Changement de responsable | Notifier le nouveau responsable |
| Modification de l'echeance | Recalculer la priorite et alerter si necessaire |
| Ajout d'une note | Logger le changement pour tracabilite |

**Avantage** : Capture toute modification, pas seulement les statuts.
**Inconvenient** : Consomme des appels API Notion a chaque cycle de polling. Ne distingue pas quel champ a change (il faut comparer avec l'etat precedent dans le script).

---

## Recommandation par scenario

| Scenario | Trigger recommande | Justification |
|----------|-------------------|---------------|
| **Alerte echeance proche** | Schedule (cron) | Scan periodique fiable, pas besoin de temps reel |
| **Notification client "commande prete"** | Webhook | Le client doit etre notifie immediatement |
| **Email equipe QC "a controler"** | Webhook ou Polling | Temps reel preferable, polling acceptable |
| **Rapport quotidien de production** | Schedule (cron 1x/jour) | Pas besoin de temps reel |
| **Escalade OF en retard** | Schedule (cron toutes les heures) | Detection reguliere suffit |
| **Suivi modification echeance** | Notion Polling | Seul moyen de detecter ce type de changement |

---

## 4. Pre-check stock avant production → Notion Polling + Cross-reference

| Parametre | Valeur |
|-----------|--------|
| **Trigger n8n** | Notion Trigger (Page Updated) |
| **Script** | `stock-pre-check.js` |
| **Quand** | Un OF passe au statut `2 - En preparation` |
| **Objectif** | Bloquer la mise en production si les matieres sont insuffisantes |

**Principe :**

Lorsqu'un OF passe au statut "2 - En preparation", le workflow doit verifier
les niveaux de stock des matieres requises **AVANT** que l'OF ne passe au statut
"3 - En production". Si au moins une matiere est en statut `CRITIQUE` ou
`A commander`, une alerte **"Approvisionnement necessaire"** est envoyee au
responsable production.

> Ce workflow agit comme un **verrou logique** : il ne bloque pas techniquement
> le changement de statut dans Notion, mais il **alerte immediatement** le
> responsable pour qu'il ne lance pas la production sans les matieres.

**Prerequis Notion :**

Ajouter une propriete a la base "Ordres de Fabrication" :

| Propriete | Type | Exemple |
|-----------|------|---------|
| **Matieres requises** | Text | `ACR-001, PLA-042, CHM-007` |

> Les references doivent correspondre exactement au champ "Reference matiere"
> de la base "Stock Matieres" (module 01-gestion-stocks).

**Workflow complet :**

```
[Notion Trigger: Page Updated dans "Ordres de Fabrication"]
    → [IF: Statut == "2 - En preparation"]
        → OUI:
            → [Notion - Get DB Items: base "Stock Matieres" (tous les items)]
            → [Merge: combine l'OF (input 1) + les stocks (input 2)]
            → [Code Node: stock-pre-check.js]
            → [IF: danger == true]
                → OUI: [Send Email au responsable: "Approvisionnement necessaire"]
                → NON: (rien - matieres disponibles, production peut demarrer)
        → NON: (ignorer)
```

**Logique de danger (dans stock-pre-check.js) :**

Le script croise les references listees dans "Matieres requises" de l'OF avec
la base "Stock Matieres". Le flag `danger` est `true` si :

| Condition | Signification |
|-----------|---------------|
| Au moins 1 matiere en statut `CRITIQUE` | Stock <= seuil critique |
| Au moins 1 matiere en statut `A commander` | Stock <= seuil mini |
| Au moins 1 reference inconnue | Matiere non trouvee dans la base stock |

**Contenu de l'email d'alerte :**

- Sujet : `⚠ Approvisionnement necessaire AVANT production - OF [numero]`
- Corps : detail de l'OF + liste des matieres en rupture avec quantites manquantes, fournisseurs, delais et cout estime de reapprovisionnement
- Destinataire : le responsable production (ou un email interne configurable)

**Avantage** : Empeche de lancer une production sur des matieres insuffisantes.
**Inconvenient** : Necessite que les "Matieres requises" soient renseignees sur chaque OF.

---

## Recommandation par scenario

| Scenario | Trigger recommande | Justification |
|----------|-------------------|---------------|
| **Alerte echeance proche** | Schedule (cron) | Scan periodique fiable, pas besoin de temps reel |
| **Notification client "commande prete"** | Webhook | Le client doit etre notifie immediatement |
| **Email equipe QC "a controler"** | Webhook ou Polling | Temps reel preferable, polling acceptable |
| **Rapport quotidien de production** | Schedule (cron 1x/jour) | Pas besoin de temps reel |
| **Escalade OF en retard** | Schedule (cron toutes les heures) | Detection reguliere suffit |
| **Suivi modification echeance** | Notion Polling | Seul moyen de detecter ce type de changement |
| **Pre-check stock avant production** | Notion Polling + cross-ref | Doit se declencher des que l'OF passe en preparation |

---

## Combinaison recommandee pour le Pack Industrie

Pour une couverture complete, deployer **trois workflows** :

### Workflow A : Alertes echeances (check-deadlines.js)

```
Trigger   : Schedule - toutes les heures (0 * * * * en semaine)
Script    : check-deadlines.js
Sortie    : Email responsable + Slack si URGENT
Objectif  : Detecter les OF qui approchent de l'echeance
```

### Workflow B : Transitions de statut

```
Trigger   : Notion Trigger (Page Updated) - polling 2 min
Filtre    : Verifier si le champ "Statut" a change
Sortie    : Email selon la transition (voir tableau section 1)
Objectif  : Notifier les parties prenantes en temps reel
```

### Workflow C : Pre-check stock avant production (stock-pre-check.js)

```
Trigger   : Notion Trigger (Page Updated) - polling 2 min
Condition : Statut == "2 - En preparation"
Script    : stock-pre-check.js (cross-reference avec base Stock Matieres)
Sortie    : Email "Approvisionnement necessaire" si danger == true
Objectif  : Alerter AVANT la mise en production si matieres insuffisantes
```

> **Note** : Si votre plan Notion supporte les webhooks natifs, remplacez le polling des Workflows B et C par un webhook pour une latence quasi nulle.

---

## Limites API Notion a connaitre

| Parametre | Valeur |
|-----------|--------|
| Rate limit | 3 requetes / seconde par integration |
| Taille max reponse | 100 items par requete (paginer si > 100 OF) |
| Webhook natif | Disponible uniquement sur certains plans |

> Si vous avez plus de 100 OF actifs, ajoutez un filtre dans le noeud Notion pour ne recuperer que les OF non termines. Cela reduit le volume et evite la pagination.
