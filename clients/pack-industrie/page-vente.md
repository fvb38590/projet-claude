# L'Usine Intelligente : Pack Zéro Panne, Zéro Rupture, Zéro Retard

**Automatisez votre atelier en 1 journée. 5 workflows n8n + 3 bases Notion prêtes à l'emploi.**

---

## Le problème que vous connaissez trop bien

Vous gérez une TPE/PME industrielle. Chaque matin, c'est la même incertitude :

- **"On a encore du stock de PLA-042 ?"** — Personne ne sait vraiment. Le fichier Excel date de jeudi dernier.
- **"La CNC, c'est quand la prochaine révision ?"** — Le post-it sur le tableau a disparu.
- **"Le client Durand, on livre quand ?"** — L'OF traîne quelque part entre la prépa et le contrôle qualité.

Le résultat ? Des arrêts machines imprévus, des ruptures de stock en pleine production, des retards de livraison. Et à chaque fois, la même addition :

> **Un arrêt machine non planifié coûte entre 5 000 et 20 000 € par jour** à une PME industrielle (source : cabinet McKinsey, étude maintenance prédictive).

---

## La solution : 3 piliers, 5 workflows, 0 paperasse

### Pilier 1 — Gestion des stocks : ne plus jamais produire à vide

**Le workflow surveille vos niveaux de matières premières en continu.** Quand un seuil critique est atteint, il calcule automatiquement la quantité à commander (stock cible + 20% de marge de sécurité), génère un bon de commande professionnel et l'envoie directement à votre fournisseur par email.

**Ce que ça change concrètement :**

- Fini les inventaires manuels hebdomadaires → **2h/semaine récupérées**
- Fini les ruptures qui bloquent la chaîne → **1 arrêt de production évité = 5 000 à 15 000 € préservés**
- Vos délais fournisseurs sont intégrés : la commande part *avant* que le stock ne soit à zéro

> *Inclus : base Notion "Stock Matières" (17 champs), 3 vues pré-configurées (Alertes, Par fournisseur, Inventaire complet), code node n8n prêt à copier.*

---

### Pilier 2 — Suivi de production : chaque OF piloté du début à la livraison

**3 workflows interconnectés** qui transforment votre suivi de fabrication :

1. **Alertes échéances** (toutes les heures) — Classe automatiquement vos OF en 🔴 Urgent (<24h), 🟠 Tendu (<72h), 🟢 Normal. Les alertes partent par email *et* Slack pour les urgences.

2. **Vérification pré-production** — Quand un OF passe en "Préparation", le système croise automatiquement les matières requises avec votre stock réel. Matière manquante ? L'alerte part *avant* de lancer la production, pas après.

3. **Notifications de transitions** — Chaque changement de statut (Planifié → Préparation → Production → Contrôle QC → Terminé) déclenche une notification ciblée : le responsable production, l'équipe QC, puis le client final à l'expédition.

**Ce que ça change concrètement :**

- Fini les OF "oubliés" entre deux postes → **réduction des retards de livraison de 40 à 60%**
- Le client reçoit un email automatique quand sa commande est prête → **zéro appel de relance à gérer**
- La vérification croisée stock/OF élimine les lancements de production voués à l'échec → **3 à 5h/semaine de coordination en moins**

> *Inclus : base Notion "Ordres de Fabrication" (14 champs + formules de priorité), 2 code nodes n8n, guide de configuration des triggers.*

---

### Pilier 3 — Maintenance préventive : la panne qui n'arrive jamais

**Chaque matin à 7h, le workflow analyse votre parc machines.** Il calcule les jours restants avant chaque révision, croise avec la criticité de l'équipement, et envoie un rapport priorisé à votre responsable maintenance.

- **EN RETARD** : révision dépassée → alerte rouge immédiate
- **IMMINENTE** (0-2 jours) : à planifier aujourd'hui
- **À PLANIFIER** (2-7 jours) : à anticiper cette semaine

