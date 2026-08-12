import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  LayoutDashboard, Wallet, Building2, TrendingUp, Receipt, ShieldCheck,
  Search, Plus, ArrowUpRight, ArrowDownRight, X, ChevronDown, Database, FileText, RefreshCw, CheckCircle2, AlertTriangle, Download, Clock3, Link2, UserRound,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Reference data + helpers                                            */
/* ------------------------------------------------------------------ */
const FX = { USD: 1, EUR: 1.09, GBP: 1.27, JPY: 0.0067, CHF: 1.12 };
const SYM = { USD: "$", EUR: "\u20AC", GBP: "\u00A3", JPY: "\u00A5", CHF: "CHF " };
const conv = (amt, from, base) => (amt * FX[from]) / FX[base];

const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const nfC = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
const money = (n, base) => SYM[base] + nf0.format(Math.round(n));
const moneyC = (n, base) => SYM[base] + nfC.format(n);
const pct = (x, d = 1) => `${x >= 0 ? "" : ""}${x.toFixed(d)}%`;
const mult = (x) => `${x.toFixed(2)}x`;

const CLASS_COLOR = {
  "Public Equity": "#0284c7",
  "Fixed Income": "#0891b2",
  Cash: "#94a3b8",
  "Private Equity": "#7c3aed",
  "Real Estate": "#c026d3",
  "Private Credit": "#4f46e5",
};

/* Public sleeve --------------------------------------------------- */
const HOLDINGS = [
  { id: "h1", name: "Apple Inc.", ticker: "AAPL", cls: "Public Equity", region: "US", ccy: "USD", qty: 12000, price: 231.4, cost: 178.2 },
  { id: "h2", name: "Microsoft Corp.", ticker: "MSFT", cls: "Public Equity", region: "US", ccy: "USD", qty: 7000, price: 447.1, cost: 390.0 },
  { id: "h3", name: "NVIDIA Corp.", ticker: "NVDA", cls: "Public Equity", region: "US", ccy: "USD", qty: 11000, price: 122.8, cost: 61.5 },
  { id: "h4", name: "Nestl\u00E9 SA", ticker: "NESN", cls: "Public Equity", region: "EU", ccy: "CHF", qty: 4000, price: 92.3, cost: 105.0 },
  { id: "h5", name: "Toyota Motor", ticker: "7203", cls: "Public Equity", region: "APAC", ccy: "JPY", qty: 24000, price: 2680, cost: 2100 },
  { id: "h6", name: "iShares Core S&P 500", ticker: "IVV", cls: "Public Equity", region: "US", ccy: "USD", qty: 5000, price: 552.1, cost: 470.0 },
  { id: "h7", name: "iShares Core EM", ticker: "IEMG", cls: "Public Equity", region: "EM", ccy: "USD", qty: 14000, price: 56.8, cost: 51.2 },
  { id: "h8", name: "US Treasury 4.25% '34", ticker: "T 4.25 34", cls: "Fixed Income", region: "US", ccy: "USD", qty: 60000, price: 98.6, cost: 100.2 },
  { id: "h9", name: "Apple 3.85% '43", ticker: "AAPL 43", cls: "Fixed Income", region: "US", ccy: "USD", qty: 30000, price: 92.4, cost: 99.1 },
  { id: "h10", name: "Cash \u2014 USD", ticker: "USD", cls: "Cash", region: "US", ccy: "USD", qty: 2400000, price: 1, cost: 1 },
  { id: "h11", name: "Cash \u2014 EUR", ticker: "EUR", cls: "Cash", region: "EU", ccy: "EUR", qty: 900000, price: 1, cost: 1 },
];
const mv = (h) => h.qty * h.price;
const cb = (h) => h.qty * h.cost;

/* Private sleeve -------------------------------------------------- */
const FUNDS = [
  { id: "f1", name: "Redwood Ventures IV", strategy: "Venture", vintage: 2021, ccy: "USD", commitment: 10_000_000, called: 6_500_000, distributed: 1_200_000, nav: 8_900_000, irr: 21.4 },
  { id: "f2", name: "Aster Buyout Fund V", strategy: "Buyout", vintage: 2020, ccy: "USD", commitment: 12_000_000, called: 9_600_000, distributed: 3_500_000, nav: 12_100_000, irr: 19.2 },
  { id: "f3", name: "Meridian Real Estate II", strategy: "Real Estate", vintage: 2019, ccy: "USD", commitment: 8_000_000, called: 7_200_000, distributed: 4_300_000, nav: 5_600_000, irr: 11.8 },
  { id: "f4", name: "Halstead Private Credit", strategy: "Private Credit", vintage: 2022, ccy: "USD", commitment: 6_000_000, called: 4_100_000, distributed: 900_000, nav: 4_050_000, irr: 9.1 },
];
const fundClass = (s) => (s === "Real Estate" ? "Real Estate" : s === "Private Credit" ? "Private Credit" : "Private Equity");
const tvpi = (f) => (f.nav + f.distributed) / f.called;
const dpi = (f) => f.distributed / f.called;
const uncalled = (f) => f.commitment - f.called;

