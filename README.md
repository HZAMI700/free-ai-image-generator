# Prism AI — Free AI Image Generator SaaS

A polished, production-ready **100% Free AI Image Generator SaaS** built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Motion, and an intelligent multi-provider router.

Designed with **Apple Human Interface Guidelines (HIG)** and modern **Liquid Glass** glassmorphism principles.

---

## 🌟 Core Product Rules & Guarantees

* **NO login**
* **NO registration**
* **NO email**
* **NO subscription**
* **NO payment**
* **NO user account**
* **NO user dashboard**
* **NO artificial image-generation limit**
* **100% Free** for all users

### Fair Usage Restriction
* A user can generate **1 image every 3 minutes (180 seconds)**.
* After generating an image, an elegant Apple HIG countdown timer is displayed:  
  **"Next image available in 02:59"**
* The countdown persists seamlessly even across page refreshes, incognito windows on the same network, browser restarts, and tab switches.
* The timer is **NOT** stored only in client state or `localStorage`. The backend is the ultimate authority.
* Server-side rate limiting uses a 4-layer defense:
  1. Client IP rate limiting
  2. Browser / Device identifier
  3. Server-side timestamp ledger
  4. Cryptographically signed HMAC-SHA256 cooldown tokens (`HttpOnly`, `SameSite=Lax`)

---

## 🚀 Architecture & Provider Router

```
User
 ↓
Frontend (Next.js 15 + Motion + Glassmorphism)
 ↓
Backend API (/api/generate)
 ↓
3-Minute Cooldown Check (IP + Device + HMAC Token)
 ↓
Intelligent Provider Router (Multi-factor scoring)
 ↓
Best Available Provider (Runware AI Multi-Model Cluster)
 ↓
Image Generation & Fallback Pipeline
 ↓
Object Storage / Cache with TTL Expiration
 ↓
High-Resolution Image Delivered to User & Cached in Browser IndexedDB
```

### Supported Providers (`src/providers/`):
Every provider implements the unified `ImageProvider` interface:
* `generateImage(options)`
* `getStatus()`
* `getQuota()`
* `estimateCost(options)`
* `healthCheck()`

1. **Runware AI** (`runware.ts`):
   - High-performance multi-model cloud inference: FLUX.1 [schnell] (`runware:100@1`), FLUX.1 [dev] (`runware:101@1`), Juggernaut Lightning Flux (`rundiffusion:110@101`), Juggernaut Pro Flux (`rundiffusion:130@100`), Devlish PhotoRealism SDXL (`civitai:156061@179087`), Animagine XL 3.1 (`civitai:260267@293564`), EpicRealism (`civitai:25694@143906`), and DreamShaper 8 (`civitai:4384@128713`).
   - Auto-dimension calculation adhering to multiple-of-64 hardware constraints.
   - Built-in self-healing model fallbacks within Runware.


---

## 🎨 Design System

* **Inspirations**: Apple Human Interface Guidelines, Liquid Glass, Modern Glassmorphism.
* **Palette**: Clean neutral base (translucent whites, soft zinc surfaces, dark text, restrained indigo accent). Intentional dark mode with deep zinc-950 and glass reflections.
* **Typography**: Apple SF Pro / system font fallbacks with strict hierarchy.
* **Radius Hierarchy**: 12px (small), 16px (medium), 24px (large), 28px (hero panels).
* **Motion**: Powered by Motion (`motion/react`) with spring physics and full `prefers-reduced-motion` accessibility support.
* **Progressive Disclosure**: Advanced controls (Negative prompt, HD quality, Seed) remain hidden by default to keep the interface simple and approachable.

---

## 💾 Local Browser History (IndexedDB)

Because there are no user accounts:
* Past generations are stored privately in the client's browser using **IndexedDB**.
* Users can view their previous images, re-use prompts, download high-res copies, and delete items or clear history.
* Clearly labeled that history belongs solely to that specific device.

---

## 🔒 Security & Anti-Bypass

* Multi-layered server authority ensures users cannot bypass the 3-minute cooldown by clearing `localStorage`, refreshing the page, or opening an incognito tab.
* HMAC-SHA256 signed tokens prevent tampering.
* Strict input validation (1000 character prompt limit, 500 character negative prompt limit, aspect ratio validation).
* Never leaks internal API keys, database errors, or provider stack traces.
* Friendly, shielded error notifications when services are busy.

---

## 🛠️ Internal Admin Monitoring Dashboard

Accessible at `/admin` (protected by `ADMIN_SECRET_KEY`):
* Real-time provider health status, latencies, and uptime probes.
* Quota remaining per provider (Neurons, requests, credits, kudos).
* Live telemetry: Active Cooldowns, Blocked Abuse Attempts, Estimated Spend ($0.00), Active Cached Images.
* Live Failover & Routing Event Log.
* Interactive "Test Probe" button to ping any provider on demand.

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

*(Note: The platform works immediately out of the box using public free providers even with zero API keys configured!)*

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Run End-to-End Test Suite
```bash
node scratch/test-suite.mjs
```
