# Checklist RGPD pour Workflows n8n

**Conformité Règlement Général sur la Protection des Données (UE 2016/679)**

---

## 1. Avant de Créer un Workflow

### Analyse d'impact (AIPD simplifiée)
- [ ] Quelles données personnelles sont traitées ?
- [ ] Quelle est la base légale ? (consentement, contrat, intérêt légitime)
- [ ] Quelle est la finalité du traitement ?
- [ ] Combien de temps conserver les données ?
- [ ] Qui a accès aux données ?

### Types de données sensibles (attention renforcée)
- Données de santé
- Opinions politiques/religieuses
- Données biométriques
- Origine ethnique
- Vie sexuelle
- Condamnations pénales

---

## 2. Collecte des Données

### Consentement
- [ ] Consentement explicite (checkbox non pré-cochée)
- [ ] Consentement horodaté (timestamp ISO 8601)
- [ ] Consentement traçable (ID unique généré)
- [ ] Finalité clairement expliquée
- [ ] Possibilité de retrait facile

### Minimisation
- [ ] Seules les données nécessaires sont collectées
- [ ] Pas de champs "au cas où"
- [ ] Données facultatives clairement indiquées

### Information
- [ ] Identité du responsable de traitement
- [ ] Finalités du traitement
- [ ] Durée de conservation
- [ ] Droits de la personne
- [ ] Contact DPO/responsable

---

## 3. Traitement des Données

### Sécurité technique
- [ ] HTTPS obligatoire (webhooks, APIs)
- [ ] Credentials en variables d'environnement (jamais hardcodés)
- [ ] Logs sans données personnelles en clair
- [ ] Accès n8n restreint (authentification)

### Traçabilité
- [ ] ID unique par enregistrement
- [ ] Date de création
- [ ] Date de dernière modification
- [ ] Source de la donnée
- [ ] Historique des consentements

### Validation
```javascript
// Exemple validation RGPD dans Code node
if (!input.consentement_rgpd || input.consentement_rgpd !== true) {
  throw new Error("RGPD_NO_CONSENT: Consentement non fourni");
}

// Générer ID traçable
const rgpdId = `DATA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

---

## 4. Droits des Personnes

### Droit d'accès (Art. 15)
- [ ] Export des données possible (JSON/CSV)
- [ ] Délai: 1 mois maximum
- [ ] Workflow d'export disponible

### Droit de rectification (Art. 16)
- [ ] Formulaire de mise à jour accessible
- [ ] Webhook de modification

### Droit à l'effacement (Art. 17)
- [ ] Procédure de suppression documentée
- [ ] Workflow de suppression sur demande
- [ ] Suppression dans TOUS les systèmes connectés

### Droit d'opposition (Art. 21)
- [ ] Champ `opposition_prospection` dans chaque base
- [ ] Vérifié AVANT tout envoi de communication
- [ ] Lien de désinscription dans chaque email

### Droit à la portabilité (Art. 20)
- [ ] Export format structuré (JSON)
- [ ] Données lisibles par machine

---

## 5. Conservation des Données

### Durées recommandées par secteur

| Secteur | Durée | Base légale |
|---------|-------|-------------|
| Prospects (pas de contrat) | 3 ans après dernier contact | Intérêt légitime |
| Clients actifs | Durée du contrat + 5 ans | Obligation légale |
| Notariat | 30 ans (actes) | Obligation légale |
| Factures | 10 ans | Obligation fiscale |
| Logs techniques | 1 an | Intérêt légitime |

### Implémentation n8n
```javascript
// Calculer date de suppression automatique
const dureeConservation = 3; // années
const dateSuppression = new Date();
dateSuppression.setFullYear(dateSuppression.getFullYear() + dureeConservation);

return {
  date_creation: new Date().toISOString(),
  date_suppression_prevue: dateSuppression.toISOString()
};
```

### Workflow de purge automatique
```
Schedule Trigger (mensuel)
├─ Notion Query: date_suppression_prevue < aujourd'hui
├─ Loop: Pour chaque enregistrement
│   ├─ Log: archivage avant suppression
│   ├─ Notion: Archive/Delete
│   └─ Log: confirmation suppression
└─ Email rapport: X enregistrements purgés
```

---

## 6. Transferts de Données

### Sous-traitants (APIs tierces)
- [ ] Vérifier localisation des serveurs (UE préféré)
- [ ] Clauses contractuelles types si hors UE
- [ ] Liste des sous-traitants documentée

### APIs courantes et conformité

| Service | Localisation | Conformité |
|---------|--------------|------------|
| Notion | USA | Clauses types + DPA |
| Google Workspace | USA/UE | DPA disponible |
| HubSpot | USA | Clauses types + DPA |
| Airtable | USA | Clauses types |
| Slack | USA | Clauses types + DPA |

---

## 7. Documentation Obligatoire

### Registre des traitements (simplifié)
Pour chaque workflow, documenter:
- Nom du traitement
- Finalité
- Catégories de données
- Catégories de personnes
- Destinataires
- Durée de conservation
- Mesures de sécurité

### Template registre
```markdown
## Workflow: [NOM]
- **Finalité**: [Description]
- **Base légale**: Consentement / Contrat / Intérêt légitime
- **Données**: Nom, Email, Téléphone, [autres]
- **Personnes**: Prospects / Clients / [autres]
- **Destinataires**: Notion, Gmail, [autres APIs]
- **Conservation**: X ans
- **Sécurité**: HTTPS, credentials env, logs anonymisés
```

---

## 8. En Cas de Violation de Données

### Procédure (72h max)
1. Identifier l'étendue de la violation
2. Documenter (quoi, quand, combien de personnes)
3. Notifier la CNIL si risque pour les droits
4. Informer les personnes concernées si risque élevé
5. Mettre en place mesures correctives

### Contact CNIL
- Site: https://www.cnil.fr
- Notification: https://notifications.cnil.fr

---

## 9. Checklist Rapide par Workflow

```markdown
## RGPD Check - [Nom Workflow]

### Collecte
- [ ] Consentement explicite requis
- [ ] Données minimisées
- [ ] Information fournie

### Traitement
- [ ] HTTPS uniquement
- [ ] Credentials sécurisés
- [ ] ID traçable généré
- [ ] Date suppression calculée

### Droits
- [ ] Export possible
- [ ] Modification possible
- [ ] Suppression possible
- [ ] Opposition vérifiée

### Documentation
- [ ] Registre mis à jour
- [ ] Durée conservation définie
```

---

**Référence**: RGPD (UE 2016/679) | **CNIL**: cnil.fr | **Mise à jour**: Janvier 2026