Les machines haute criticité en retard déclenchent une alerte spéciale avec estimation du risque.

**Ce que ça change concrètement :**

- La maintenance préventive coûte **3 à 8 fois moins cher** que la maintenance curative (source : AFNOR)
- Un planning de révision respecté = **durée de vie des équipements prolongée de 20 à 40%**
- Fini le "on verra la semaine prochaine" → **1 panne évitée par trimestre = 5 000 à 20 000 € économisés**

> *Inclus : base Notion "Parc Machines" (14 champs), 4 vues pré-configurées (Alertes, Kanban par état, Par criticité, Calendrier des révisions), code node n8n.*

---

## Ce que contient le pack

| Élément | Détail |
|---|---|
| **Workflows n8n** | 5 workflows complets avec logique métier |
| **Code nodes JavaScript** | 4 scripts prêts à copier (extraction Notion, calculs, alertes) |
| **Bases Notion** | 3 bases de données (45 propriétés au total) avec formules automatiques |
| **Vues Notion** | 12+ vues pré-configurées (tableaux, kanban, calendrier) |
| **Guide d'installation** | Configuration pas à pas, de la création Notion au premier test |
| **Guide des triggers** | Stratégie webhook / cron / polling expliquée et comparée |
| **Conformité RGPD** | Masquage des emails dans les logs, traçabilité par ID unique, footer légal |

---

## Stack technique

- **Notion** : vos 3 bases de données centrales (gratuit ou plan Team)
- **n8n** : orchestration des workflows (self-hosted gratuit ou n8n Cloud)
- **Email SMTP / Gmail** : alertes automatiques vers fournisseurs, équipe, clients
- **Slack** *(optionnel)* : alertes urgentes en temps réel

**Aucune compétence en développement requise.** Chaque script est documenté ligne par ligne. Vous copiez, vous collez, vous configurez vos identifiants Notion — c'est opérationnel.

---

## Tarif

### 149 € HT — Licence unique, sans abonnement

Pas de frais mensuels. Pas de surcoût par utilisateur. Vous achetez le pack, il est à vous.

**Pourquoi c'est rentabilisé immédiatement :**

| Scénario | Économie estimée |
|---|---|
| 1 rupture de stock évitée | 5 000 à 15 000 € |
| 1 panne machine anticipée | 5 000 à 20 000 € |
| Heures de suivi manuel éliminées | ~5h/semaine × 45 €/h = **900 €/mois** |
| 1 retard client évité | Relation commerciale préservée (valeur inestimable) |

> **Il suffit d'une seule panne évitée ou d'une seule rupture de stock anticipée pour rentabiliser le pack 30 à 100 fois.**

À titre de comparaison : un logiciel GMAO (Gestion de Maintenance Assistée par Ordinateur) coûte entre 200 et 800 €/mois. Un ERP industriel, entre 500 et 2 000 €/mois. Ici, vous obtenez l'essentiel — le pilotage automatisé de vos 3 flux critiques — pour le prix d'une heure de maintenance curative.

---

## Pour qui est ce pack ?

- **Ateliers de fabrication** (usinage, tôlerie, injection, assemblage) de 3 à 50 salariés
- **Responsables de production** qui passent plus de temps à coordonner qu'à produire
- **Dirigeants de PME industrielles** qui veulent structurer sans investir dans un ERP
- **Responsables maintenance** fatigués des carnets papier et des post-it

## Ce que ce pack n'est pas

Ce n'est pas un ERP. Ce n'est pas un logiciel à installer. C'est un **système d'automatisation modulaire** que vous greffez sur des outils que vous utilisez peut-être déjà (Notion, Gmail, Slack). Vous gardez le contrôle total sur vos données et vos processus.

---

**Pack Industrie 4.0 — L'Usine Intelligente**
**149 € HT · Livraison immédiate · Sans abonnement**
