# Configuration Notion - Base "Ordres de Fabrication"

> Guide de configuration pas-a-pas pour creer la base de donnees Notion.
> Chaque propriete est detaillee avec son type, ses options et son role.

---

## Creer la base

1. Dans Notion, cliquer sur **+ Nouvelle page** > **Table** > **Nouvelle base de donnees**
2. Renommer la base : **Ordres de Fabrication**
3. Configurer les proprietes ci-dessous dans l'ordre

---

## Proprietes de la base

### 1. Numero OF (Titre)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Title (colonne par defaut) |
| **Exemple** | `OF-2026-0142`, `OF-2026-0143` |
| **Convention** | `OF-AAAA-NNNN` (annee + numero sequentiel sur 4 chiffres) |

> C'est le champ titre par defaut de Notion. Renommez-le en "Numero OF".

---

### 2. Designation produit

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Chassis acier galvanise T200`, `Carter aluminium ref. CA-55` |

---

### 3. Client

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Durand Industries`, `Mecatech SAS` |

---

### 4. Email client

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Email |
| **Exemple** | `production@durand-industries.fr` |

> Utilise par le workflow n8n pour envoyer les notifications d'avancement.

---

### 5. Quantite commandee

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Number |
| **Format** | Number |
| **Exemple** | `250` |

---

### 6. Statut

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Select |
| **Options** | Voir tableau ci-dessous |

Les 5 etapes du cycle de production :

| Option | Couleur suggeree | Description |
|--------|-----------------|-------------|
| 1 - Planifie | Gris | OF cree, en attente de lancement |
| 2 - En preparation | Bleu | Matieres reservees, gamme de fabrication validee |
| 3 - En production | Jaune | Fabrication en cours sur la ligne |
| 4 - Controle qualite | Violet | Production terminee, en attente de validation QC |
| 5 - Termine | Vert | OF cloture, pret a expedier |

> **Transition normale** : 1 → 2 → 3 → 4 → 5
> Un OF n'est considere "termine" que lorsqu'il atteint le statut 5.
> Le workflow n8n filtre tous les OF dont le statut est **different de "5 - Termine"**.

---

### 7. Echeance

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Date |
| **Format** | Date et heure (JJ/MM/AAAA HH:MM) |
| **Exemple** | `15/02/2026 17:00` |

> Date limite de livraison au client. C'est cette date qui sert au calcul de la priorite.

---

### 8. Date creation

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Created time |
| **Format** | Date et heure |

> Propriete automatique Notion : date de creation de la ligne.

---

### 9. Responsable production

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Jean Dupont`, `Equipe B` |

---

### 10. Ligne de production

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Select |
| **Options** | |

| Option |
|--------|
| Ligne A |
| Ligne B |
| Ligne C |
| Sous-traitance |

> Adaptez les options aux lignes reelles de l'atelier.

---

### 11. Priorite (Formule)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Formula |
| **Formule Notion** | Voir ci-dessous |

```
if(
  prop("Statut") == "5 - Termine",
  "⚪ Cloture",
  if(
    dateBetween(prop("Echeance"), now(), "hours") <= 24,
    "🔴 Urgent",
    if(
      dateBetween(prop("Echeance"), now(), "hours") <= 72,
      "🟠 Tendu",
      "🟢 Normal"
    )
  )
)
```

**Resultats possibles :**

| Valeur | Condition | Action attendue |
|--------|-----------|-----------------|
| `🔴 Urgent` | Echeance dans moins de 24h, OF non termine | Alerte immediate par email + Slack |
| `🟠 Tendu` | Echeance dans moins de 72h, OF non termine | Alerte email au responsable |
| `🟢 Normal` | Echeance dans plus de 72h | Aucune alerte automatique |
| `⚪ Cloture` | Statut = "5 - Termine" | Ignore par le workflow |

> **Important** : `dateBetween` retourne un nombre negatif si l'echeance est deja depassee.
> Un OF en retard aura donc automatiquement la priorite `🔴 Urgent` (valeur negative < 24).

---

### 12. Retard (Formule)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Formula |
| **Formule** | Voir ci-dessous |

```
if(
  prop("Statut") == "5 - Termine",
  false,
  now() > prop("Echeance")
)
```

> Renvoie `true` si l'OF est en retard (echeance depassee et non termine). Utile pour le filtrage.

---

### 13. Heures restantes (Formule)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Formula |
| **Formule** | Voir ci-dessous |

```
dateBetween(prop("Echeance"), now(), "hours")
```

> Nombre d'heures avant l'echeance. Negatif si en retard. Utilise par le script n8n.

---

### 14. Notes

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Matiere premiere en attente - relance fournisseur le 10/02` |

---

## Vues recommandees

### Vue 1 : Tableau de bord production (par defaut)

| Parametre | Valeur |
|-----------|--------|
| **Type** | Table |
| **Filtre** | Statut != `5 - Termine` |
| **Tri** | Echeance (Ascendant) - les plus urgents en haut |
| **Colonnes visibles** | Numero OF, Designation, Client, Statut, Echeance, Priorite, Responsable, Ligne |

### Vue 2 : Kanban par statut

| Parametre | Valeur |
|-----------|--------|
| **Type** | Board (Kanban) |
| **Grouper par** | Statut |
| **Colonnes** | Les 5 statuts dans l'ordre 1 a 5 |
| **Proprietes visibles** | Designation, Client, Echeance, Priorite |

### Vue 3 : OF en retard

| Parametre | Valeur |
|-----------|--------|
| **Type** | Table |
| **Filtre** | Retard = `true` |
| **Tri** | Heures restantes (Ascendant) - les plus en retard en haut |

### Vue 4 : Par ligne de production

| Parametre | Valeur |
|-----------|--------|
| **Type** | Board (Kanban) |
| **Grouper par** | Ligne de production |
| **Filtre** | Statut = `3 - En production` |

---

## Checklist de verification

- [ ] 14 proprietes creees avec les types corrects
- [ ] Formule "Priorite" fonctionne (tester avec un OF dont echeance < 24h)
- [ ] Formule "Retard" renvoie true pour un OF dont echeance est passee
- [ ] Formule "Heures restantes" affiche un nombre negatif pour un OF en retard
- [ ] Vue Kanban affiche les 5 colonnes de statut dans l'ordre
- [ ] Au moins 4 OF de test couvrant les 4 niveaux de priorite
- [ ] Emails clients renseignes (necessaires pour le workflow n8n)
