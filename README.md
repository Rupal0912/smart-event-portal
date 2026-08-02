# Smart Event Management Portal

A full-stack event management and ticket booking platform with a complete containerized deployment pipeline — built to demonstrate production-grade DevOps practices alongside application development.

## Tech Stack

**Frontend:** Plain HTML, CSS, JavaScript (vanilla, no framework)
**Backend:** Node.js, Express, Mongoose
**Database:** MongoDB Atlas
**Auth:** JWT-based authentication with bcrypt password hashing
**Containerization:** Docker (multi-service setup via Docker Compose)
**Orchestration:** Kubernetes (Deployments, Services, Secrets, liveness/readiness probes)
**CI/CD:** Jenkins declarative pipeline

## Features

- User registration and login (JWT auth)
- Browse and view event details
- Book tickets for events
- View personal booking history
- Admin panel for event CRUD operations
- Health check endpoint for container orchestration

## Architecture

frontend/ → Static HTML/CSS/JS, served via Nginx in production
backend/ → Express REST API
├── models/ → Mongoose schemas (User, Event, Booking)
├── controllers/ → Business logic
├── routes/ → API route definitions
├── middleware/ → JWT auth middleware
└── tests/ → Jest + Supertest test suite
k8s/ → Kubernetes manifests (Deployments, Services, Secrets)
Jenkinsfile → CI/CD pipeline definition
docker-compose.yml → Local multi-container testing


## CI/CD Pipeline

The Jenkins pipeline automates the full path from code commit to a running, verified deployment:

1. **Checkout** — pulls the latest code from the `main` branch
2. **Install & Test** — installs backend dependencies and runs the Jest test suite (health check, registration, login) against a live MongoDB Atlas connection, injected securely via Jenkins credentials
3. **Docker Build & Tag** — builds separate images for backend and frontend, tagged with the Jenkins build number + git commit SHA for full traceability (not `latest`)
4. **Push to Docker Hub** — pushes both tagged images to a private registry using credential-bound authentication
5. **Deploy to Kubernetes** — applies the latest manifests and updates the running deployments to the newly built image tags
6. **Verify Rollout** — blocks the pipeline until Kubernetes confirms both deployments are fully healthy (`kubectl rollout status`), using readiness probes tied to the app's `/health` endpoint to guarantee zero-downtime traffic cutover
7. **Automated Rollback** — if verification fails at any point, the pipeline automatically reverts both deployments to their last known-good version (`kubectl rollout undo`), so a bad deploy never stays live

This means every deploy is either fully verified healthy, or automatically rolled back — no manual intervention required.

## Running Locally

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:** open `frontend/index.html` directly, or serve via any static file server.

**With Docker Compose:**
```bash
MONGO_URI=<your-atlas-uri> docker-compose up --build
```

**On Kubernetes (Minikube):**
```bash
minikube start
eval $(minikube docker-env)
docker build -t smart-event-backend:latest ./backend
docker build -t smart-event-frontend:latest ./frontend
kubectl apply -f k8s/
```

## Environment Variables

See `backend/.env.example` for required variables (`MONGO_URI`, `JWT_SECRET`, `PORT`). Never commit `.env` or `k8s/secret.yaml` — both are gitignored.