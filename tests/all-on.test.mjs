import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function boot() {
  const elements = {};
  const downloads = [];
  const context = vm.createContext({
    document: {
      getElementById: id => elements[id] ??= { innerHTML: '', value: '', appendChild() {} },
      createElement: () => ({ click() { downloads.push(this.download); }, remove() {} }),
      querySelector: () => ({ classList: { add() {} } }),
    },
    setTimeout() {}, Blob, URL, console,
  });
  vm.runInContext(script, context);
  return { evaluate: code => vm.runInContext(code, context), downloads };
}

test('all six roles render every permitted module in both currencies', () => {
  const { evaluate } = boot();
  assert.equal(evaluate('Object.keys(ROLES).length'), 6);
  assert.equal(evaluate('Object.keys(NAVMETA).length'), 14);
  evaluate(`for (const role of Object.keys(ROLES)) {
    signIn(role);
    for (const ccy of ['NGN', 'USD']) {
      setCcy(ccy);
      for (const module of ROLES[role].modules) {
        go(module);
        if (!document.getElementById('app').innerHTML.includes(NAVMETA[module][1])) throw Error(role + ':' + module);
      }
    }
    signOut();
  }`);
});

test('dated FX translation preserves original USD values and booked cost', () => {
  const { evaluate } = boot();
  const initial = evaluate('metrics().nav');
  evaluate("signIn('admin'); selectValuationDate('2026-06-30')");
  assert.equal(evaluate("originalValue(investments.find(i => i.ccy === 'USD'))"), 256250);
  assert.equal(evaluate("investments.find(i => i.ccy === 'USD').amount"), 400000000);
  assert.equal(evaluate('metrics().nav'), initial + 256250 * 15);
  evaluate("selectValuationDate('2026-09-30')");
  assert.equal(evaluate('metrics().nav'), initial);
});

test('company governance, documents, contacts and equity details render', () => {
  const { evaluate } = boot();
  evaluate("signIn('admin'); openCompany('c2')");
  for (const text of ['RC Number', 'TIN', 'Contact persons', 'Board members', 'Uploading user / timestamp', 'Information rights', 'Board meetings']) {
    assert.ok(evaluate('S.drawer').includes(text), text);
  }
  assert.equal(evaluate("co('c2').docs.length"), 5);
  assert.ok(evaluate("notifications.some(n => n.id.startsWith('doc-c2-'))"));
  evaluate("closeDrawer(); openEquity('i6')");
  for (const text of ['Co-investors', 'Capital injection', 'Dividend received', 'Capital return', 'Exit']) {
    assert.ok(evaluate('S.drawer').includes(text), text);
  }
  evaluate("closeDrawer(); go('management')");
  assert.ok(evaluate("document.getElementById('app').innerHTML").includes('Management exception list'));
});

test('risk amendment applies only after both approval stages', () => {
  const { evaluate } = boot();
  evaluate("signIn('im'); approve('a1', 'im')");
  assert.equal(evaluate("co('c2').risk"), 'Medium');
  evaluate("signIn('fm'); approve('a1', 'fm')");
  assert.equal(evaluate("co('c2').risk"), 'High');
  assert.equal(evaluate("approvals.some(a => a.id === 'a1')"), false);
});

test('entry workflows save session drafts without changing seeded values', () => {
  const { evaluate } = boot();
  const nav = evaluate('metrics().nav');
  evaluate("signIn('admin'); entryDraft={kind:'company',name:'Bonny Clean Energy Ltd',sector:'Mini-grids',location:'Bonny, Rivers'}; saveEntry()");
  evaluate("entryDraft={kind:'investment',company:'Bonny Clean Energy Ltd',type:'Straight Debt',currency:'USD',amount:'125000'}; saveEntry()");
  assert.equal(evaluate('demoDrafts.companies.length'), 1);
  assert.equal(evaluate('demoDrafts.investments.length'), 1);
  assert.equal(evaluate('companies.length'), 6);
  assert.equal(evaluate('investments.length'), 9);
  assert.equal(evaluate('metrics().nav'), nav);
  evaluate("signIn('viewer'); entryDraft={kind:'company',name:'Blocked entry'}; saveEntry()");
  assert.equal(evaluate('demoDrafts.companies.length'), 1);
});

test('administrator permissions are explicit and deletion is role guarded', () => {
  const { evaluate } = boot();
  evaluate("signIn('admin'); go('admin')");
  const rendered = evaluate("document.getElementById('app').innerHTML");
  for (const text of ['System Administrator workspace', 'User directory', 'Roles and permissions', 'Approve as Investment Manager', 'Approve as Finance Manager']) {
    assert.ok(rendered.includes(text), text);
  }
  evaluate("deleteUser('u1')");
  assert.equal(evaluate('adminUsers.length'), 6);
  evaluate("signIn('viewer'); deleteUser('u6')");
  assert.equal(evaluate('adminUsers.length'), 6);
  evaluate("signIn('admin'); deleteUser('u6')");
  assert.equal(evaluate('adminUsers.length'), 5);
  assert.ok(evaluate("audit.some(a => a.act === 'Deleted demo user Board Viewer')"));
});

test('invoices, payments, import, assistant, exports and audit remain operational', () => {
  const { evaluate, downloads } = boot();
  evaluate("signIn('admin'); issueInvoice('v6'); recordPayment('v4'); genInvoice()");
  assert.equal(evaluate("invoices.find(v => v.id === 'v4').status"), 'Paid');
  assert.equal(evaluate("invoices.find(v => v.id === 'v6').status"), 'Issued');
  assert.equal(evaluate('invoices.length'), 7);
  evaluate("showImportPreview('sample.csv', true); confirmImport()");
  assert.equal(evaluate('investments.length'), 9);
  assert.equal(evaluate('companies.length'), 6);
  assert.equal(evaluate('demoDrafts.investments.length'), 2);
  assert.match(evaluate("answerAI('total portfolio value')"), /NAV/);
  evaluate("askQuick('Which invoices are overdue?'); genCommentary(); exportJournal(); downloadValuation(); downloadExcel('impact.xls', esgRows())");
  assert.equal(evaluate('S.chat.length'), 2);
  assert.ok(evaluate('S.commentary'));
  assert.ok(evaluate('audit.length') > 4);
  assert.ok(downloads.length >= 3);
});
