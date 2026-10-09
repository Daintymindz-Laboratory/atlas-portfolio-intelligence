# Atlas | Investment and Portfolio Management

The main page at / contains the updated single-file All On application. It includes dated FX translation, document submission tracking, equity administration, company contacts and boards, information rights, and management concentration and exception views. The original Atlas public/private markets prototype remains available at /atlas.html. Both entries are included in the Vite production build.

## All On modules

- Dashboard: NAV, cost, gains, portfolio allocation, performance and exceptions
- Management review: concentration by sector and security, high-risk exposures, repayment and governance exceptions
- Portfolio companies: RC Number, TIN, contacts, management, boards, document due dates and submission metadata, information rights, board meetings and risk amendments
- Deal pipeline: stages, prospective investments and ticket summaries
- Investments: original NGN/USD amounts, debt, equity share classes, co-investors and transaction histories
- FX and currency: dated illustrative rates, original fair values and naira equivalents
- Financial administration: invoices, payment recording, interest action and SAP journal export
- Valuation: investment NAV and valuation export
- ESG and impact: energy, emissions, connections, jobs, gender and Excel export
- Reports: portfolio, finance, valuation and reporting exports
- AI and automation: portfolio assistant, commentary, simulated import and MCP toggles
- Approvals: two-stage investment/finance approval and rejection
- Administration: six-role permission matrix, user creation, role reassignment, access deactivation/reactivation and confirmed deletion, with session audit entries and protection for the last active administrator
- Audit trail and notifications

Six role profiles and NGN/USD display are preserved.

## Source behavior and limits

Atlas is the product name. All On is the client portfolio. Company, investment and deal actions open validated forms with a review step and save entries to separate session draft lists. Seeded portfolio values remain unchanged. Investment imports accept a local Excel, CSV or PDF file and show an explicitly simulated sample extraction preview; file contents are not parsed or uploaded. A downloadable sample CSV and a built-in sample schedule are available.

Role selection is a demo login; permissions are UI controls rather than server-side authorization. Changes are held in memory and reset when the page reloads. AI responses use local rules, MCP connections are simulated toggles, and scheduled jobs are display-only. User management shows demo messages. Interest recalculation logs a demo action. Excel exports are HTML .xls files. No backend or external service integrations are included.

## Development and verification

Use Node.js 20.19+ or 22.12+.

```sh
npm ci
npm test
npm run dev
npm run build
npm run preview
```

Tests cover all permitted role views in both currencies, dated FX translation and unchanged booked cost, document and governance detail, equity records, two-stage approvals, invoice issuance/payment/generation, sample import, assistant responses, commentary, exports and audit updates. FX snapshots hold original fair values constant to demonstrate currency translation. Document reminders create demo in-app notifications and do not send email.

## Deployment

The repository is connected to Vercel at https://atlas-portfolio-intelligence.vercel.app. Production builds use npm run build and publish dist. Pushing main triggers the configured Vercel Git integration.

---

## Original Atlas documentation

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
