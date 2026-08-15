import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const portals = ['admin-web', 'doctor-web', 'government-web', 'nurse-web', 'staff-web'];
const failures = [];
for (const portal of portals) {
  for (const file of ['app/loading.tsx', 'app/error.tsx', 'app/not-found.tsx']) if (!fs.existsSync(path.join(root, portal, file))) failures.push(`${portal}: missing ${file}`);
  const layout = fs.readFileSync(path.join(root, portal, 'app/layout.tsx'), 'utf8');
  const css = fs.readFileSync(path.join(root, portal, 'app/globals.css'), 'utf8');
  if (!/href="#main-content"/.test(layout) || !/id="main-content"/.test(layout)) failures.push(`${portal}: skip navigation contract missing`);
  if (!/:focus-visible/.test(css)) failures.push(`${portal}: visible focus rule missing`);
  if (!/prefers-reduced-motion/.test(css)) failures.push(`${portal}: reduced-motion rule missing`);
  if (!/min-height:\s*44px/.test(css)) failures.push(`${portal}: minimum control target rule missing`);
}
const ux = fs.readFileSync(path.join(root, 'packages/palmchain-ux/index.ts'), 'utf8');
for (const state of ['initial', 'loading', 'partial', 'success', 'empty', 'no-results', 'error', 'offline', 'forbidden', 'unavailable', 'stale-retrying', 'completed-recoverable']) if (!ux.includes(`'${state}'`)) failures.push(`workflow state missing: ${state}`);
for (const locale of ['en-SL', 'kri-SL']) if (!ux.includes(`'${locale}'`)) failures.push(`locale missing: ${locale}`);
const budgets = JSON.parse(fs.readFileSync(path.join(root, 'docs/ux/performance-budgets.json'), 'utf8'));
if (budgets.web.largestContentfulPaintMs > 2500 || budgets.api.ordinaryP95Ms > 500 || budgets.mobile.minimumTouchTargetCssPx < 44) failures.push('performance/accessibility budgets are weaker than the approved engineering targets');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Phase 9 UX contract check passed for ${portals.length} portals, 12 workflow states, 2 locale foundations, and performance budgets.`);
