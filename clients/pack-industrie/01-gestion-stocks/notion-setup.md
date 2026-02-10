# Configuration Notion - Base "Stock Matieres"

> Guide de configuration pas-a-pas pour creer la base de donnees Notion.
> Chaque propriete est detaillee avec son type, ses options et son role.

---

## Creer la base

1. Dans Notion, cliquer sur **+ Nouvelle page** > **Table** > **Nouvelle base de donnees**
2. Renommer la base : **Stock Matieres**
3. Configurer les proprietes ci-dessous dans l'ordre

---

## Proprietes de la base

### 1. Reference matiere (Titre)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Title (colonne par defaut) |
| **Exemple** | `ACR-001`, `PLA-042`, `CHM-007` |
| **Convention** | 3 lettres categorie + tiret + numero sequentiel |

> C'est le champ titre par defaut de Notion. Renommez-le en "Reference matiere".

---

### 2. Nom matiere

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Acier inoxydable 304L`, `Granules PEHD`, `Solvant acetone` |

---

### 3. Categorie

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Select |
| **Options** | |

| Option | Couleur suggeree |
|--------|-----------------|
| Metaux | Gris |
| Plastiques | Bleu |
| Chimiques | Rouge |
| Consommables | Vert |
| Electronique | Violet |
| Emballage | Jaune |

---

### 4. Fournisseur principal

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `MetalPro SAS`, `ChemDistrib SARL` |

---

### 5. Email fournisseur

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Email |
| **Exemple** | `commandes@metalpro.fr` |

> Utilise par le workflow n8n pour envoyer automatiquement les commandes.

---

### 6. Telephone fournisseur

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Phone number |
| **Exemple** | `+33 4 72 00 00 00` |

---

### 7. Quantite en stock

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Number |
| **Format** | Number (pas de devise) |
| **Exemple** | `150` |

> Quantite actuelle en stock, dans l'unite de mesure definie.

---

### 8. Unite de mesure

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Select |
| **Options** | |

| Option |
|--------|
| kg |
| L |
| m |
| m2 |
| m3 |
| pieces |
| rouleaux |
| bobines |

---

### 9. Seuil mini

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Number |
| **Format** | Number |
| **Exemple** | `100` |

> Quantite minimale souhaitee en stock. Le workflow commande pour revenir a ce seuil + 20% de marge.

---

### 10. Seuil critique

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Number |
| **Format** | Number |
| **Exemple** | `30` |

> En dessous de ce seuil, le statut passe en CRITIQUE (alerte immediate).

---

### 11. Statut stock

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Formula |
| **Formule Notion** | Voir ci-dessous |

```
if(
  prop("Quantite en stock") <= prop("Seuil critique"),
  "CRITIQUE",
  if(
    prop("Quantite en stock") <= prop("Seuil mini"),
    "A commander",
    "OK"
  )
)
```

**Resultats possibles :**

| Valeur retournee | Signification |
|-----------------|---------------|
| `CRITIQUE` | Stock <= seuil critique. Commande urgente. |
| `A commander` | Stock <= seuil mini mais > seuil critique. Reapprovisionnement a planifier. |
| `OK` | Stock suffisant. Aucune action requise. |

> **Note** : Dans le workflow n8n, les valeurs filtrees sont `"CRITIQUE"` et `"A commander"` (sans emoji).
> Si vous preferez utiliser un champ Select au lieu d'une formule, creez un Select avec les options : `CRITIQUE`, `A commander`, `OK` et mettez-le a jour manuellement ou via un workflow.

---

### 12. Prix unitaire HT

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Number |
| **Format** | Euro |
| **Exemple** | `12.50` |

> Prix d'achat unitaire hors taxes, dans l'unite de mesure.

---

### 13. Cout commande estime (formule)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Formula |
| **Formule** | Voir ci-dessous |

```
round(
  max(0, prop("Seuil mini") * 1.2 - prop("Quantite en stock"))
  * prop("Prix unitaire HT")
  * 100
) / 100
```

> Estime le cout de la commande pour revenir au seuil mini + 20% de marge.

---

### 14. Delai livraison (jours)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Number |
| **Format** | Number |
| **Exemple** | `5` |

> Delai moyen de livraison par le fournisseur, en jours ouvrables.

---

### 15. Dernier reapprovisionnement

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Date |
| **Format** | Date (JJ/MM/AAAA) |
| **Exemple** | `15/01/2026` |

---

### 16. Emplacement stockage

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Entrepot A - Travee 3 - Etagere 2` |

---

### 17. Notes

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Attention: produit inflammable, stocker a l'ecart des sources de chaleur` |

---

## Vues recommandees

### Vue 1 : Alertes stock (par defaut)

| Parametre | Valeur |
|-----------|--------|
| **Type** | Table |
| **Filtre** | Statut stock != `OK` |
| **Tri** | Statut stock (Ascendant) pour voir CRITIQUE en premier |
| **Colonnes visibles** | Reference, Nom, Categorie, Quantite, Seuil mini, Statut stock, Fournisseur, Cout commande |

### Vue 2 : Par fournisseur

| Parametre | Valeur |
|-----------|--------|
| **Type** | Board (Kanban) |
| **Grouper par** | Fournisseur principal |
| **Colonnes visibles** | Reference, Nom, Quantite, Statut stock |

### Vue 3 : Inventaire complet

| Parametre | Valeur |
|-----------|--------|
| **Type** | Table |
| **Filtre** | Aucun |
| **Tri** | Categorie (A-Z), puis Reference (A-Z) |

---

## Checklist de verification

- [ ] 17 proprietes creees avec les types corrects
- [ ] Formule "Statut stock" fonctionne (tester avec une ligne ou stock < seuil critique)
- [ ] Formule "Cout commande estime" affiche un montant coherent
- [ ] Vue "Alertes stock" filtre correctement les lignes CRITIQUE et A commander
- [ ] Au moins 3 lignes de test creees pour valider les 3 statuts (OK, A commander, CRITIQUE)
- [ ] Emails fournisseurs renseignes (necessaires pour le workflow n8n)
