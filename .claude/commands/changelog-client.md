id: changelog-client
title: Changelog & compte-rendu client
description: Génère un compte-rendu clair pour le client à partir des changements réalisés (workflows, scripts, config).
tags: [changelog, client, compte-rendu]
visibility: project

@rules/review-rules.md

Contexte :
- Projet d'automatisation pour des clients (kiné, notaires, etc.).
- Le client n'est pas développeur : il veut comprendre ce qui a changé, pourquoi, et l'impact métier.
- Le ton doit rester professionnel, rassurant et pédagogique, en français.
- Le compte-rendu doit pouvoir être copié-collé dans un email ou un document client sans retouche lourde.

Tâche :
1. À partir du diff Git, des explications ou des fichiers fournis :
   - Identifie les changements par thème (workflows n8n, emails, CRM, Google Calendar, logs, templates, etc.).
   - Pour chaque thème, résume ce qui a été modifié de façon compréhensible pour un non-technique.
   - Explique l'objectif métier de chaque changement (gain de temps, réduction d’erreurs, meilleure visibilité, conformité, etc.).
   - Mentionne les points de robustesse ajoutés (gestion d'erreurs, logs, alertes, sauvegardes, RGPD).

2. Structure le compte-rendu en sections clairement titrées :
   - Contexte / objectif.
   - Changements réalisés (groupés par thème).
   - Impacts pour le client (bénéfices concrets, avant/après).
   - Points de vigilance éventuels (limitations, dépendances, éléments à surveiller).
   - Prochaines étapes / suggestions (améliorations possibles, idées pour la suite).

3. Adapte le niveau de détail :
   - Pas de jargon technique inutile (éviter de parler de “nodes”, “payload”, “JSON” sans explication).
   - Si tu mentionnes des éléments techniques (webhook, n8n, API, credentials, etc.), ajoute une courte explication simple et métier.
   - Garde des phrases courtes et claires, comme dans un compte-rendu de consultant pour un dirigeant ou un professionnel de santé.

4. Ajoute une section “Tests à réaliser par le client” :
   - Liste 3 à 7 tests simples que le client peut faire lui-même.
   - Pour chaque test : étapes concrètes + résultat attendu (ex. “Remplir le formulaire X, vérifier la réception d’un email Y et la création d’un événement dans le calendrier Z”).

5. Termine par une section “À retenir” :
   - 3 à 4 bullet points maximum.
   - Chaque point doit résumer un bénéfice clé ou un changement important, en langage métier (ex. “Les RDV sont désormais confirmés automatiquement par email au patient.”).

Format attendu :
- Titre du projet ou du module (ex. “Mise à jour du système de prise de RDV en ligne”).
- Sections dans l’ordre : Contexte / objectif → Changements réalisés → Impacts pour le client → Points de vigilance → Prochaines étapes → Tests à réaliser → À retenir.
- Utilise des listes à puces quand c’est pertinent pour la lisibilité.
