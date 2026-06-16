# Meridian — System Architecture

## Overview

Meridian is an AI-powered code intelligence tool delivered as a VS Code extension backed by a multi-service server architecture. It performs automated API documentation generation, code review, unit test suggestion, and security vulnerability scanning across any codebase it is pointed at.

The system is composed of four independently deployable services that communicate over internal REST APIs, orchestrated through a central Express backend.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VS Code Extension                       │
│           (triggers scans, displays results inline)          │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               MERN Core Server  (Express + MongoDB)          │
│   - Central API gateway                                      │
│   - Auth (JWT)                                               │
│   - Stores all scan results, docs, reports                   │
│   - Serves React Dashboard                                   │
└──────┬──────────────┬──────────────┬────────────────────────┘
       │              │              │
       ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐
│  Flask   │  │   FastAPI    │  │   Security Scanner       │
│ Webhook  │  │ Code Parser  │  │   Service (Python)       │
│ Handler  │  │              │  │                          │
│          │  │ - Parses     │  │ - Static analysis        │
│ - GitHub │  │   routes,    │  │ - Dependency audit       │
│   push   │  │   models,    │  │ - Secret detection       │
│ - PR     │  │   functions  │  │ - OWASP rule checks      │
│   events │  │ - Outputs    │  │ - Outputs structured     │
│          │  │   structured │  │   vulnerability reports  │
│          │  │   JSON       │  │                          │
└──────────┘  └──────┬───────┘  └───────────┬──────────────┘
                     │                       │
                     ▼                       ▼
          ┌──────────────────────────────────────────┐
          │        AI Agent Layer  (LangGraph)        │
          │                                           │
          │   ┌───────────┐  ┌────────────────────┐  │
          │   │ Doc Agent │  │ Security Agent     │  │
          │   │           │  │                    │  │
          │   │ Generates │  │ Interprets scanner │  │
          │   │ API docs  │  │ output, suggests   │  │
          │   │ from JSON │  │ remediation steps  │  │
          │   └───────────┘  └────────────────────┘  │
          │   ┌───────────┐  ┌────────────────────┐  │
          │   │  Review   │  │   Test Agent       │  │
          │   │  Agent    │  │                    │  │
          │   │           │  │ Generates unit     │  │
          │   │ Structured│  │ test skeletons     │  │
          │   │ code      │  │ per function       │  │
          │   │ comments  │  │ signature          │  │
          │   └───────────┘  └────────────────────┘  │
          └──────────────────────────────────────────┘
                             │
                             ▼ results
          ┌──────────────────────────────────────────┐
          │           MongoDB (via MERN Server)       │
          │  Collections: docs, reviews, tests,       │
          │  security_reports, scan_history, users    │
          └──────────────────────────────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────────┐
          │            React Dashboard               │
          │  - Scan history & results viewer         │
          │  - Security report dashboard             │
          │  - Team activity logs                    │
          │  - Role-based views (admin/reviewer)     │
          └──────────────────────────────────────────┘
```

---

## Services

### 1. MERN Core Server
**Stack:** Node.js, Express, MongoDB, React

The central API gateway. All other services communicate results back through this server. It is the single source of truth for stored data and is the only service the VS Code extension and the React dashboard communicate with directly.

**Responsibilities:**
- Exposes REST endpoints consumed by the VS Code extension and the React dashboard
- Routes incoming scan requests to FastAPI (code parsing) and Security Scanner
- Receives and persists results returned from the AI Agent Layer
- Handles JWT-based authentication and role management
- Serves the React dashboard as a static build

**Key Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/scan/init` | Accepts file payload, triggers parser + security scanner |
| GET | `/api/results/:scanId` | Returns full results for a scan |
| GET | `/api/docs/:repoId` | Returns generated documentation |
| GET | `/api/security/:scanId` | Returns vulnerability report |
| POST | `/api/auth/login` | Issues JWT |
| GET | `/api/dashboard/summary` | Aggregated team activity |

**MongoDB Collections:**

```
users           { _id, name, role, email, passwordHash }
scans           { _id, repoId, triggeredBy, timestamp, status }
docs            { scanId, routes[], models[], summary }
reviews         { scanId, comments[{ line, severity, suggestion }] }
tests           { scanId, functions[{ name, testSkeleton }] }
security_reports { scanId, vulnerabilities[], secrets[], dependencyFlags[] }
```