const COMPANIES = [
  { id: "c1", fundId: "f1", name: "Kestrel AI", sector: "AI / Software", stage: "Series B", invested: 2_000_000, fmv: 3_400_000, own: 8.2 },
  { id: "c2", fundId: "f1", name: "Lumen Payments", sector: "Fintech", stage: "Series C", invested: 2_200_000, fmv: 4_100_000, own: 4.5 },
  { id: "c3", fundId: "f1", name: "Verdant Bio", sector: "Healthcare", stage: "Series A", invested: 1_500_000, fmv: 1_650_000, own: 6.1 },
  { id: "c4", fundId: "f2", name: "Tolo Logistics", sector: "Industrials", stage: "Buyout", invested: 4_000_000, fmv: 5_900_000, own: 45 },
  { id: "c5", fundId: "f2", name: "Northwind Energy", sector: "Energy", stage: "Buyout", invested: 3_200_000, fmv: 3_050_000, own: 30 },
];

/* Time series ----------------------------------------------------- */
const PERF = [
  { m: "Jul", p: 100, b: 100 }, { m: "Aug", p: 101.4, b: 100.8 }, { m: "Sep", p: 100.2, b: 99.9 },
  { m: "Oct", p: 102.9, b: 101.6 }, { m: "Nov", p: 105.1, b: 103.4 }, { m: "Dec", p: 106.8, b: 104.1 },
  { m: "Jan", p: 108.2, b: 105.0 }, { m: "Feb", p: 107.1, b: 104.4 }, { m: "Mar", p: 109.9, b: 106.2 },
  { m: "Apr", p: 112.4, b: 107.9 }, { m: "May", p: 114.8, b: 109.3 }, { m: "Jun", p: 116.2, b: 110.1 },
  { m: "Jul", p: 118.5, b: 111.6 },
];
const ATTR = [
  { name: "Public Equity", port: 4.2, bench: 3.1 },
  { name: "Fixed Income", port: 0.6, bench: 0.7 },
  { name: "Private Equity", port: 3.1, bench: 2.0 },
  { name: "Real Estate", port: 0.4, bench: 0.5 },
  { name: "Private Credit", port: 0.5, bench: 0.4 },
  { name: "Cash / FX", port: 0.2, bench: 0.1 },
];
const JCURVE = [
  { q: "'19", v: -2.0 }, { q: "'20", v: -6.5 }, { q: "'21", v: -11.0 }, { q: "'22", v: -9.5 },
  { q: "'23", v: -5.0 }, { q: "'24", v: -1.0 }, { q: "'25", v: 4.5 }, { q: "'26", v: 9.8 },
];

const SEED_TX = [
  { id: "t1", date: "2026-08-05", type: "BUY", security: "NVDA", sleeve: "public", ccy: "USD", amount: -96880 },
  { id: "t2", date: "2026-08-04", type: "DISTRIBUTION", security: "Aster Buyout Fund V", sleeve: "private", ccy: "USD", amount: 750000 },
  { id: "t3", date: "2026-08-01", type: "CAPITAL CALL", security: "Halstead Private Credit", sleeve: "private", ccy: "USD", amount: -500000 },
  { id: "t4", date: "2026-07-28", type: "DIVIDEND", security: "MSFT", sleeve: "public", ccy: "USD", amount: 21060 },
  { id: "t5", date: "2026-07-22", type: "SELL", security: "IEMG", sleeve: "public", ccy: "USD", amount: 68880 },
  { id: "t6", date: "2026-07-15", type: "FX", security: "Buy EUR / Sell USD", sleeve: "public", ccy: "EUR", amount: 500000 },
  { id: "t7", date: "2026-07-10", type: "COUPON", security: "US Treasury 4.25% '34", sleeve: "public", ccy: "USD", amount: 63750 },
];

