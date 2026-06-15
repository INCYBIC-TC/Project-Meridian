# Meridian

AI-powered code intelligence tool for automated documentation, code review, test generation, and security scanning. Delivered as a VS Code extension with a web dashboard, built to be reusable across any company project.

---

## What It Does

| Feature | Description |
|---------|-------------|
| API Documentation | Auto-generates endpoint documentation from source code |
| Code Review | AI-generated structured review comments with severity and line references |
| Test Generation | Unit test skeletons per function, compatible with Jest and Pytest |
| Security Scanning | Static analysis, dependency audits, secret detection, and OWASP checks |
| GitHub Integration | Webhook-triggered scans on push and pull request events |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Core Server | Node.js, Express, MongoDB |
| Dashboard | React |
| Code Parser | FastAPI, Pydantic |
| Webhook Handler | Flask |
| Security Scanner | Python, Bandit, Semgrep, Safety, detect-secrets |
| AI Agent Layer | Python, LangGraph |
| Extension | TypeScript, VS Code Extension API |
| Infrastructure | Docker, Docker Compose |

---

## Team

| Member | Service Ownership |
|--------|-------------------|
| Varad Andhale | Core Server, MongoDB schema, React Dashboard |
| Om Ingale | Code Parser (FastAPI), GitHub Webhook Handler (Flask) |
| Anuj Deshmukh | AI Agent Layer — Doc, Review, Test, and Security agents |
| Chetan Gavali | Security Scanner Service, auth hardening, secrets policy |

All four members share ownership of the VS Code Extension.

---

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker and Docker Compose
- VS Code 1.85+
- MongoDB 7 (handled by Docker Compose)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/meridian.git
cd meridian
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
# Server
JWT_SECRET=
MONGO_URI=mongodb://mongodb:27017/meridian
PORT=5000

# AI
OPENAI_API_KEY=

# GitHub Webhooks
GITHUB_WEBHOOK_SECRET=

# Service URLs (internal Docker network)
FASTAPI_URL=http://fastapi-parser:8000
FLASK_URL=http://flask-webhook:8001
SECURITY_SCANNER_URL=http://security-scanner:8002
AI_AGENTS_URL=http://ai-agents:8003
```

### 3. Start all services

```bash
docker-compose up --build
```

Services will be available at:

| Service | URL |
|---------|-----|
| MERN API + Dashboard | http://localhost:5000 |
| FastAPI Parser | http://localhost:8000 |
| Flask Webhook | http://localhost:8001 |
| Security Scanner | http://localhost:8002 |
| AI Agent Layer | http://localhost:8003 |

### 4. Install the VS Code Extension

```bash
cd vscode-extension
npm install
npm run build
```

Open VS Code, go to Extensions → Install from VSIX, and select `meridian-extension.vsix` from the `vscode-extension/dist/` folder.

---

## Usage

### Via VS Code Extension

Open any project in VS Code. From the command palette (`Ctrl+Shift+P`):

- `Meridian: Scan Current File` — scans the active file
- `Meridian: Scan Workspace` — scans the entire open workspace

Results appear as:
- Inline gutter decorations for review comments
- Hover tooltips for security flags
- A side panel for generated documentation and test skeletons

### Via GitHub Webhooks

Configure your repository webhook to point to `http://your-server:8001/webhook/github` with `Content-Type: application/json` and a secret matching `GITHUB_WEBHOOK_SECRET`.

Meridian will automatically scan on every push to `main` or `dev`, and on every pull request opened or updated.

### Via Dashboard

Navigate to `http://localhost:5000` and log in. The dashboard provides:

- Full scan history per repository
- Detailed security reports with severity breakdown
- Generated API documentation viewer
- Team activity log

---

## API Reference

All endpoints require `Authorization: Bearer <token>` unless noted.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate, receive JWT — no auth required |
| POST | `/api/scan/init` | Initiate a scan with file payload |
| GET | `/api/results/:scanId` | Retrieve full scan results |
| GET | `/api/docs/:repoId` | Retrieve generated API documentation |
| GET | `/api/security/:scanId` | Retrieve security report |
| GET | `/api/dashboard/summary` | Aggregated team and scan activity |

---

## Project Structure

```
meridian/
├── mern-server/           # Express API + React Dashboard
├── fastapi-parser/        # Code parsing microservice
├── flask-webhook/         # GitHub webhook handler
├── security-scanner/      # Static analysis and vulnerability scanning
├── ai-agents/             # LangGraph multi-agent pipeline
├── vscode-extension/      # VS Code extension (TypeScript)
├── docker-compose.yml
├── .env.example
├── ARCHITECTURE.md
└── README.md
```

---

## Development Timeline

| Week | Focus |
|------|-------|
| Week 1 | Individual services scaffolded and functional in isolation |
| Week 2 | Inter-service integration, end-to-end scan pipeline working |
| Week 3 | VS Code extension, dashboard polish, security hardening, internal demo |

---

## Security Notes

- No source code is stored permanently. Only structured JSON output is persisted in MongoDB.
- All inter-service communication runs on an internal Docker network and is not publicly accessible.
- GitHub webhook payloads are validated via HMAC-SHA256 before processing.
- JWT tokens expire after 8 hours. Refresh is required.
- The Security Scanner container mounts project files as read-only.
- Secrets and API keys must never be committed. The `.env` file is in `.gitignore`.

---

## Contributing

This is an internal training project. Each team member owns their service directory. All changes to shared interfaces (API contracts, MongoDB schemas, shared TypeScript types) require review from the member whose service consumes that interface.

Branch naming: `feature/<service>/<short-description>`
Example: `feature/fastapi-parser/add-typescript-support`

---

## Ownership

The final built product — Meridian, including the VS Code extension, web dashboard, and all deployable services — is the sole property of the company upon completion.

Code ownership and authorship credit is retained by the contributing team members. Each member's contributions are tracked against their service directory and commit history, and are formally acknowledged as their individual work within the scope of this project.

| Asset | Owner |
|-------|-------|
| Final tool, extension, and deployable product | Company |
| Codebase authorship and contribution credit | Varad Andhale, Om Ingale, Anuj Deshmukh, Chetan Gavali |

---

## License

Internal use only. Not for public distribution.
