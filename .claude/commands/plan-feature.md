# id: plan-feature
# title: Plan de nouvelle feature (workflow)
# description: Conçoit un plan détaillé pour un nouveau workflow n8n/Make ou une grosse évolution.
# tags: [plan, feature, n8n, make]
# visibility: project

@rules/review-rules.md

Contexte :
- Projet d'automatisation pour clients (kiné, notaires, etc.).
- Les workflows existants sont critiques (rendez-vous, emails, formulaires, CRM).
- On veut d'abord un plan clair avant toute modification de JSON.

Tâche :
1. Reformule brièvement la demande métier en français.
2. Propose un plan de workflow structuré :
   - Triggers (origine des données, événements).
   - Étapes principales (par blocs/fonctions).
   - Gestion des erreurs et des retries.
   - Logging et observabilité.
   - Points RGPD / données sensibles.
3. Propose une architecture n8n/Make :
   - Liste des nœuds principaux (nom du nœud + rôle).
   - Variables / données importantes à suivre.
   - Intégrations externes (APIs, Google, CRM, etc.).
4. Donne des recommandations de tests :
   - Cas nominal.
   - Cas d'erreur.
   - Cas limites (volume, doublons, données manquantes).
5. Termine par :
   - Une checklist d'implémentation (étapes à suivre pour construire le workflow).
   - Une checklist de validation avant mise en production.
