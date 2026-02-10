# Configuration Notion - Base "Parc Machines"

> Guide de configuration pas-a-pas pour creer la base de donnees Notion.
> Chaque propriete est detaillee avec son type, ses options et son role.

---

## Creer la base

1. Dans Notion, cliquer sur **+ Nouvelle page** > **Table** > **Nouvelle base de donnees**
2. Renommer la base : **Parc Machines**
3. Configurer les proprietes ci-dessous dans l'ordre

---

## Proprietes de la base

### 1. Machine (Titre)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Title (colonne par defaut) |
| **Exemple** | `TOUR-CNC-01`, `PRESSE-HYD-03`, `SOUDEUSE-ARC-02` |
| **Convention** | `TYPE-TECHNO-NN` (majuscules, tirets, numero sequentiel) |

> C'est le champ titre par defaut de Notion. Renommez-le en "Machine".

---

### 2. Designation

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Tour CNC Fanuc Robodrill`, `Presse hydraulique 200T Schuler` |

---

### 3. Localisation

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Select |
| **Options** | |

| Option |
|--------|
| Atelier A |
| Atelier B |
| Atelier C |
| Zone exterieure |

> Adaptez les options a vos locaux.

---

### 4. Frequence revision (jours)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Number |
| **Format** | Number |
| **Exemple** | `90` (= revision tous les 90 jours) |

> Intervalle en jours entre deux maintenances preventives.
> C'est cette valeur que le script n8n utilise pour calculer la prochaine echeance.

---

### 5. Derniere revision

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Date |
| **Format** | Date (JJ/MM/AAAA) |
| **Exemple** | `15/11/2025` |

> Date de la derniere maintenance effectuee. Mise a jour manuellement ou via workflow apres chaque intervention.

---

### 6. Prochaine revision (Formule)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Formula |
| **Formule** | Voir ci-dessous |

```
dateAdd(prop("Derniere revision"), prop("Frequence revision (jours)"), "days")
```

> Calcule automatiquement la date de la prochaine maintenance.

---

### 7. Jours restants (Formule)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Formula |
| **Formule** | Voir ci-dessous |

```
dateBetween(
  dateAdd(prop("Derniere revision"), prop("Frequence revision (jours)"), "days"),
  now(),
  "days"
)
```

> Nombre de jours avant la prochaine revision. Negatif si en retard.

---

### 8. Etat

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Select |
| **Options** | |

| Option | Couleur suggeree | Description |
|--------|-----------------|-------------|
| Operationnelle | Vert | Machine en fonctionnement normal |
| Maintenance planifiee | Bleu | Maintenance preventive programmee |
| En panne | Rouge | Arret non planifie, intervention corrective |
| Hors service | Gris | Machine retiree ou en attente de piece |

---

### 9. Criticite

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Select |
| **Options** | |

| Option | Description |
|--------|-------------|
| Haute | Arret = blocage de la production |
| Moyenne | Arret = ralentissement, contournable |
| Basse | Impact limite, machine secondaire |

> Utilisee par le script n8n pour prioriser les alertes.

---

### 10. Responsable maintenance

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Marc Lefevre`, `Equipe maintenance` |

---

### 11. Email responsable

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Email |
| **Exemple** | `maintenance@usine.fr` |

> Destinataire des alertes de maintenance preventive.

---

### 12. Prestataire externe

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `TechniServ SARL`, `SAV Fanuc France` |

> Laisser vide si la maintenance est effectuee en interne.

---

### 13. Cout derniere revision (EUR)

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Number |
| **Format** | Euro |
| **Exemple** | `1250.00` |

---

### 14. Notes

| Parametre | Valeur |
|-----------|--------|
| **Type Notion** | Text |
| **Exemple** | `Courroie a surveiller, bruit anormal signale le 05/01` |

---

## Vues recommandees

### Vue 1 : Alertes maintenance (par defaut)

| Parametre | Valeur |
|-----------|--------|
| **Type** | Table |
| **Filtre** | Etat != `Hors service` |
| **Tri** | Jours restants (Ascendant) - les plus urgentes en haut |
| **Colonnes visibles** | Machine, Designation, Etat, Derniere revision, Prochaine revision, Jours restants, Criticite, Responsable |

### Vue 2 : Kanban par etat

| Parametre | Valeur |
|-----------|--------|
| **Type** | Board (Kanban) |
| **Grouper par** | Etat |
| **Proprietes visibles** | Designation, Jours restants, Criticite |

### Vue 3 : Par criticite

| Parametre | Valeur |
|-----------|--------|
| **Type** | Table |
| **Filtre** | Criticite = `Haute` |
| **Tri** | Jours restants (Ascendant) |

### Vue 4 : Calendrier des revisions

| Parametre | Valeur |
|-----------|--------|
| **Type** | Calendar |
| **Propriete date** | Prochaine revision |

---

## Checklist de verification

- [ ] 14 proprietes creees avec les types corrects
- [ ] Formule "Prochaine revision" calcule bien Derniere revision + Frequence
- [ ] Formule "Jours restants" affiche un negatif pour une machine en retard
- [ ] Vue calendrier affiche les prochaines revisions
- [ ] Au moins 3 machines de test avec des echeances variees (passee, proche, lointaine)
- [ ] Emails responsables renseignes (necessaires pour le workflow n8n)
