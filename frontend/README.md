# KrishiConnect — SIH Frontend

A responsive React + Vite + Tailwind frontend prototype for a demand-driven FPO management platform. The FPO is the seller of record; member farmers supply aggregated produce, buyers place orders, and completed sales feed future demand forecasts.

## Included

- Responsive FPO dashboard
- AI demand forecast with mock forecast data
- Inventory + ONDC-ready listing workflow
- Orders Kanban + order details actions
- Member farmer procurement network
- Logistics page focused on route sequence optimisation
- Delivery tracking prototype
- Sales & analytics
- Functional buttons, filters, modals, notifications and toast feedback
- Mock-data service boundary for backend integration

## Navigation

Dashboard → Demand Forecast → Inventory → Orders → Logistics → Members → Analytics

The old standalone logistics tab/page has been removed. Route optimisation is now the single **Logistics** section.

## Run locally

Use Node.js 20.19+ or a newer supported Node version.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

For Windows PowerShell, if `npm.ps1` is blocked by execution policy, use:

```powershell
npm.cmd install
npm.cmd run dev
```

## Code formatting

The source files are intentionally organised across multiple lines with consistent 2-space indentation. The project also includes `.editorconfig` and `.prettierrc.json` so the same style can be maintained in VS Code.

## Production build

```bash
npm run build
```

## Backend handoff

The UI is currently driven by `src/data/mockData.js` through `src/services/api.js`. Replace the mock functions in `src/services/api.js` with real HTTP calls while keeping the return shapes stable.

Suggested contracts:

```text
GET  /api/dashboard
GET  /api/forecast
GET  /api/inventory
GET  /api/orders
GET  /api/orders/:id
POST /api/orders/:id/accept
POST /api/orders/:id/prepare
GET  /api/members
POST /api/routes/optimize
GET  /api/analytics
```

Optional environment variable:

```text
VITE_API_URL=http://localhost:8000
```

## Git handoff

```bash
git init
git add .
git commit -m "Initial KrishiConnect frontend"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Your backend teammate can clone and run:

```bash
git clone YOUR_GITHUB_REPO_URL
cd krishi-connect-sih
npm install
npm run dev
```

The frontend should remain the presentation layer; the backend supplies real FPO, inventory, order, forecast and route data through the API service.
