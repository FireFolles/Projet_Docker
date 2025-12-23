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


- **Erreur de connexion DB** :
  - Vérifier que le secret `secrets/db_password.txt` correspond bien au mot de passe utilisé par Postgres (même valeur que dans `db_password.txt.example` ou celui que vous avez choisi).


