id: debug-api-n8n
title: Debug d’erreur API / OAuth dans n8n
description: Analyser une erreur d’API (Google, HTTP, webhooks, etc.) dans n8n et proposer un plan de correction
tags: [n8n, debug, api, oauth]
visibility: project

@rules/review-rules.md

Contexte :
- Je travaille avec des nodes n8n qui appellent des APIs (Google, HTTP, webhooks, CRM, etc.).
- Je reçois parfois des erreurs (401, 403, 404, 5xx, "The OAuth client was deleted", "invalid_client", etc.).
- Je veux comprendre la cause métier/technique et avoir un plan de correction concret.

Tâche :
1. Analyse le message d’erreur que je fournis (texte, JSON, stack trace n8n).
2. Identifie le type d’erreur :
   - Authentification / OAuth (credentials, client ID/secret, scopes, redirect URL).
   - Droits d’accès (permissions, partage de calendrier, quotas).
   - Configuration du node (paramètres manquants, mauvais format, mapping).
   - Problème externe (service down, limite d’API, etc.).
3. Explique en français simple :
   - La cause la plus probable.
   - Ce qu’il faut vérifier dans : n8n, Google Cloud / API externe, et la configuration métier.
4. Propose un plan de correction en étapes numérotées (max 7) :
   - Ce que je dois faire dans n8n (nodes, credentials, tests).
   - Ce qu’il faut ajuster côté API externe (Google Cloud, console, partage de calendrier, etc.).
5. Ajoute une section “Plan de test” pour vérifier que le problème est résolu.

Format attendu :
- Résumé de l’erreur (1–3 phrases).
- Analyse par catégories (auth, config, droits, externe).
- Plan de correction en étapes numérotées.
- Plan de test.
