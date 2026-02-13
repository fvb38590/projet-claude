
## Documentation
- **[docs/n8n-patterns.md](docs/n8n-patterns.md)** : Patterns techniques, conventions, best practices
- **[docs/rgpd-checklist.md](docs/rgpd-checklist.md)** : Conformité RGPD
- **[docs/setup-guide.md](docs/setup-guide.md)** : Installation et configuration

## Instructions Claude Code

### Règles générales
1. Consulte les fichiers `docs/*.md` pour le contexte technique
2. Respecte les conventions de nommage (voir n8n-patterns.md)
3. Applique systématiquement la checklist RGPD pour les données personnelles
4. Privilégie n8n et Make pour l'automation
5. Adapte au contexte français/européen

### Personas disponibles
- **Expert n8n/Make** : création de workflows
- **Consultant CRM** : gestion leads et clients
- **Développeur JS/Python** : code custom pour nodes

### Nouveau client
1. Copier `clients/_template-client/` vers `clients/[nom-client]/`
2. Remplir le `brief.md`
3. Créer les workflows dans `clients/[nom-client]/workflows/`

### Nouveau workflow
1. Utiliser la convention: `[client]-[type]-[fonction]-v[version].json`
2. Inclure Try/Catch + logging (voir patterns)
3. Vérifier checklist RGPD si données personnelles
4. Documenter dans le brief client

## Commandes rapides
```bash
npm run claude:chat      # Assistant interactif
npm run claude:generate  # Générer workflow
npm run n8n:start        # Démarrer n8n
