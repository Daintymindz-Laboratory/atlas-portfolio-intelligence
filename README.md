# Atlas Portfolio Intelligence - Client-Ready Prototype

Atlas is a clickable multi-asset portfolio management system prototype for demonstrating a unified public + private markets workflow.

## What the prototype demonstrates

- Consolidated overview across public and private assets
- Holdings, market value, cost basis and unrealised P/L
- Private-market commitments, calls, distributions, DPI, TVPI and IRR
- Portfolio-company look-through
- Performance vs policy benchmark and return attribution
- Transaction ledger with locally persisted demo transactions
- Investment-policy compliance checks
- Data-source / reconciliation workbench
- Report library, print-to-PDF and CSV export
- Multi-currency display (USD/EUR)
- Public / private / consolidated scope switching

## Important demo boundary

All portfolio, price, FX, benchmark, data-connection and reconciliation information in this prototype is fictional or simulated. It is designed to demonstrate workflows and requirements-not to book real trades or provide investment advice.

A production implementation would add secure authentication and RBAC, database persistence, custodian/administrator and market-data integrations, configurable reconciliation, audit logs, approval workflows, production performance/accounting calculations, encryption/secrets management, monitoring, backups and security/compliance controls.

## Run locally

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build

```bash
npm install
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Deploy to Vercel

### Fastest route
1. Create a GitHub repository and upload this project.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel should detect **Vite** automatically.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

### CLI route

```bash
npm install
npx vercel
```

Follow the prompts. For production:

```bash
npx vercel --prod
```

## Deploy to Netlify

1. Push the project to GitHub.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy.

## Suggested client demo path

1. Open **Overview** and explain the unified public/private book.
2. Switch **Consolidated → Public → Private** to show scope-aware analytics.
3. Open **Private markets** to demonstrate commitments, distributions and look-through.
4. Open **Performance** and **Compliance**.
5. Open **Data & reconciliation** and explain how production connectors would normalize custodian, pricing and private-fund data.
6. Open **Reports** and demonstrate PDF/CSV output.
7. Close by distinguishing the working prototype from the production integration phase.

## Positioning

Do not pitch this as “we already built the finished PMS.” Pitch it as:

> A working product prototype that demonstrates the proposed operating model, validates requirements with stakeholders, and provides a concrete foundation for deciding what should be custom-built versus integrated from established data and market infrastructure.
