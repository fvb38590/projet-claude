# n8n Patterns & Best Practices - Vazbolota Consulting

**Référence technique consolidée pour l'automation n8n**

---

## 1. Architecture & Nodes Fréquents

### Nodes par priorité d'usage
1. **HTTP Request** - 90% des workflows (APIs Google, HubSpot, Notion, LinkedIn)
2. **Webhook** - Trigger primaire pour leads
3. **Google Sheets** - Source de données legacy clients
4. **Notion API** - CRM principal pour stockage
5. **Gmail** - Notifications et emails automatiques
6. **Code (Node.js)** - Logique métier complexe, transformations
7. **If/Else** - Routage conditionnel
8. **Set** - Mapping et transformation de variables
9. **Merge** - Combiner données multi-sources
10. **Error Handling (Try/Catch)** - Gestion d'erreurs robuste

### Nodes à intégrer
- HubSpot CRM, Airtable, Slack, LinkedIn Sales Navigator, Make (bridge)

---

## 2. Conventions de Nommage

### Workflows
```
[CLIENT]-[TYPE]-[FONCTION]-v[VERSION]

Exemples:
- notaire-crm-lead-qualification-v1.0
- generic-template-contact-sync-v1.0

Règles:
- Minuscules + tirets (pas d'espaces)
- Version sémantique (majeur.mineur)
- "generic" pour templates réutilisables
```

### Variables
```javascript
// Variables locales
camelCase: firstName, emailAddress, leadScore

// Variables d'environnement
UPPER_SNAKE_CASE: NOTION_API_KEY, N8N_WEBHOOK_URL

// Erreurs
errorCode: "NOTION_API_401_INVALID_KEY"
errorMessage: "Description explicite"
errorTimestamp: "ISO 8601"
```

---

## 3. Gestion d'Erreurs (Standard Obligatoire)

### Structure Try/Catch
```
Try/Catch Wrapper:
└─ Main Workflow Logic
   ├─ HTTP Requests with Retry (3x)
   ├─ Data Validation
   ├─ Set node avec logging
   └─ Final Output

Catch Block:
├─ Log error (code, message, timestamp, context)
├─ Classify error (API_ERROR, VALIDATION_ERROR, TIMEOUT)
├─ Decide: Retry? Alert? Ignore?
└─ Notify Slack #errors si production
```

### Logging JSON Standard
```javascript
// Début de workflow
workflow_context = {
  workflowName: "{{$workflow.name}}",
  executionId: "{{$execution.id}}",
  startTime: new Date().toISOString(),
  trigger: "{{$execution.startData.node}}"
}

// Chaque étape majeure
step_log = {
  status: "success|error",
  itemsProcessed: data.length,
  timestamp: new Date().toISOString(),
  duration_ms: Date.now() - startTime
}
```

---

## 4. Patterns Réutilisables

### Pattern 1: Pagination API Robuste
```
Set: allResults=[], currentPage=0, hasMore=true

Loop (While hasMore):
├─ HTTP: GET /api?page={{currentPage}}&limit=100
├─ Append response.data to allResults
├─ currentPage += 1
├─ hasMore = (response.data.length === 100)

Return: allResults
```

### Pattern 2: Déduplication Lead
```javascript
// Simple (email unique)
const existing = await notion.databases.query({
  filter: { property: "Email", email: { equals: input.email } }
});
if (existing.results.length > 0) return { duplicate: true };

// Robuste (email + fenêtre temporelle 5min)
const WINDOW = 5 * 60 * 1000;
const recent = await notion.databases.query({
  filter: {
    and: [
      { property: "Email", email: { equals: input.email } },
      { property: "Created", date: { after: new Date(Date.now() - WINDOW) } }
    ]
  }
});
```

### Pattern 3: Enrichissement API Externe
```
Input: {email: "john@acme.com"}
├─ Code: domain = email.split('@')[1]
├─ HTTP: GET api.company-search.io?domain={{domain}}
├─ Transform: extract company_name, size, industry
├─ Merge: {...input, company_info}
└─ Notion: Create enriched lead
```

### Pattern 4: OAuth2 Refresh Token (Gmail)
```
├─ Code: load refresh_token from env
├─ HTTP: POST oauth2.googleapis.com/token
│  └─ Params: grant_type=refresh_token
├─ Set: capture new access_token
├─ Gmail: use access_token
└─ Log: success + token_expiry
```

### Pattern 5: Google Calendar - Trigger Quotidien J+1
**Cas d'usage**: Rappels de RDV, préparation journalière, notifications anticipées

```
Architecture:
Schedule Trigger (9h quotidien)
    ↓
Code: Calcul fenêtre J+1
    ↓
Google Calendar: Liste événements
    ↓
Filter: Événements avec participants
    ↓
Code: Extraction détails
    ↓
Traitement (email, notification, etc.)
```

```javascript
// Node Code: Calcul dates J+1 pour Google Calendar API
const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);

// Fenêtre horaire complète du lendemain
const timeMin = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString();
const timeMax = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString();

// Context logging
const workflow_context = {
  workflowName: $workflow.name,
  executionId: $execution.id,
  startTime: now.toISOString(),
  trigger: "schedule",
  targetDate: tomorrow.toISOString().split('T')[0]
};

return { json: { timeMin, timeMax, workflow_context } };
```

