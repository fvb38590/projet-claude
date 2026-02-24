# Guide d'Installation - Vazbolota Consulting

**Configuration de l'environnement n8n + Claude Code**

---

## 1. Prérequis

### Logiciels requis
- **Node.js** 18+ LTS ([nodejs.org](https://nodejs.org))
- **Docker Desktop** ([docker.com](https://docker.com))
- **Git** ([git-scm.com](https://git-scm.com))
- **VS Code** + extension Claude Code (recommandé)

### Vérification installation
```bash
node --version    # v18.x ou supérieur
npm --version     # 9.x ou supérieur
docker --version  # 24.x ou supérieur
git --version     # 2.x ou supérieur
```

---

## 2. Installation n8n (Docker)

### Option A: Docker simple
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

### Option B: Docker Compose (recommandé)
Créer `docker-compose.yml`:
```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=${WEBHOOK_URL}
      - GENERIC_TIMEZONE=Europe/Paris
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/home/node/workflows

volumes:
  n8n_data:
```

Lancer:
```bash
docker-compose up -d
```

Accès: http://localhost:5678

---

## 3. Installation Claude Code

### SDK Anthropic
```bash
npm install @anthropic-ai/sdk
```

### CLI Claude Code (optionnel)
```bash
npm install -g @anthropic-ai/claude-code
claude-code --version
```

### Dépendances projet
```bash
cd projet-claude
npm init -y
npm install @anthropic-ai/sdk dotenv
```

---

## 4. Configuration des Credentials

### Fichier .env
Copier `.env.example` vers `.env` et remplir:
```bash
cp .env.example .env
```

### Obtenir les clés API

#### Anthropic (Claude)
1. Aller sur [console.anthropic.com](https://console.anthropic.com)
2. Créer une clé API
3. Copier dans `ANTHROPIC_API_KEY`

#### Notion
1. Aller sur [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Créer une intégration
3. Copier le token dans `NOTION_API_KEY`
4. Partager les databases avec l'intégration

#### Google (Gmail, Sheets)
1. Créer projet sur [console.cloud.google.com](https://console.cloud.google.com)
2. Activer APIs: Gmail, Sheets, Calendar
3. Créer credentials OAuth 2.0
4. Configurer dans n8n: Settings > Credentials > Google OAuth2

#### HubSpot (optionnel)
1. Aller sur [developers.hubspot.com](https://developers.hubspot.com)
2. Créer une app privée
3. Générer access token
4. Copier dans `HUBSPOT_API_KEY`

---

## 5. Structure du Projet

```
projet-claude/
├── CLAUDE.md                 # Instructions Claude Code
├── .env                      # Variables (NON versionné)
├── .env.example              # Template variables
│
├── clients/                  # Dossiers clients
│   ├── _template-client/     # Template nouveau client
│   └── [nom-client]/         # Un dossier par client
│
├── workflows/                # Workflows n8n
│   ├── templates/            # Templates réutilisables
│   └── production/           # En production
│
├── docs/                     # Documentation
│   ├── n8n-patterns.md       # Patterns techniques
│   ├── rgpd-checklist.md     # Conformité RGPD
│   └── setup-guide.md        # Ce fichier
│
└── scripts/                  # Scripts Node.js
    └── *.js                  # Utilitaires Claude
```

---

## 6. Premier Workflow de Test

### Importer un workflow
1. Ouvrir n8n: http://localhost:5678
2. Menu > Import from File
3. Sélectionner un fichier `.json` de `workflows/templates/`

### Test manuel
1. Cliquer "Execute Workflow"
2. Vérifier les outputs de chaque node
3. Corriger si erreurs

### Test webhook
```bash
curl -X POST http://localhost:5678/webhook/[votre-path] \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## 7. Scripts npm Recommandés

Ajouter dans `package.json`:
```json
{
  "scripts": {
    "claude:chat": "node scripts/claude-assistant.js",
    "claude:generate": "node scripts/generate-workflow.js",
    "claude:debug": "node scripts/debug-workflow.js",
    "n8n:start": "docker-compose up -d",
    "n8n:stop": "docker-compose down",
    "n8n:logs": "docker-compose logs -f n8n"
  }
}
```

---

## 8. Sécurité Production

### HTTPS obligatoire
Utiliser un reverse proxy (nginx, Caddy, Traefik) avec certificat SSL.

### Authentification n8n
```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=[mot_de_passe_fort]
```

### Firewall
- Port 5678: accessible uniquement en interne ou via VPN
- Webhooks: via reverse proxy HTTPS uniquement

### Backups
```bash
# Backup automatique quotidien
docker exec n8n n8n export:workflow --all --output=/home/node/workflows/backup-$(date +%Y%m%d).json
```

---

## 9. Dépannage

### n8n ne démarre pas
```bash
docker logs n8n
# Vérifier les erreurs de permission ou de port
```

### Erreur credential
1. Vérifier que la clé API est valide
2. Vérifier les permissions (Notion: database partagée)
3. Tester l'API directement avec curl

### Webhook ne répond pas
1. Vérifier que le workflow est actif
2. Vérifier l'URL (copier depuis n8n)
3. Vérifier les logs: `docker logs n8n | grep webhook`

### Claude Code timeout
```javascript
// Augmenter le timeout dans les appels
const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4096,
  timeout: 60000 // 60 secondes
});
```

---

## 10. Ressources

- **n8n Docs**: [docs.n8n.io](https://docs.n8n.io)
- **Anthropic Docs**: [docs.anthropic.com](https://docs.anthropic.com)
- **Notion API**: [developers.notion.com](https://developers.notion.com)
- **CNIL RGPD**: [cnil.fr/rgpd](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)

---

**Mise à jour**: Janvier 2026 | **Vazbolota Consulting**
