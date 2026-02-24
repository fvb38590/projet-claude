# Brief Client - Notaire Exemple

**Date**: Janvier 2026
**Consultant**: Vazbolota Consulting
**Statut**: [x] En cours | [ ] Livré | [ ] Maintenance

---

## 1. Informations Client

| Champ | Valeur |
|-------|--------|
| Entreprise | Étude Notariale [Nom] |
| Secteur | Notariat |
| Contact principal | [À compléter] |
| Taille | 5-15 collaborateurs |

---

## 2. Contexte & Besoin

### Situation actuelle
- Gestion des demandes de contact par email manuel
- Suivi des rendez-vous sur agenda papier ou Outlook
- Pas de CRM centralisé
- Relances clients manuelles

### Problème à résoudre
- Perte de leads (demandes non traitées)
- Oubli de rappels de rendez-vous
- Manque de visibilité sur le pipeline de dossiers
- Temps perdu en tâches administratives répétitives

### Objectif du projet
1. Centraliser les demandes de contact dans Notion
2. Automatiser les accusés de réception
3. Envoyer des rappels de rendez-vous automatiques
4. Respecter strictement le RGPD (obligation notariale)

---

## 3. Périmètre Technique

### Outils existants
- [x] Google Workspace (Gmail, Calendar)
- [x] Notion (à déployer)
- [ ] Site web avec formulaire de contact

### Intégrations demandées
1. Formulaire web → Notion : Capture leads avec consentement RGPD
2. Notion → Gmail : Accusé de réception automatique
3. Calendar → Gmail : Rappels rendez-vous 48h avant

### Volume de données
- Nombre de leads/mois: 20-50
- Nombre de rendez-vous/semaine: 15-30
- Pic d'activité: Septembre-Octobre (rentrée immobilière)

---

## 4. Contraintes

### RGPD (CRITIQUE pour notariat)
- [x] Données personnelles traitées
- [x] Consentement explicite requis
- [x] Durée de conservation: 3 ans (prospects), 30 ans (actes)
- [x] Localisation données: UE uniquement si possible

### Techniques
- [x] Hébergement n8n: Self-hosted (confidentialité)
- [x] Disponibilité: Heures bureau (8h-19h)
- [x] HTTPS obligatoire

### Budget & Délais
- Budget: [À définir]
- Deadline: [À définir]
- Priorité: [x] Haute

---

## 5. Livrables Attendus

- [x] Workflow capture leads RGPD
- [ ] Workflow rappels rendez-vous
- [ ] Documentation utilisateur
- [ ] Formation équipe (2h)
- [ ] Support 3 mois

---

## 6. Workflows Créés

### Workflow 1: Capture Leads RGPD
**Objectif**: Capturer les demandes de contact avec conformité RGPD totale
```
Webhook → Validation RGPD → IF Consentement → Notion Create → Gmail Confirmation
                                    ↓ Non
                              Log Refus → Réponse Erreur
```
**Fichier**: `workflows/notaire-crm-lead-capture-rgpd-v1.0.json`
**Statut**: Livré

### Workflow 2: Rappels Rendez-vous J+1
**Objectif**: Envoyer rappels automatiques la veille du RDV
```
Trigger Quotidien 9h → Init Context & Dates → Google Calendar J+1 → Filtrer RDV avec Clients
    → Extraire Détails RDV → RDV à rappeler? → Envoyer Email Rappel → Log
    + Try/Catch → Error Handler → Slack Alert #errors
```
**Fichier**: Déployé sur n8n (pas exporté)
**Statut**: Livré ✓

### Workflow 3: Prise de RDV en ligne
**Objectif**: Permettre aux clients de réserver un créneau en ligne
```
Webhook (demande RDV) → Validation RGPD → Vérifier Disponibilité Calendar
    → IF disponible → Créer Event Calendar → Enregistrer Notion → Email Confirmation
    → IF indisponible → Réponse "créneau non disponible"
```
**Fichier**: `workflows/notaire-appointment-booking-v1.0.json`
**Statut**: Livré

---

## 7. Suivi Projet

| Date | Action | Statut |
|------|--------|--------|
| Jan 2026 | Brief initial | Fait |
| Jan 2026 | Workflow 1 livré | Fait |
| - | Workflow 2 | En attente |
| - | Formation | En attente |
| - | Mise en production | En attente |

---

## 8. Notes & Décisions

### Spécificités notariat
- Secret professionnel: aucune donnée dossier dans les logs
- Conservation 30 ans pour actes authentiques
- Double validation pour suppression de données

### Types d'actes à gérer
- achat_immobilier, vente_immobilier
- donation, succession, testament
- contrat_mariage, pacs, divorce
- creation_sci, pret_hypothecaire

---

**Contact Vazbolota**: [email] | [téléphone]