```javascript
// Node Google Calendar - Configuration
{
  "resource": "event",
  "calendar": { "value": "primary", "mode": "list" },
  "returnAll": true,
  "options": {
    "timeMin": "={{ $json.timeMin }}",
    "timeMax": "={{ $json.timeMax }}",
    "singleEvents": true,
    "orderBy": "startTime"
  }
}
```

### Pattern 6: Filtrage et Extraction Événements Calendar
**Cas d'usage**: Filtrer RDV avec clients, extraire participants, formater dates FR

```javascript
// Node Filter: Événements avec participants
{
  "conditions": {
    "conditions": [{
      "leftValue": "={{ $json.attendees }}",
      "operator": { "type": "array", "operation": "notEmpty" }
    }]
  }
}
```

```javascript
// Node Code: Extraction détails RDV + RGPD
const items = $input.all();
const results = [];

for (const item of items) {
  const event = item.json;
  const attendees = event.attendees || [];

  for (const attendee of attendees) {
    // Ignorer l'organisateur
    if (attendee.organizer === true) continue;

    // Validation email (RGPD)
    if (!attendee.email) {
      console.log(`RGPD_WARNING: Participant sans email ignoré`);
      continue;
    }

    // Formatage date/heure FR
    const startDateTime = new Date(event.start.dateTime || event.start.date);
    const heureRdv = startDateTime.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris'
    });
    const dateRdv = startDateTime.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'Europe/Paris'
    });

    // ID traçable RGPD
    const rgpdTraceId = `RAPPEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    results.push({
      json: {
        eventId: event.id,
        titre: event.summary || 'Rendez-vous',
        lieu: event.location || 'À confirmer',
        dateRdv, heureRdv,
        clientEmail: attendee.email,
        clientNom: attendee.displayName || attendee.email.split('@')[0],
        rgpdTraceId
      }
    });
  }
}

