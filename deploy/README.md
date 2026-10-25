# bareframe site — Kubernetes (DigitalOcean)

Static site image: multi-stage `Dockerfile` at the repo root (same assembly as the former GitHub Pages pipeline via `scripts/finalize-pages.mjs`). Manifests live in `deploy/k8s/` and are applied with Kustomize—no GitOps.

## Cluster

- **Cluster:** `london-cluster` (DigitalOcean `lon1`)
- **Ingress:** ingress-nginx (`ingressClassName: nginx`), load balancer **159.89.249.41**
- **TLS:** cert-manager `ClusterIssuer` `letsencrypt-prod` (HTTP-01)

## DNS

Point these hostnames at the ingress load balancer (A record → `159.89.249.41`):

| Host | Purpose |
|------|---------|
| `bareframe.org` | Primary site |
| `www.bareframe.org` | 301 → `https://bareframe.org` |
| `bareframe.co.uk` | 301 → `https://bareframe.org` |
| `www.bareframe.co.uk` | 301 → `https://bareframe.org` |

## API (GitHub sign-in)

The `api/` service handles first-party auth at `https://bareframe.org/api/*` (same origin as the static site). Image: `ghcr.io/samueldbines/bareframe/api`.

### GitHub OAuth App

Create a [GitHub OAuth App](https://github.com/settings/developers) (not a GitHub App):

| Field | Value |
|-------|--------|
| Homepage URL | `https://bareframe.org` |
| Authorization callback URL | `https://bareframe.org/api/auth/github/callback` |

Copy the **Client ID** and generate a **Client secret** for the Kubernetes secret below.

### Kubernetes secret `bareframe-api`

Do **not** commit credentials. Create the secret in namespace `bareframe`:

```bash
kubectl create secret generic bareframe-api -n bareframe \
  --from-literal=GITHUB_CLIENT_ID='...' \
  --from-literal=GITHUB_CLIENT_SECRET='...' \
  --from-literal=SESSION_SECRET='...' \
  --from-literal=DATABASE_URL='postgres://USER:PASSWORD@HOST:5432/bareframe?sslmode=require'
```

| Key | Description |
|-----|-------------|
| `GITHUB_CLIENT_ID` | OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | OAuth App client secret |
| `SESSION_SECRET` | Random string (32+ chars) for signing session and OAuth state cookies |
| `DATABASE_URL` | Postgres connection string for the dedicated `bareframe` database |

### Postgres

Use a **dedicated database and user** on the cluster’s shared Postgres instance (not the superuser). The API runs SQL migrations on startup (`users`, `sessions`). Set `sslmode` in `DATABASE_URL` as required by your provider (often `sslmode=require` on managed Postgres).

### Local API + Postgres

```bash
cd api
docker compose up --build
# API on http://localhost:8080 — health: curl -sf http://127.0.0.1:8080/api/healthz
```

For the Vite prototype, `pnpm dev` proxies `/api` to `http://127.0.0.1:8080` (override with `BAREFRAME_API_PROXY`).

## CI deploy

Workflow: [`.github/workflows/deploy-k8s.yml`](../.github/workflows/deploy-k8s.yml)

On push to `main` (and `workflow_dispatch`):

1. Build and push `ghcr.io/samueldbines/bareframe/site` and `ghcr.io/samueldbines/bareframe/api` with tags `sha-<7-char-commit>` and `latest`.
2. If the repo secret **`DIGITALOCEAN_ACCESS_TOKEN`** is set, deploy with `kubectl apply -k deploy/k8s` and wait for rollout of `bareframe-site` and `bareframe-api`.

If the secret is missing, the deploy job skips and **main stays green**; image build/push still runs.

### Required repository secret

| Secret | Description |
|--------|-------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DigitalOcean API token with read access to Kubernetes (used by `doctl kubernetes cluster kubeconfig save london-cluster`) |

## Manual deploy

```bash
# Authenticate to the cluster
doctl auth init -t "$DIGITALOCEAN_ACCESS_TOKEN"
doctl kubernetes cluster kubeconfig save london-cluster

# Optional: pin image tag (default in kustomization is :latest)
cd deploy/k8s
kustomize edit set image ghcr.io/samueldbines/bareframe/site=ghcr.io/samueldbines/bareframe/site:sha-<commit>

kubectl apply -k deploy/k8s
kubectl rollout status deployment/bareframe-site -n bareframe --timeout=180s
kubectl rollout status deployment/bareframe-api -n bareframe --timeout=180s
```

Preview rendered manifests without applying:

```bash
kubectl kustomize deploy/k8s
# or: kustomize build deploy/k8s
```

## Container image (GHCR)

- **Image:** `ghcr.io/samueldbines/bareframe/site`
- **Tags:** `latest`, `sha-<short-git-sha>` (e.g. `sha-a1b2c3d`)

### Make the package public

If GitHub creates the container package as **private** after the first push:

1. Open [GitHub Packages](https://github.com/users/SamuelDBines/packages) (or the package page for `bareframe/site`).
2. **Package settings** → **Change visibility** → **Public**.

Public images do not need an `imagePullSecret`. If you keep the package private, create a `ghcr-pull` secret in the `bareframe` namespace and uncomment the optional `imagePullSecrets` block in `deployment.yaml`.

## Local image smoke test

```bash
docker build -t bareframe-site:local .
docker run --rm -p 8080:8080 bareframe-site:local
curl -sf http://127.0.0.1:8080/healthz
curl -sfI http://127.0.0.1:8080/ | head
curl -sfI http://127.0.0.1:8080/legacy/button/ | head
```