const SCOPES = [
  { id: "all", label: "Consolidated" },
  { id: "public", label: "Public sleeve" },
  { id: "private", label: "Private sleeve" },
];
const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "holdings", label: "Holdings", icon: Wallet },
  { id: "private", label: "Private markets", icon: Building2 },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "data", label: "Data & reconciliation", icon: Database },
  { id: "reports", label: "Reports", icon: FileText },
];

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */
function Stat({ label, value, delta, deltaLabel }) {
  const up = delta === undefined ? null : delta >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
      {delta !== undefined && (
        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span className="font-mono tabular-nums">{pct(delta)}</span>
          <span className="text-slate-400">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}

function Card({ title, subtitle, right, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {(title || right) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

const Th = ({ children, right }) => (
  <th className={`px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 ${right ? "text-right" : "text-left"}`}>{children}</th>
);
const Td = ({ children, right, mono, className = "" }) => (
  <td className={`px-3 py-2.5 text-sm ${right ? "text-right" : "text-left"} ${mono ? "font-mono tabular-nums" : ""} ${className}`}>{children}</td>
);

function PL({ value, base }) {
  const up = value >= 0;
  return (
    <span className={`font-mono tabular-nums ${up ? "text-emerald-600" : "text-rose-600"}`}>
      {up ? "+" : "\u2212"}{money(Math.abs(value), base)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Main app                                                            */
/* ------------------------------------------------------------------ */
export default function App() {
  const [tab, setTab] = useState("overview");
  const [scope, setScope] = useState("all");
  const [base, setBase] = useState("USD");
  const [clsFilter, setClsFilter] = useState("All");
  const [tx, setTx] = useState(() => {
    try {
      const saved = localStorage.getItem("atlas-demo-transactions");
      return saved ? JSON.parse(saved) : SEED_TX;
    } catch { return SEED_TX; }
  });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    localStorage.setItem("atlas-demo-transactions", JSON.stringify(tx));
  }, [tx]);

  const showPublic = scope !== "private";
  const showPrivate = scope !== "public";

  /* derived book values in base currency */
  const m = useMemo(() => {
    const pubByClass = {};
    let pubTotal = 0, cash = 0, cost = 0, unrealized = 0, em = 0;
    let topIssuer = 0;
    for (const h of HOLDINGS) {
      const val = conv(mv(h), h.ccy, base);
      const bkt = h.cls;
      pubByClass[bkt] = (pubByClass[bkt] || 0) + val;
      pubTotal += val;
      cost += conv(cb(h), h.ccy, base);
      unrealized += conv(mv(h) - cb(h), h.ccy, base);
      if (h.cls === "Cash") cash += val;
      if (h.region === "EM") em += val;
      if (h.cls !== "Cash") topIssuer = Math.max(topIssuer, val);
    }
    const privByClass = {};
    let privNav = 0, unfunded = 0, distributed = 0, called = 0;
    for (const f of FUNDS) {
      const val = conv(f.nav, f.ccy, base);
      privByClass[fundClass(f.strategy)] = (privByClass[fundClass(f.strategy)] || 0) + val;
      privNav += val;
      unfunded += conv(uncalled(f), f.ccy, base);
      distributed += conv(f.distributed, f.ccy, base);
      called += conv(f.called, f.ccy, base);
    }
    const alloc = {};
    if (showPublic) Object.assign(alloc, pubByClass);
    if (showPrivate) Object.assign(alloc, privByClass);
    const aum = (showPublic ? pubTotal : 0) + (showPrivate ? privNav : 0);

    const allocRows = Object.entries(alloc)
      .map(([k, v]) => ({ name: k, value: v, wt: (v / aum) * 100 }))
      .sort((a, b) => b.value - a.value);

    const visiblePub = showPublic ? pubTotal : 0;
    const visiblePriv = showPrivate ? privNav : 0;
    const visibleCash = showPublic ? cash : 0;
    const visibleUnrealized = showPublic ? unrealized : 0;
    const visibleCost = showPublic ? cost : 0;
    const visibleEm = showPublic ? em : 0;
    const visibleUnfunded = showPrivate ? unfunded : 0;
    const visibleDistributed = showPrivate ? distributed : 0;
    const visibleCalled = showPrivate ? called : 0;
    const visibleTopIssuer = showPublic ? topIssuer : 0;

    return {
      aum, pubTotal: visiblePub, privNav: visiblePriv, cash: visibleCash, unrealized: visibleUnrealized, cost: visibleCost,
      unfunded: visibleUnfunded, distributed: visibleDistributed, called: visibleCalled, allocRows,
      privShare: aum ? (visiblePriv / aum) * 100 : 0,
      pubShare: aum ? (visiblePub / aum) * 100 : 0,
      concentration: aum ? (visibleTopIssuer / aum) * 100 : 0,
      cashPct: aum ? (visibleCash / aum) * 100 : 0,
      emPct: aum ? (visibleEm / aum) * 100 : 0,
      liqPct: aum ? (visibleUnfunded / aum) * 100 : 0,
    };
  }, [base, scope, showPublic, showPrivate]);

  const filteredHoldings = HOLDINGS.filter((h) => clsFilter === "All" || h.cls === clsFilter);
  const visibleTx = tx.filter((t) => (t.sleeve === "public" ? showPublic : showPrivate));

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* sidebar */}
      <aside className="flex w-16 flex-col border-r border-slate-200 bg-slate-900 md:w-56">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 font-mono text-sm font-bold text-white">A</div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold leading-tight text-white">Atlas</div>
            <div className="text-[11px] leading-tight text-slate-400">Portfolio Intelligence</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden md:inline">{n.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="hidden border-t border-slate-800 p-4 md:block">
          <div className="text-[11px] text-slate-500">Prototype build</div>
          <div className="text-[11px] font-medium text-slate-400">Daintymindz Laboratory</div>
        </div>
      </aside>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-900">
              {NAV.find((n) => n.id === tab)?.label}
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">Northstar Capital · consolidated multi-asset mandate · as of 31 Jul 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Demo data
            </div>
            <div className="hidden items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 sm:flex">
              {SCOPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScope(s.id)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    scope === s.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {["USD", "EUR"].map((c) => (
                <button
                  key={c}
                  onClick={() => setBase(c)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    base === c ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {tab === "overview" && <Overview m={m} base={base} />}
          {tab === "holdings" && (
            <Holdings base={base} clsFilter={clsFilter} setClsFilter={setClsFilter} rows={filteredHoldings} showPublic={showPublic} showPrivate={showPrivate} />
          )}
          {tab === "private" && <Private base={base} m={m} />}
          {tab === "performance" && <Performance m={m} base={base} />}
          {tab === "transactions" && <Transactions base={base} rows={visibleTx} onAdd={() => setShowAdd(true)} />}
          {tab === "compliance" && <Compliance m={m} base={base} />}
          {tab === "data" && <DataReconciliation base={base} />}
          {tab === "reports" && <Reports m={m} base={base} />}
        </main>
      </div>

      {showAdd && (
        <AddTx
          base={base}
          onClose={() => setShowAdd(false)}
          onSave={(t) => { setTx((prev) => [{ ...t, id: `t${Date.now()}` }, ...prev]); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Views                                                               */
/* ------------------------------------------------------------------ */
function Overview({ m, base }) {
  const donut = m.allocRows;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total assets" value={moneyC(m.aum, base)} delta={18.5} deltaLabel="vs inception" />
        <Stat label="Unrealised P/L" value={moneyC(m.unrealized, base)} delta={(m.unrealized / m.cost) * 100} deltaLabel="on cost" />
        <Stat label="Private NAV" value={moneyC(m.privNav, base)} delta={m.privShare} deltaLabel="of book" />
        <Stat label="Uncalled commitments" value={moneyC(m.unfunded, base)} delta={-m.liqPct} deltaLabel="dry powder" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title="Asset allocation" subtitle="By strategy, live from holdings">
          <div className="flex items-center gap-4">
            <div className="h-52 w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
                    {donut.map((d) => (
                      <Cell key={d.name} fill={CLASS_COLOR[d.name] || "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => money(v, base)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-1/2 space-y-2">
              {donut.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CLASS_COLOR[d.name] || "#64748b" }} />
                    {d.name}
                  </span>
                  <span className="font-mono tabular-nums font-medium text-slate-800">{d.wt.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Growth of 100" subtitle="Portfolio vs policy benchmark, trailing 12m" >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PERF} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[98, 120]} />
                <Tooltip />
                <Line type="monotone" dataKey="p" name="Portfolio" stroke="#0f766e" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="b" name="Benchmark" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-teal-700" />Portfolio +18.5%</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-slate-400" />Benchmark +11.6%</span>
          </div>
        </Card>

        <Card title="Public vs private" subtitle="Liquidity profile of the book">
          <div className="flex h-6 overflow-hidden rounded-lg">
            <div className="flex items-center justify-center bg-sky-600 text-xs font-medium text-white" style={{ width: `${m.pubShare}%` }}>
              {m.pubShare > 12 ? `${m.pubShare.toFixed(0)}%` : ""}
            </div>
            <div className="flex items-center justify-center bg-violet-600 text-xs font-medium text-white" style={{ width: `${m.privShare}%` }}>
              {m.privShare > 12 ? `${m.privShare.toFixed(0)}%` : ""}
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Public markets" v={money(m.pubTotal, base)} tag="Daily liquidity" color="text-sky-600" />
            <Row label="Private markets" v={money(m.privNav, base)} tag="Illiquid / NAV" color="text-violet-600" />
            <Row label="Cash & equivalents" v={money(m.cash, base)} tag={`${m.cashPct.toFixed(1)}% of book`} color="text-slate-500" />
            <div className="border-t border-slate-100 pt-3">
              <Row label="Distributions received" v={money(m.distributed, base)} tag="Private, life-to-date" color="text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
const Row = ({ label, v, tag, color }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-slate-700">{label}</div>
      <div className={`text-xs ${color}`}>{tag}</div>
    </div>
    <div className="font-mono tabular-nums font-medium text-slate-900">{v}</div>
  </div>
);

function Holdings({ base, clsFilter, setClsFilter, rows, showPublic, showPrivate }) {
  const classes = ["All", "Public Equity", "Fixed Income", "Cash"];
  const visible = rows.filter(() => showPublic); // public sleeve lives here
  const pubTotal = HOLDINGS.reduce((s, h) => s + conv(mv(h), h.ccy, base), 0);
  return (
    <div className="space-y-4">
      {!showPublic && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
          The private sleeve is shown under <b>Private markets</b>. Switch scope to Consolidated or Public to see line-item securities.
        </div>
      )}
      {showPublic && (
        <Card
          title="Positions"
          subtitle={`${visible.length} public-market line items`}
          right={
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {classes.map((c) => (
                <button
                  key={c}
                  onClick={() => setClsFilter(c)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    clsFilter === c ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {c === "Public Equity" ? "Equity" : c === "Fixed Income" ? "Bonds" : c}
                </button>
              ))}
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Security</Th><Th>Class</Th><Th>Ccy</Th><Th right>Qty</Th>
                  <Th right>Price</Th><Th right>Market value</Th><Th right>Cost basis</Th><Th right>Unrealised</Th><Th right>Weight</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visible.map((h) => {
                  const value = conv(mv(h), h.ccy, base);
                  const cost = conv(cb(h), h.ccy, base);
                  const pl = value - cost;
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/70">
                      <Td>
                        <div className="font-medium text-slate-900">{h.name}</div>
                        <div className="font-mono text-xs text-slate-400">{h.ticker} · {h.region}</div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: CLASS_COLOR[h.cls] }} />{h.cls}
                        </span>
                      </Td>
                      <Td mono>{h.ccy}</Td>
                      <Td right mono>{nf0.format(h.qty)}</Td>
                      <Td right mono>{h.cls === "Cash" ? "\u2014" : nf0.format(h.price)}</Td>
                      <Td right mono className="font-medium">{money(value, base)}</Td>
                      <Td right mono className="text-slate-500">{money(cost, base)}</Td>
                      <Td right>{h.cls === "Cash" ? <span className="text-slate-400">—</span> : <PL value={pl} base={base} />}</Td>
                      <Td right mono className="text-slate-600">{((value / pubTotal) * 100).toFixed(1)}%</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Private({ base, m }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Fund NAV" value={moneyC(m.privNav, base)} />
        <Stat label="Called capital" value={moneyC(m.called, base)} />
        <Stat label="Distributions" value={moneyC(m.distributed, base)} />
        <Stat label="Uncalled" value={moneyC(m.unfunded, base)} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title="Programme J-curve" subtitle="Cumulative net value creation ($M)" >
          <div className="h-56 lg:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={JCURVE} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="jc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="q" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v}M`} />
                <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2.5} fill="url(#jc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Fund commitments" subtitle="Capital account by vehicle" >
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <Th>Fund</Th><Th>Strategy</Th><Th right>Commitment</Th><Th right>NAV</Th><Th right>DPI</Th><Th right>TVPI</Th><Th right>IRR</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {FUNDS.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <Td>
                      <div className="font-medium text-slate-900">{f.name}</div>
                      <div className="text-xs text-slate-400">Vintage {f.vintage}</div>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: CLASS_COLOR[fundClass(f.strategy)] }} />{f.strategy}
                      </span>
                    </Td>
                    <Td right mono>{money(conv(f.commitment, f.ccy, base), base)}</Td>
                    <Td right mono className="font-medium">{money(conv(f.nav, f.ccy, base), base)}</Td>
                    <Td right mono>{mult(dpi(f))}</Td>
                    <Td right mono className="font-medium text-slate-900">{mult(tvpi(f))}</Td>
                    <Td right><span className="font-mono tabular-nums text-emerald-600">{f.irr.toFixed(1)}%</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Look-through: portfolio companies" subtitle="Underlying holdings across venture and buyout funds">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100">
                <Th>Company</Th><Th>Sector</Th><Th>Stage</Th><Th>Via fund</Th><Th right>Invested</Th><Th right>Fair value</Th><Th right>MOIC</Th><Th right>Ownership</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {COMPANIES.map((c) => {
                const fund = FUNDS.find((f) => f.id === c.fundId);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <Td className="font-medium text-slate-900">{c.name}</Td>
                    <Td className="text-slate-600">{c.sector}</Td>
                    <Td><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{c.stage}</span></Td>
                    <Td className="text-slate-500">{fund?.name}</Td>
                    <Td right mono>{money(c.invested, base)}</Td>
                    <Td right mono className="font-medium">{money(c.fmv, base)}</Td>
                    <Td right mono className="text-slate-900">{mult(c.fmv / c.invested)}</Td>
                    <Td right mono className="text-slate-600">{c.own}%</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Performance({ m, base }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Return (TWR, 12m)" value="+18.5%" delta={6.9} deltaLabel="vs benchmark" />
        <Stat label="Benchmark (12m)" value="+11.6%" />
        <Stat label="Volatility (ann.)" value="9.2%" />
        <Stat label="Sharpe ratio" value="1.64" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card title="Cumulative return" subtitle="Time-weighted, net of fees">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERF} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[98, 120]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="p" name="Portfolio" stroke="#0f766e" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="b" name="Policy benchmark" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Return attribution" subtitle="Contribution by sleeve (%)">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ATTR} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={92} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="port" name="Portfolio" fill="#0f766e" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="bench" name="Benchmark" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Transactions({ base, rows, onAdd }) {
  const badge = (t) => {
    const pos = t.amount >= 0;
    const map = {
      BUY: "bg-sky-50 text-sky-700", SELL: "bg-amber-50 text-amber-700",
      DIVIDEND: "bg-emerald-50 text-emerald-700", COUPON: "bg-emerald-50 text-emerald-700",
      DISTRIBUTION: "bg-violet-50 text-violet-700", "CAPITAL CALL": "bg-rose-50 text-rose-700",
      FX: "bg-slate-100 text-slate-600",
    };
    return map[t.type] || "bg-slate-100 text-slate-600";
  };
  return (
    <Card
      title="Transaction ledger"
      subtitle={`${rows.length} entries \u00B7 all sleeves`}
      right={
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <Plus size={16} /> Add transaction
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Date</Th><Th>Type</Th><Th>Security</Th><Th>Sleeve</Th><Th right>Amount</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/70">
                <Td mono className="text-slate-500">{t.date}</Td>
                <Td><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${badge(t)}`}>{t.type}</span></Td>
                <Td className="font-medium text-slate-800">{t.security}</Td>
                <Td>
                  <span className={`text-xs font-medium ${t.sleeve === "private" ? "text-violet-600" : "text-sky-600"}`}>
                    {t.sleeve === "private" ? "Private" : "Public"}
                  </span>
                </Td>
                <Td right><PL value={conv(t.amount, t.ccy, base)} base={base} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Compliance({ m, base }) {
  const checks = [
    { name: "Single-issuer concentration", cur: m.concentration, limit: 10, unit: "%", ok: m.concentration <= 10 },
    { name: "Private-markets allocation", cur: m.privShare, limit: 60, unit: "%", ok: m.privShare <= 60 },
    { name: "Minimum cash buffer", cur: m.cashPct, limit: 2, unit: "%", ok: m.cashPct >= 2, floor: true },
    { name: "Emerging-markets exposure", cur: m.emPct, limit: 15, unit: "%", ok: m.emPct <= 15 },
    { name: "Uncalled commitment / AUM", cur: m.liqPct, limit: 20, unit: "%", ok: m.liqPct <= 20 },
  ];
  const breaches = checks.filter((c) => !c.ok).length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Mandate rules" value={String(checks.length)} />
        <Stat label="In compliance" value={String(checks.length - breaches)} />
        <Stat label="Warnings" value={String(breaches)} />
        <Stat label="Last checked" value="Live" />
      </div>
      <Card title="Investment policy statement" subtitle="Rules evaluated against the live book">
        <div className="space-y-3">
          {checks.map((c) => {
            const ratio = c.floor ? c.cur / c.limit : c.cur / c.limit;
            const w = Math.max(4, Math.min(100, ratio * 100));
            return (
              <div key={c.name} className="rounded-lg border border-slate-100 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${c.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span className="text-sm font-medium text-slate-800">{c.name}</span>
                  </div>
                  <div className="font-mono text-sm tabular-nums text-slate-600">
                    {c.cur.toFixed(1)}{c.unit}
                    <span className="text-slate-400"> {c.floor ? "min" : "max"} {c.limit}{c.unit}</span>
                  </div>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${c.ok ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}



function DataReconciliation({ base }) {
  const sources = [
    { name: "Global Custodian", type: "Positions & cash", freshness: "12 min ago", status: "Connected", icon: Link2 },
    { name: "Market Data Feed", type: "Prices, FX & benchmarks", freshness: "4 min ago", status: "Connected", icon: RefreshCw },
    { name: "Private Fund Portal", type: "NAV, calls & distributions", freshness: "1 day ago", status: "Connected", icon: Building2 },
    { name: "Manual Upload", type: "CSV / XLSX supplements", freshness: "3 days ago", status: "Review", icon: FileText },
  ];
  const breaks = [
    { id: "REC-1042", account: "Custody-USD-01", issue: "Cash balance mismatch", local: 2400000, source: 2391250, diff: 8750, severity: "Medium" },
    { id: "REC-1048", account: "Redwood Ventures IV", issue: "NAV awaiting manager confirmation", local: 8900000, source: 8875000, diff: 25000, severity: "Low" },
    { id: "REC-1051", account: "NESN", issue: "Price timestamp outside tolerance", local: 92.30, source: 92.12, diff: 0.18, severity: "Low" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Data sources" value="4" />
        <Stat label="Connected" value="3" />
        <Stat label="Open breaks" value="3" />
        <Stat label="Last refresh" value="4m" />
      </div>
      <Card title="Data connections" subtitle="Illustrative integration layer for custodians, market data and private fund reporting">
        <div className="grid gap-3 md:grid-cols-2">
          {sources.map((s) => { const Icon=s.icon; const ok=s.status==="Connected"; return (
            <div key={s.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"><Icon size={17} className="text-slate-600" /></div>
                <div><div className="text-sm font-medium text-slate-900">{s.name}</div><div className="text-xs text-slate-500">{s.type}</div></div>
              </div>
              <div className="text-right"><div className={`inline-flex items-center gap-1 text-xs font-medium ${ok ? "text-emerald-600":"text-amber-600"}`}>{ok?<CheckCircle2 size={14}/>:<AlertTriangle size={14}/>} {s.status}</div><div className="mt-1 text-[11px] text-slate-400">{s.freshness}</div></div>
            </div>
          )})}
        </div>
      </Card>
      <Card title="Reconciliation workbench" subtitle="Exceptions between internal book and source records">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead><tr className="border-b border-slate-100"><Th>Break</Th><Th>Account / security</Th><Th>Issue</Th><Th right>Internal</Th><Th right>Source</Th><Th right>Difference</Th><Th>Status</Th></tr></thead>
            <tbody className="divide-y divide-slate-50">{breaks.map((b)=>(
              <tr key={b.id} className="hover:bg-slate-50/70"><Td mono className="text-slate-500">{b.id}</Td><Td className="font-medium text-slate-800">{b.account}</Td><Td className="text-slate-600">{b.issue}</Td><Td right mono>{b.local>1000?money(b.local,base):b.local.toFixed(2)}</Td><Td right mono>{b.source>1000?money(b.source,base):b.source.toFixed(2)}</Td><Td right mono className="text-amber-700">{b.diff>1000?money(b.diff,base):b.diff.toFixed(2)}</Td><Td><span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">Open</span></Td></tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
        <b>Prototype boundary:</b> these connectors and reconciliation results are simulated. A production implementation would integrate authorized source APIs/files, configurable tolerances, approvals and an immutable audit trail.
      </div>
    </div>
  );
}

function Reports({ m, base }) {
  const reports = [
    { name: "Investment Committee Pack", desc: "Allocation, performance, risk, liquidity and compliance", period: "Jul 2026", format: "PDF" },
    { name: "Portfolio Valuation Statement", desc: "Position-level market values and private NAV", period: "31 Jul 2026", format: "PDF / XLSX" },
    { name: "Private Markets Summary", desc: "Commitments, calls, distributions, DPI, TVPI and IRR", period: "Q2 2026", format: "PDF" },
    { name: "Compliance Exceptions", desc: "Mandate checks, warnings and review notes", period: "Live", format: "CSV" },
  ];
  const exportCsv = () => {
    const rows = [["Metric","Value"],["Total assets",m.aum],["Public markets",m.pubTotal],["Private NAV",m.privNav],["Cash",m.cash],["Uncalled commitments",m.unfunded]];
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="atlas-portfolio-summary.csv"; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center">
        <div><div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Board-ready reporting</div><h2 className="mt-1 text-xl font-semibold">Northstar Capital — July 2026</h2><p className="mt-1 text-sm text-slate-400">Consolidated public and private markets reporting prototype.</p></div>
        <div className="flex gap-2 no-print"><button onClick={()=>window.print()} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">Print / Save PDF</button><button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"><Download size={15}/> Export CSV</button></div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="Total assets" value={moneyC(m.aum,base)}/><Stat label="Public markets" value={moneyC(m.pubTotal,base)}/><Stat label="Private NAV" value={moneyC(m.privNav,base)}/><Stat label="Uncalled" value={moneyC(m.unfunded,base)}/></div>
      <Card title="Report library" subtitle="Examples of scheduled and on-demand client / committee outputs">
        <div className="divide-y divide-slate-100">{reports.map(r=>(
          <div key={r.name} className="flex items-center justify-between gap-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"><FileText size={17} className="text-slate-600"/></div><div><div className="text-sm font-medium text-slate-900">{r.name}</div><div className="text-xs text-slate-500">{r.desc}</div></div></div><div className="flex items-center gap-5 text-right"><div><div className="text-xs font-medium text-slate-700">{r.period}</div><div className="text-[11px] text-slate-400">{r.format}</div></div><button onClick={()=>window.print()} className="no-print rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Generate report"><Download size={15}/></button></div></div>
        ))}</div>
      </Card>
      <Card title="Recent activity" subtitle="Illustrative operational audit trail">
        <div className="space-y-3">{[
          ["Market data refresh completed","System","4 minutes ago"],
          ["Reconciliation break REC-1042 assigned","Portfolio Operations","18 minutes ago"],
          ["July committee pack generated","Investment Team","2 hours ago"],
          ["Private fund NAV updated — Redwood Ventures IV","Portfolio Operations","1 day ago"],
        ].map(([a,u,t])=><div key={a} className="flex items-center justify-between rounded-lg border border-slate-100 p-3"><div className="flex items-center gap-2.5"><Clock3 size={15} className="text-slate-400"/><div><div className="text-sm text-slate-800">{a}</div><div className="text-xs text-slate-400">{u}</div></div></div><div className="text-xs text-slate-400">{t}</div></div>)}</div>
      </Card>
    </div>
  );
}

/* Add-transaction modal ------------------------------------------- */
function AddTx({ base, onClose, onSave }) {
  const [type, setType] = useState("BUY");
  const [security, setSecurity] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("2026-08-11");
  const inflow = ["DIVIDEND", "COUPON", "DISTRIBUTION", "SELL"].includes(type);
  const sleeve = ["DISTRIBUTION", "CAPITAL CALL"].includes(type) ? "private" : "public";
  const valid = security.trim() && Number(amount) > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Add transaction</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <Field label="Type">
            <div className="relative">
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
                {["BUY", "SELL", "DIVIDEND", "COUPON", "DISTRIBUTION", "CAPITAL CALL", "FX"].map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-2.5 text-slate-400" />
            </div>
          </Field>
          <Field label="Security / vehicle">
            <input value={security} onChange={(e) => setSecurity(e.target.value)} placeholder="e.g. AAPL, Redwood Ventures IV" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </Field>
          <Field label={`Amount (${base})`}>
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <p className="mt-1 text-xs text-slate-500">Recorded as {inflow ? "an inflow (+)" : "an outflow (\u2212)"} on the {sleeve} sleeve.</p>
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500">Cancel</button>
          <button
            disabled={!valid}
            onClick={() => onSave({ date, type, security, sleeve, ccy: base, amount: (inflow ? 1 : -1) * Number(amount) })}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save transaction
          </button>
        </div>
      </div>
    </div>
  );
}
const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
    {children}
  </div>
);
