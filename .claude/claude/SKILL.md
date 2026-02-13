---
name: review
description: Revue de code structurée pour ce repo, selon les règles de .claude/rules/review-rules.md.
disable-model-invocation: true
---

# Revue de code pour ce repo

---
name: review
description: Revue de code structurée pour ce repo, selon les règles de .claude/rules/review-rules.md.
disable-model-invocation: true
---

# Revue de code pour ce repo

Tu suis les règles définies dans `.claude/rules/review-rules.md`.

1. Analyse rapidement le contexte du fichier ou du diff (but du workflow, type de données, intégrations).
2. Liste les problèmes critiques :
   - Bugs potentiels.
   - Risques en production (perte de données, envoi d’emails multiples, double facturation, etc.).
   - Problèmes de sécurité ou de conformité (RGPD, accès non contrôlés).
3. Liste les problèmes de robustesse :
   - Gestion d’erreurs et retries.
   - Cas limites non gérés.
   - Logs insuffisants ou peu exploitables.
4. Propose des améliorations :
   - Lisibilité, nommage, factorisation.
   - Découpage en fonctions/nœuds plus clairs.
   - Commentaires et documentation.
5. Donne toujours des corrections concrètes :
   - Exemple de JSON n8n corrigé.
   - Exemple de code modifié.
6. Termine par un récap en bullet points :
   - Points critiques à corriger en priorité.
   - Améliorations recommandées.
   - Suggestions facultatives.

Tu réponds toujours en français, avec des explications pédagogiques et concrètes.
## 🧩 Collaboration avec Kilo CLI (Optimisation de Contexte)

Pour maximiser l'efficacité de ma fenêtre de contexte, l'utilisateur applique une stratégie "Kilo-First" :

- **Rôle de Kilo CLI :** Analyse préliminaire, résumé de logs volumineux, recherche théorique et extraction de snippets.
- **Mon Rôle (Claude) :** Exécution de haute précision, modification de fichiers et gestion de l'architecture complexe.

### Protocole d'interaction :
1. **Économie de Tokens :** Si une tâche demande l'analyse d'un fichier trop lourd ou d'un historique de logs étendu, je dois suggérer à l'utilisateur de passer par Kilo CLI pour obtenir un résumé technique d'abord.
2. **Input Structuré :** Je privilégie le travail sur les résumés fournis par Kilo plutôt que sur les données brutes massives.
3. **Focus Exécution :** Je délègue les explications pédagogiques longues à Kilo pour me concentrer sur la résolution technique immédiate dans le projet BTP.

