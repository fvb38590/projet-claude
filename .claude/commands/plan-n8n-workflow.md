id: plan-n8n
title: Plan d’implémentation workflow n8n
id: plan-n8n
title: Plan d’implémentation workflow n8n
description: Créer un plan clair et structuré pour analyser, corriger ou améliorer un workflow n8n (API, Google, emails, etc.)
tags: [n8n, plan, workflow]
visibility: project

@rules/review-rules.md

Contexte :
- Je travaille sur des workflows n8n pour des clients (kine, notaires, etc.).
- Je veux éviter de modifier le workflow sans plan clair.
- Tu dois d’abord comprendre le besoin métier, puis proposer un plan d’action avant de toucher à la technique.

Tâche :
1. Commence par me poser 3 à 7 questions courtes :
   - sur le but du workflow (métier),
   - sur l’état actuel (ce qui marche / ne marche pas),
   - sur les contraintes (outils, délais, volume, notifications).
2. À partir de mes réponses et des fichiers/workflows fournis :
   - Fais un diagnostic rapide des points sensibles (authentification, mapping de données, logique, performances, robustesse).
3. Propose un plan d’implémentation en étapes numérotées (max 7 étapes) :
   - Pour chaque étape : objectif métier, nodes n8n concernés, actions à réaliser.
   - Indique clairement ce qui est à faire par moi (dans n8n) et ce que tu peux préparer (expressions, JSON, requêtes HTTP, texte d’email, etc.).
4. Ajoute une section “Plan de test” :
   - Scénarios de test concrets (données d’exemple, nodes à exécuter, ce qu’on doit observer dans n8n, Google, emails, etc.).
5. Tant que je n’ai pas validé le plan, ne propose pas de modifications détaillées de nodes.

Format attendu :
- Titre du workflow.
- Résumé métier (3–5 phrases max).
- Plan en étapes numérotées.
- Plan de test.
- Risques / points de vigilance.
