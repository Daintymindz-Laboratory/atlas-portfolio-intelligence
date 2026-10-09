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
    },
    setTimeout() {}, Blob, URL, console,
  });
  vm.runInContext(script, context);
  return { evaluate: code => vm.runInContext(code, context), downloads };
}

test('all six roles render every permitted module in both currencies', () => {
  const { evaluate } = boot();
  assert.equal(evaluate('Object.keys(ROLES).length'), 6);
  assert.equal(evaluate('Object.keys(NAVMETA).length'), 12);
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

test('risk amendment applies only after both approval stages', () => {
  const { evaluate } = boot();
  evaluate("signIn('im'); approve('a1', 'im')");
  assert.equal(evaluate("co('c2').risk"), 'Medium');
  evaluate("signIn('fm'); approve('a1', 'fm')");
  assert.equal(evaluate("co('c2').risk"), 'High');
  assert.equal(evaluate("approvals.some(a => a.id === 'a1')"), false);
});

test('invoices, payments, import, assistant, exports and audit remain operational', () => {
  const { evaluate, downloads } = boot();
  evaluate("signIn('admin'); issueInvoice('v6'); recordPayment('v4'); genInvoice()");
  assert.equal(evaluate("invoices.find(v => v.id === 'v4').status"), 'Paid');
  assert.equal(evaluate("invoices.find(v => v.id === 'v6').status"), 'Issued');
  assert.equal(evaluate('invoices.length'), 7);
  evaluate('confirmImport()');
  assert.equal(evaluate('investments.length'), 11);
  assert.equal(evaluate('companies.length'), 7);
  assert.match(evaluate("answerAI('total portfolio value')"), /NAV/);
  evaluate("askQuick('Which invoices are overdue?'); genCommentary(); exportJournal(); downloadValuation(); downloadExcel('impact.xls', esgRows())");
  assert.equal(evaluate('S.chat.length'), 2);
  assert.ok(evaluate('S.commentary'));
  assert.ok(evaluate('audit.length') > 4);
  assert.ok(downloads.length >= 3);
});
