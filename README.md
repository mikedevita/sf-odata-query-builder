# SAP SuccessFactors EC OData Query Builder

A visual query builder for the SAP SuccessFactors Employee Central OData API. Build, execute, and save OData queries through a point-and-click interface — no manual URL construction required.

## Features

- **Visual query builder** — select entities, fields, filters, navigation expansions, and options without writing OData syntax
- **Live URL preview** — see the full OData URL update in real time as you configure the query
- **Navigation ($expand)** — browse and select nav portlets up to 5 levels deep (e.g. `employmentNav/jobInfoNav/businessUnitNav`)
- **Table, JSON, and Raw views** — switch between result formats; nav portlet data is automatically flattened in table view
- **Auto-retry on restricted fields** — fields rejected by SAP (`COE0003`, `COE0021`, etc.) are automatically unchecked and the query retried
- **Saved queries with revision history** — name and save queries; every save creates a new revision you can reload
- **Metadata loader** — fetch live field definitions from your tenant's `$metadata` endpoint
- **cURL export** — copy any query as a ready-to-run cURL command
- **Light / dark mode** — toggle with the 🌙/☀️ button; preference is persisted
- **Resizable sidebar** — drag the right edge of the sidebar to give the query builder more screen space

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm 9 or later

```bash
npm install
```

---

## Running the App

### Web — Development

Starts a local Vite dev server with a built-in CORS proxy that forwards requests to the SAP API.

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> **Why a proxy?** Browsers block direct requests to SAP SuccessFactors due to CORS restrictions. The dev server proxy forwards requests server-side, bypassing this limitation.

---

### Electron — Desktop App

Run locally against the dev server:

```bash
npm run electron:dev
```

Build distributable installers (`.exe` on Windows, `.dmg` on macOS, `.AppImage` on Linux):

```bash
npm run electron:build
```

Installers are output to the `release/` directory.

> The Electron app makes requests **directly** to the SAP API — no proxy needed since desktop apps are not subject to browser CORS restrictions.

---

### Docker — Self-Hosted Web

```bash
npm run docker:build
npm run docker:run
```

Open [http://localhost:3000](http://localhost:3000). To use a different port:

```bash
docker run -p 8080:3000 sap-sfec-browser
```

The Docker image serves the built frontend via Express and proxies API requests to SAP server-side.

---

## Connection Setup

Fill in the **Connection** panel in the sidebar:

| Field | Description |
|---|---|
| **API Base URL** | Your SAP SF instance URL, e.g. `https://api4.successfactors.com` |
| **Company ID** | Your SAP company/tenant ID |
| **Username** | Your SAP username (authenticated as `username@companyID`) |
| **Password** | Your SAP password |

Click **Save** to persist credentials in local storage, or **Test** to verify the connection.

---

## Building a Query

1. **Select an entity** from the Entity dropdown (e.g. `PerPerson`, `EmpJob`)
2. **Choose fields** in the Fields section — all are pre-checked; uncheck any you don't need
3. **Add navigation** in the Navigation ($expand) section to include related portlets; checking a nav reveals its sub-navs for deeper expansion
4. **Add filters** — pick a field, operator, and value; combine multiple filters with AND/OR logic
5. **Set options** — `$top`, `$skip`, `$orderby`, `$format`, `$inlinecount`
6. Click **▶ Run Query**

The **Query URL** panel shows the full OData URL as you build and can be copied at any time.

---

## Saved Queries

- Click **+ Save** to name and save the current query configuration
- Click **Saved** to browse saved queries, load a previous configuration, or view revision history
- Every save to an existing query name creates a new revision — no history is ever lost
- Saved queries are stored in the browser/Electron local storage

---

## Metadata Loader

Click **⟳ Metadata** in the Fields section to fetch live field definitions from your tenant's `$metadata` endpoint. Useful for custom entities (`cust_*`) or to pick up data model changes not in the built-in catalog.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Shared Frontend (index.html)        │
│   Detects window.__ELECTRON__ to switch mode     │
└──────────────┬──────────────────────┬────────────┘
               │                      │
       Electron mode             Web / Docker mode
       (direct fetch)            (proxied fetch)
               │                      │
               ▼                      ▼
      SAP SuccessFactors       Express / Vite proxy
           OData API           → SAP SuccessFactors
                                    OData API
```

| Mode | Proxy | How CORS is solved |
|---|---|---|
| Electron desktop | None | Desktop apps bypass browser CORS |
| Docker / hosted web | `server.js` (Express) | Requests forwarded server-side |
| Vite dev server | `vite.config.js` plugin | Requests forwarded server-side |