---

### 2. FastAPI Code Parser
**Stack:** Python, FastAPI, Pydantic

Receives raw source files from the MERN server, parses them statically, and returns structured JSON describing the codebase — routes, request/response models, function signatures, and docstrings. This JSON is the primary input for the AI Agent Layer.

**Responsibilities:**
- Accepts multi-file payloads (JS, TS, Python)
- Extracts route definitions, middleware, request schemas, and exported functions
- Returns a normalized `CodeStructure` JSON schema
- Runs async to handle large file sets without blocking

**Pydantic Models:**
```python
class RouteSchema(BaseModel):
    method: str
    path: str
    handler: str
    params: list[str]
    body_schema: dict | None

class FunctionSchema(BaseModel):
    name: str
    args: list[str]
    return_type: str | None
    docstring: str | None

class CodeStructure(BaseModel):
    routes: list[RouteSchema]
    functions: list[FunctionSchema]
    models: list[dict]
    raw_file_map: dict[str, str]
```

**Key Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/parse` | Accepts file bundle, returns CodeStructure JSON |
| GET | `/health` | Service health check |

---

### 3. Flask Webhook Handler
**Stack:** Python, Flask

Listens to GitHub webhook events (push, pull_request) and automatically triggers scans without requiring manual invocation from the extension. Acts as an event bridge between GitHub and the MERN server.

**Responsibilities:**
- Validates GitHub webhook signatures (HMAC-SHA256)
- On `push` to main/dev branches — fetches changed files, forwards to MERN `/api/scan/init`
- On `pull_request` opened/updated — triggers a review-only scan and posts summary back as a PR comment via GitHub API
- Lightweight by design; does no processing itself

**Key Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/webhook/github` | Entry point for all GitHub events |

---

### 4. Security Scanner Service
**Stack:** Python, Flask or FastAPI, Bandit, Semgrep, Safety, detect-secrets

Performs static security analysis independently of the AI layer. Returns structured vulnerability data that is both stored directly and passed to the Security Agent for plain-language remediation suggestions.

**Responsibilities:**
- Static analysis on Python files using **Bandit**
- Cross-language rule-based analysis using **Semgrep** (OWASP ruleset)
- Dependency vulnerability audit using **Safety** (Python) and **npm audit** (JS)
- Secret and credential detection using **detect-secrets**
- Returns a structured `SecurityReport` object

**SecurityReport Schema:**
```json
{
  "scanId": "string",
  "static_issues": [
    { "file": "string", "line": 12, "severity": "HIGH", "rule": "B105", "description": "string" }
  ],
  "dependency_flags": [
    { "package": "string", "version": "string", "cve": "string", "severity": "string" }
  ],
  "secrets_detected": [
    { "file": "string", "line": 4, "type": "AWS_KEY" }
  ],
  "owasp_flags": [
    { "category": "A03:2021", "file": "string", "description": "string" }
  ]
}
```

**Key Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/scan/security` | Accepts files, returns SecurityReport JSON |
| GET | `/health` | Service health check |

---

### 5. AI Agent Layer
**Stack:** Python, LangGraph, OpenAI / Ollama

A multi-agent pipeline triggered by the MERN server after parsing and security scanning are complete. Receives `CodeStructure` JSON (from FastAPI) and `SecurityReport` JSON (from Security Scanner) as inputs. Each agent runs as a node in a LangGraph graph and streams results back.

**Agents:**

**Doc Agent**
- Input: `CodeStructure.routes`, `CodeStructure.models`
- Output: Markdown API documentation with endpoint descriptions, parameter tables, and example request/response blocks
- Writes to: `docs` MongoDB collection

**Review Agent**
- Input: `CodeStructure.functions`, `raw_file_map`
- Output: Array of structured comments — each with file path, line number, severity (`info`, `warning`, `critical`), and a plain-language suggestion
- Writes to: `reviews` MongoDB collection

**Test Agent**
- Input: `CodeStructure.functions`
- Output: Unit test skeletons per function — compatible with Jest (JS) or Pytest (Python), including mock setup where parameters indicate external calls
- Writes to: `tests` MongoDB collection

**Security Agent**
- Input: `SecurityReport`
- Output: Plain-language vulnerability summary with prioritized remediation steps per issue
- Writes to: `security_reports` MongoDB collection (appended to scanner output)

**LangGraph Flow:**
```
START
  └─► parse_input
        ├─► doc_agent
        ├─► review_agent
        ├─► test_agent
        └─► security_agent
              └─► aggregate_results
                    └─► POST /api/results → MERN Server