// Gestion cas "aucun résultat"
if (results.length === 0) {
  return [{ json: { noResults: true, message: 'Aucun RDV trouvé' } }];
}
return results;
```

### Pattern 7: Email de Rappel Professionnel (Gmail)
**Cas d'usage**: Rappels RDV, confirmations, notifications clients

```javascript
// Configuration Gmail node
{
  "sendTo": "={{ $json.clientEmail }}",
  "subject": "Rappel : Votre rendez-vous du {{ $json.dateRdv }}",
  "emailType": "html",
  "message": "<!-- Template HTML -->",
  "options": { "appendAttribution": false },
  "onError": "continueErrorOutput"  // Important: gestion erreurs individuelles
}
```

```html
<!-- Template email professionnel avec RGPD -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, serif; color: #333; line-height: 1.6; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f8f9fa; }
    .rdv-box { background: white; border-left: 4px solid #1a365d; padding: 20px; margin: 20px 0; }
    .footer { font-size: 12px; color: #666; padding: 20px; border-top: 1px solid #ddd; }
    .rgpd { font-size: 10px; color: #999; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Rappel de Rendez-vous</h1>
  </div>
  <div class="content">
    <p>Bonjour {{ $json.clientNom }},</p>
    <p>Nous vous rappelons votre rendez-vous prévu <strong>demain</strong> :</p>
    <div class="rdv-box">
      <p><strong>{{ $json.titre }}</strong></p>
      <p>Date : {{ $json.dateRdv }}</p>
      <p>Heure : {{ $json.heureRdv }}</p>
      <p>Lieu : {{ $json.lieu }}</p>
    </div>
    <p>En cas d'empêchement, merci de nous prévenir.</p>
    <p>Cordialement,<br>L'équipe</p>
  </div>
  <div class="footer">
    <p class="rgpd">
      <strong>RGPD</strong> : Vos données sont traitées pour ce rappel uniquement.
      Pour exercer vos droits, contactez-nous.<br>
      ID traçabilité : {{ $json.rgpdTraceId }}
    </p>
  </div>
</body>
</html>
```

**Bonnes pratiques email**:
- `onError: continueErrorOutput` pour ne pas bloquer les autres envois
- Inclure mentions RGPD obligatoires
- ID de traçabilité unique par envoi
- Template responsive (mobile-friendly)

### Pattern 8: Slack Alerting Erreurs Production
**Cas d'usage**: Notifications équipe en cas d'erreur workflow

```
Architecture Error Handling:
Error Trigger (n8n natif)
    ↓
Code: Formatage erreur structuré
    ↓
Slack: Message #errors
```

```javascript
// Node Code: Error Handler
const error = $input.item.json;

const errorLog = {
  step: 'error_handler',
  status: 'error',
  errorCode: error.error?.name || 'UNKNOWN_ERROR',
  errorMessage: error.error?.message || 'Erreur inconnue',
  errorNode: error.node?.name || 'Unknown',
  timestamp: new Date().toISOString(),
  workflowName: $workflow.name,
  executionId: $execution.id,
  severity: 'high'
};

console.error(JSON.stringify(errorLog));
return { json: errorLog };
```

```javascript
// Configuration Slack node
{
  "channel": "#errors",
  "text": ":warning: *Erreur Workflow {{ $json.workflowName }}*\n\n*Code:* {{ $json.errorCode }}\n*Message:* {{ $json.errorMessage }}\n*Node:* {{ $json.errorNode }}\n*Execution:* {{ $json.executionId }}\n*Timestamp:* {{ $json.timestamp }}",
  "otherOptions": {}
}
```

**Format Slack recommandé**:
```
:warning: *Erreur Workflow [NOM]*

*Code:* API_ERROR_401
*Message:* Invalid credentials
*Node:* Google Calendar
*Execution:* abc123
*Timestamp:* 2026-01-19T09:00:00.000Z
```

**Bonnes pratiques alerting**:
- Canal dédié `#errors` ou `#n8n-alerts`
- Emoji pour gravité (⚠️ warning, 🔴 critical)
- Inclure `executionId` pour debug rapide
- Timestamp ISO 8601 pour tri chronologique

### Pattern 9: Logging RGPD-Compliant
**Cas d'usage**: Traçabilité sans exposer données personnelles

```javascript
// Masquage email dans les logs
const maskedEmail = email.replace(/(.{2}).*(@.*)/, '$1***$2');
// "john.doe@example.com" → "jo***@example.com"

// Log structuré RGPD-compliant
const log = {
  step: 'email_sent',
  status: 'success',
  rgpdTraceId: item.rgpdTraceId,
  clientEmail: maskedEmail,  // Jamais en clair
  eventId: item.eventId,
  timestamp: new Date().toISOString()
};

console.log(JSON.stringify(log));
```

**Règles logging RGPD**:
- Jamais d'email/téléphone en clair dans les logs
- ID traçable unique pour chaque traitement
- Durée conservation logs: 1 an max
- Finalité documentée dans le workflow

### Pattern 10: Récapitulatif Fin de Workflow
**Cas d'usage**: Résumé exécution pour monitoring/debug

```javascript
// Node Code: Summary final
const allItems = $input.all();

const summary = {
  step: 'workflow_completed',
  status: 'success',
  totalProcessed: allItems.length,
  successCount: allItems.filter(i => i.json.status === 'success').length,
  errorCount: allItems.filter(i => i.json.status === 'error').length,
  timestamp: new Date().toISOString(),
  workflowName: $workflow.name,
  executionId: $execution.id
};

console.log(JSON.stringify(summary));
return { json: summary };
```

---

## 5. Erreurs Courantes à Éviter

| Erreur | Solution |
|--------|----------|
| Pas de délai entre requêtes API | Ajouter Wait node 500ms-2s |
| Pas de pagination (>100 items) | Implémenter boucle offset/page_size |
| OAuth tokens expirés | Refresh token flow + test mensuel |
| Mappages Notion incohérents | Template schema mapping par base |
| Pas de validation input | Node Code.js validation stricte |
| Logging insuffisant | JSON structuré à chaque étape |
| Webhook duplicates | Déduplication timestamp + ID unique |
| Variables non documentées | Définir en début de workflow |
| Emails personnels dans logs | Masquer avec regex `(.{2}).*(@.*)` |
| Erreur bloque tout le batch | `onError: continueErrorOutput` sur Gmail |
| Pas de timezone sur dates | Toujours spécifier `Europe/Paris` |
| Calendar events récurrents dupliqués | Option `singleEvents: true` |
| Pas de mention RGPD dans emails | Template avec footer RGPD + ID traçable |

---

## 6. Checklist Production

- [ ] Try/Catch wrapper implémenté
- [ ] Logging JSON à chaque étape
- [ ] Délais entre APIs (rate limiting)
- [ ] Déduplication active
- [ ] Input validé avant traitement
- [ ] Credentials en env variables
- [ ] Alertes Slack #errors
- [ ] Testé avec 3+ samples réalistes
- [ ] Version incrémentée dans le nom
- [ ] Backup JSON exporté

---

## 7. Scripts Node.js Utiles

### Assistant Claude interactif
```bash
npm run claude:chat
```

### Générer workflow
```bash
npm run claude:generate
```

### Déboguer workflow
```bash
node scripts/debug-workflow.js <workflow.json> <error.txt>
```

### Optimiser performance
```bash
node scripts/optimize-workflow.js <workflow.json> [currentMs] [targetMs]
```

---

## 8. Prompts Claude Code

### Demander un plan
```
Réfléchis sur cette automatisation:
BESOIN: [description]
CONTRAINTES: Volume, Latence, Erreurs, Données sensibles
Propose architecture n8n avec nodes, paramètres, gestion erreurs.
```

### Déboguer
```
Workflow JSON: [copier]
Erreur: [copier]
Input: [sample], Expected: [attendu], Actual: [reçu]
```

### Optimiser
```
Workflow prend X minutes pour Y records. Target: Z secondes.
Identifie goulots, APIs non paginées, délais inutiles, calls parallélisables.
```

---

**Mise à jour**: Janvier 2026 | **Maintenu par**: Vazbolota Consulting
