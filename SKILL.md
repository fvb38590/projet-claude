---
name: plan-feature
description: Créer un plan détaillé pour une nouvelle fonctionnalité ou un gros changement avant toute écriture de code.
disable-model-invocation: true
---

# Plan de fonctionnalité pour ce repo

Tu aides à concevoir une fonctionnalité avant de toucher au code.
Tu travailles toujours dans le contexte du repo courant (automatisation n8n / APIs / CRM / Google Workspace).

## Quand utiliser ce skill

- Nouvelle fonctionnalité importante.
- Refonte d’un workflow n8n.
- Intégration avec un nouveau SaaS / API.
- Bug complexe qui nécessite plusieurs étapes de correction.

## Processus

1. **Clarifier la demande**
   - Commence par reformuler l’objectif en langage métier.
   - Pose 3 à 7 questions de clarification maximum si nécessaire (utilisateurs concernés, données, systèmes, contraintes réglementaires ou légales, volumétrie).

2. **Analyser le contexte existant**
   - Identifie les dossiers/fichiers concernés dans le repo (workflows n8n, scripts, docs clients, etc.).
   - Note les dépendances importantes : APIs, webhooks, CRM, emails, Google Workspace.

3. **Proposer un plan structuré**
   - Ne produis PAS de code.
   - Propose un plan sous forme de sections :
     - Objectifs métier.
     - Hypothèses et contraintes.
     - Risques principaux.
     - Plan technique en étapes numérotées.
     - Fichiers / workflows à créer ou modifier.
     - Données impactées (sources, destinations, transformations).

4. **Découper en tâches exécutables**
   - Transforme le plan en liste de tâches claire pour un dev :
     - Tâches 1, 2, 3… avec verbes d’action.
     - Pour chaque tâche : but, fichiers impactés, pièges à éviter.
   - Ajoute une petite checklist de validation en fin de plan.

5. **Attendre la validation**
   - Termine toujours par :
     - “Souhaites-tu que je commence à implémenter ce plan étape par étape, ou veux-tu d’abord le modifier ?”
   - N’édite JAMAIS le code tant que l’utilisateur n’a pas validé explicitement.

## Format de sortie

Toujours répondre en Markdown avec cette structure :

- `# Plan pour : [titre court de la feature]`
- `## Contexte & objectifs`
- `## Risques & contraintes`
- `## Plan technique détaillé`
- `## Tâches à exécuter`
- `## Checklist de validation`
D'après les sources sur la configuration des skills, voici le contenu technique à ajouter à la suite de votre texte actuel :
1. Ajout des instructions de workflow
Ajoutez ces lignes pour forcer Claude à analyser votre dépôt avant de proposer une solution :
## Instructions de travail
Ton objectif est de concevoir la fonctionnalité suivante : **$ARGUMENTS** [4, 5].

### Étape 1 : Analyse de l'existant
1. Utilise `ls -R` ou le tool `Glob` pour identifier les fichiers de configuration, les schémas de base de données ou les workflows n8n existants [1, 6, 7].
2. Lis impérativement le fichier `@CLAUDE.md` pour respecter les conventions de nommage et l'architecture du projet [8-10].

### Étape 2 : Conception de la Feature
Génère un plan détaillé incluant :
- **Matrice de Priorité :** Sépare les éléments critiques (MVP) des améliorations futures (V2/V3) [11, 12].
- **Architecture technique :** Décris les nouveaux endpoints d'API, les modifications de base de données et les intégrations Google Workspace requises [13, 14].
- **Modélisation TONL :** Utilise systématiquement le format **TONL** pour définir les schémas de données afin d'économiser 50% de jetons [15-17].

### Étape 3 : Validation interactive
- Avant de finaliser, pose **3 questions de clarification** à l'utilisateur s'il y a des ambiguïtés sur les permissions CRM ou les limites d'API [13, 18, 19].
- Ne commence aucune écriture de code tant que l'utilisateur n'a pas validé ce plan.

## Résultat attendu
Crée un fichier temporaire `FEATURE_PLAN.md` contenant la synthèse de ta réflexion [13].
