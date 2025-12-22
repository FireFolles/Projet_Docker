## Projet Todo - Stack Dockerisée

Ce projet met en place une stack **multi-conteneurs** conforme au sujet du module Docker/Conteneurisation (`projet-final.pdf`), avec :

- **Frontend** statique (HTML/CSS/JS) servi par Nginx.
- **Backend** Node.js/Express.
- **Base de données** PostgreSQL.
- **2 réseaux Docker** (`front_net`, `back_net`) avec DB isolée.
- **Volumes** pour la persistance.
- **Secrets** gérés via `docker compose` (mot de passe DB).
- Dockerfiles multi-stage (targets `dev` / `prod`), non-root, prêts pour du build **multi-arch**.

---

### 1. Structure du dépôt

- `Back/` : API Express (Node.js)
- `Front/` : Frontend (app statique)
- `docker-compose.yaml` : stack "prod locale" (Nginx en :80, back en :3000, DB)
- `docker-compose.override.yaml` : overrides pour le **mode développement**
- `secrets/` : fichiers de secrets locaux (non commités)

---

### 2. Pré-requis

- Docker et Docker Compose v2 installés.
- Un fichier de mot de passe DB local :

```bash
mkdir -p secrets
echo changeme-db-password > secrets/db_password.txt
```

> Le repo contient `secrets/db_password.txt.example` comme exemple.  
> Le fichier réel `secrets/db_password.txt` est **ignoré** par Git.

---

### 3. Lancer la stack en mode développement

En mode dev, on utilise les targets `dev` des Dockerfiles et on monte le code source dans les conteneurs :

```bash
docker compose up --build
```

- Backend : http://localhost:3000  
- Frontend : http://localhost (Nginx en front) ou http://localhost:80  
- DB : non exposée (uniquement accessible depuis le réseau interne `back_net`)

Les fichiers sources de `Back/` et `Front/` sont montés dans les conteneurs grâce à `docker-compose.override.yaml`, ce qui permet de développer en live (`npm run dev`).

---

### 4. Lancer la stack en mode "prod locale"

Pour simuler une exécution proche de la prod (targets `prod`, sans montages de code), vous pouvez utiliser uniquement le `docker-compose.yaml` (sans override) :

```bash
docker compose -f docker-compose.yaml up --build
```

- Le **frontend** est servi par Nginx sur le port 80.
- Le **backend** tourne sur le port 3000.
- La DB reste sur le réseau interne.

---

### 5. Volumes & persistance

- Volume nommé : `db_data`
  - Monté sur `/var/lib/postgresql/data` dans le conteneur `db`.
  - Permet de conserver les données PostgreSQL entre les redémarrages.

**Démonstration de persistance** :

1. Lancez la stack : `docker compose up --build`.
2. Créez quelques tâches via le front.
3. Redémarrez la stack :
   ```bash
   docker compose down
   docker compose up
   ```
4. Les tâches doivent toujours être présentes.

---

### 6. Réseaux Docker

- `front_net` : frontend + backend (réseau "exposé").
- `back_net` : backend + base de données (réseau "interne").

La DB **n'est jamais exposée** directement à l'extérieur : elle n'est jointe qu'au réseau `back_net`, et le backend fait le pont entre les deux réseaux.

---

### 7. Secrets

- Mot de passe PostgreSQL fourni via un **secret Docker** :
  - Dans `docker-compose.yaml` :
    - `secrets: db_password -> ./secrets/db_password.txt`
    - Utilisé par Postgres via `POSTGRES_PASSWORD_FILE=/run/secrets/db_password`.
- Le repo ne contient **que** `secrets/db_password.txt.example`.
- Le vrai fichier `secrets/db_password.txt` est **ignoré** (voir `.gitignore`).

> Les autres configurations (ex : `SUPABASE_URL`, `SUPABASE_ANON_KEY`) sont gérées via des variables d'environnement classiques, avec un exemple dans `.env.example` (sans secrets réels).

---

### 8. Healthchecks

- Service `backend` :
  - Expose une route `/health` qui retourne `{ status: "ok" }`.
  - `docker-compose.yaml` définit un `healthcheck` basé sur `wget http://localhost:3000/health`.
  - `depends_on` attend que le backend soit `healthy` avant de lancer certains services.

Vous pouvez vérifier l'état des services avec :

```bash
docker compose ps
```

---

### 9. Builds multi-arch (AMD64 / ARM64)

Les Dockerfiles Back/Front sont compatibles multi-arch.  
Pour construire et pousser des images pour plusieurs architectures (exemple backend) :

```bash
docker buildx create --use --name multiarch-builder
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/<votre-user>/todo-backend:1.0.0 \
  -f Back/Dockerfile \
  Back \
  --push
```

Même principe pour le frontend avec `Front/Dockerfile`.

---

### 10. Stratégie de versioning / registry

- Exemple de convention de tags :
  - `ghcr.io/<user>/todo-backend:1.0.0`
  - `ghcr.io/<user>/todo-frontend:1.0.0`
  - Tags complémentaires : `latest`, `1.0`, etc.
- Les images sont disponible sur Dockerhub
  - img1 : firefolles/projet-docker-frontend
  - img2 : firefolles/projet-docker-backend

---

### 11. Procédure d’installation rapide (correcteur)

1. Cloner le repo :
   ```bash
   git clone <url-du-repo> mon-projet-docker
   cd mon-projet-docker
   ```
2. Créer le secret DB :
   ```bash
   cp secrets/db_password.txt.example secrets/db_password.txt
   ```
3. (Optionnel) Copier `.env.example` vers `.env` et adapter si besoin.
4. Lancer en mode dev :
   ```bash
   docker compose up --build
   ```
5. Ouvrir le navigateur sur :
   - Frontend : http://localhost
   - API (vérification) : http://localhost:3000/api/tasks

---

### 12. Troubleshooting (exemples)

- **Aucune donnée n’est sauvegardée après redémarrage** :
  - Vérifier que le volume `db_data` existe :
    ```bash
    docker volume ls
    ```
  - Vérifier que vous n’avez pas fait `docker compose down -v` (qui supprime les volumes).

- **API ou front inaccessible** :
  - Regarder les logs :
    ```bash
    docker compose logs backend
    docker compose logs frontend
    ```
  - Vérifier l’état des healthchecks :
    ```bash
    docker compose ps
    ```

- **Erreur de connexion DB** :
  - Vérifier que le secret `secrets/db_password.txt` correspond bien au mot de passe utilisé par Postgres (même valeur que dans `db_password.txt.example` ou celui que vous avez choisi).


