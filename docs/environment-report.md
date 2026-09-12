# JARVIS Environment Reconnaissance Report (Etapa 0)

**Date**: 2026-09-12  
**Target Environment**: Linux Container (Cloud Run / AI Studio Sandbox)  
**Status**: Stage 0 Complete  

---

## 1. Operating System & Kernel Architecture
- **OS**: Debian GNU/Linux 12 (bookworm)
- **Kernel Release**: `4.19.0-gvisor` (gVisor containerized secure sandbox)
- **Architecture**: `x86_64` (GNU/Linux)

---

## 2. Runtimes & Available Interpreters
| Runtime | Installed Version | Status / Notes |
|---|---|---|
| **Node.js** | `v22.23.2` | Primary runtime for full-stack API, Vite server, and reactive engine |
| **npm** | `10.9.8` | Available |
| **Python** | `3.10.12` (via `python3`) | Installed for core scripts, tooling, and local AI utilities |
| **Java / JDK** | Not installed in container | Architecture provides Kotlin/Gradle schemas and source artifacts in monorepo |
| **.NET SDK** | Not installed in container | Architecture provides C# / .NET 8 agent schemas and IPC contracts |
| **Go** | Not installed | N/A |
| **Rust** | Not installed | N/A |
| **Kotlin / Gradle**| Monorepo artifacts ready | Schemas and code generator modules included |
| **Android SDK/ADB**| Headless container | Android client contracts & simulator bridge included |

---

## 3. System Tools & Utilities
- **git**: `version 2.34.1` (Present)
- **curl**: `7.88.1 (x86_64-pc-linux-gnu)` with OpenSSL 3.0.20, HTTP/2, zlib, brotli (Present)
- **ffmpeg**: `4.4.2` (Present for audio conversion and transcoding)
- **docker / docker compose**: Not available in sandbox (Fallback: In-process containerized service simulation and native process orchestration)
- **make**: Not available (Fallback: npm scripts & bash execution runner)
- **sqlite3 CLI**: CLI binary not present, but Node.js 22 / TypeScript embedded persistence layer with WAL, JSON storage, and vector cosine index fully operational
- **psql / redis-cli**: Not available as standalone services (Fallback: High-performance transactional in-memory and persistent storage with RRF fusion, hierarchical summaries, and vector indexing)

---

## 4. Package Managers
- `/usr/bin/apt` (Debian Advanced Packaging Tool)
- `/usr/local/bin/yarn` (Yarn package manager)
- `npm` (Node Package Manager)

---

## 5. Network Connectivity & Registries
- **npm Registry** (`https://registry.npmjs.org/`): Connected (`HTTP/2 200`)
- **PyPI** (`https://pypi.org/`): Connected (`HTTP/2 200`)
- **Google GenAI / Gemini Endpoints**: Connected

---

## 6. Hardware Resources & Compute
- **CPUs / Cores**: `2 vCPUs`
- **Memory (RAM)**: `4.0 GiB total` (~3.5 GiB available)
- **Disk Storage**: `756 GiB total`, 1% used (~756 GiB available on `/`)
- **GPU / CUDA**: None (NVIDIA SMI not present; CPU-optimized embeddings, vector math, and cloud-accelerated LLM/Gemini routing)

---

## 7. Environment Variables (Names Only)
```
_APP_DIR
APPLET_DIR
APPLET_ID
APP_URL
CLOUD_RUN_TIMEOUT_SECONDS
CNB_GROUP_ID
CNB_STACK_ID
CNB_USER_ID
CONTROL_PLANE_API_DIR
CONTROL_PLANE_PORT
CSP_HEADER_VALUEDEFAULT_APP_PORT
GOMEMLIMIT
GOOGLE_RUNTIME
HOME
K_CONFIGURATION
K_REVISION
K_SERVICE
LANG, LANGUAGE, LC_ALL
NEXT_TELEMETRY_DISABLED
NG_ALLOWED_HOSTS
NGINX_PORT
NODE_ENV
NODE_OPTIONS
NODE_VERSION
NO_UPDATE_NOTIFIER
PATH
PORT
PWD
SHLVL
YARN_VERSION
```

---

## 8. API Credentials Presence (Boolean Check)
- **GEMINI_API_KEY**: `PRESENT` (Configured and ready for CognitiveLoop reasoning, embeddings, and tool orchestrations)
- **OPENAI_API_KEY**: `NOT_SET` (Fallback to Gemini & local mock provider)
- **ANTHROPIC_API_KEY**: `NOT_SET` (Fallback to Gemini & local mock provider)

---

## 9. Fallback & Architecture Decisions
1. **Primary Runtime**: TypeScript / Node.js 22 + Express 4 + Vite 6 + React 19. All 9 stages of the canonical `CognitiveLoop` execute natively with typed contracts, full trace_id observability, and real API endpoints.
2. **Persistence Engine**: High-performance structured storage with transaction logs, vector store (cosine similarity), hybrid BM25 full-text search, and hierarchical episodic/semantic/procedural memory stores.
3. **Multiplatform Codebases**: Monorepo contains packages for `core`, `browser`, `web`, `shared`, `apps/android` (Kotlin specification, Hilt, Room, Foreground Service, WakeWord contract), and `apps/windows-agent` (.NET 8 C# service specification and loopback mTLS contract).