```

All agents run in parallel after `parse_input`. Results are aggregated and sent back to the MERN server in a single payload.

---

### 6. VS Code Extension
**Stack:** TypeScript, VS Code Extension API

The developer-facing entry point. Communicates exclusively with the MERN Core Server.

**Features:**
- Command palette trigger: `Meridian: Scan Current File`, `Meridian: Scan Workspace`
- Inline code decorations for review comments (severity-colored gutter icons)
- Hover tooltips showing suggestions and security flags
- Side panel showing generated docs and test skeletons
- Status bar showing active scan state

---

## Data Flow — Full Scan Cycle

```
1. Developer triggers scan via VS Code extension
2. Extension sends file(s) to POST /api/scan/init (MERN Server)
3. MERN Server dispatches files to:
   a. FastAPI → returns CodeStructure JSON
   b. Security Scanner → returns SecurityReport JSON
4. MERN Server forwards both payloads to AI Agent Layer
5. Agents (Doc, Review, Test, Security) run in parallel via LangGraph
6. Aggregated results POST'd back to MERN Server
7. MERN Server persists to MongoDB
8. Extension polls GET /api/results/:scanId and renders output inline
9. React Dashboard reflects updated scan history
```

---

## Authentication & Security

- All inter-service communication is over localhost or an internal Docker network; no service is publicly exposed except the MERN server
- JWT tokens issued on login; all MERN endpoints require `Authorization: Bearer <token>`
- GitHub webhook requests validated via HMAC-SHA256 signature before processing
- Security Scanner runs in an isolated container with read-only file mount
- No source code is stored permanently; only the structured JSON output is persisted

---

## Deployment

All services are containerized and orchestrated via Docker Compose.

```yaml
services:
  mern-server:     # Node 20, port 5000
  react-dashboard: # Served by mern-server as static build
  fastapi-parser:  # Python 3.11, port 8000
  flask-webhook:   # Python 3.11, port 8001
  security-scanner:# Python 3.11, port 8002
  ai-agents:       # Python 3.11, port 8003
  mongodb:         # Mongo 7, port 27017
```

Environment variables for API keys, MongoDB URI, and JWT secret are managed via a `.env` file. No secrets are hardcoded.

---

## Repository Structure

```
meridian/
├── mern-server/
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── index.js
│   └── client/               # React Dashboard
│       └── src/
├── fastapi-parser/
│   ├── main.py
│   ├── parsers/
│   └── schemas.py
├── flask-webhook/
│   ├── app.py
│   └── handlers/
├── security-scanner/
│   ├── app.py
│   ├── scanners/
│   └── schemas.py
├── ai-agents/
│   ├── graph.py
│   ├── agents/
│   │   ├── doc_agent.py
│   │   ├── review_agent.py
│   │   ├── test_agent.py
│   │   └── security_agent.py
│   └── schemas.py
├── vscode-extension/
│   ├── src/
│   │   ├── extension.ts
│   │   ├── panels/
│   │   └── decorations/
│   └── package.json
├── docker-compose.yml
└── .env.example
```

---

## Team Ownership

| Service | Owner |
|---------|-------|
| MERN Core Server + React Dashboard | Varad Andhale |
| FastAPI Code Parser + Flask Webhook | Om Ingale |
| AI Agent Layer (all agents) | Anuj Deshmukh |
| Security Scanner Service | Chetan Gavali |
| VS Code Extension | Shared — all four |

### Product vs. Code Ownership

The final deliverable — the Meridian tool, extension, and all associated services — is the property of the company upon project completion.

Code authorship and contribution credit is retained by the team members. Each member's work is attributed to their respective service directory and Git commit history, and is formally recognized as their individual contribution within this project.
