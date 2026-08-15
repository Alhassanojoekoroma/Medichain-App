import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const directory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(directory, '../src/tokens.json');
const outputPath = path.resolve(directory, '../src/tokens.css');
const tokens = JSON.parse(await readFile(sourcePath, 'utf8'));
const declarations = [];

for (const [group, values] of Object.entries(tokens.colors)) {
  if (typeof values === 'string') declarations.push(`  --${group}: ${values};`);
  else for (const [shade, value] of Object.entries(values)) declarations.push(`  --${group}-${shade}: ${value};`);
}
for (const [name, value] of Object.entries(tokens.spacing)) declarations.push(`  --space-${name}: ${value}px;`);
for (const [name, value] of Object.entries(tokens.radii)) declarations.push(`  --r-${name}: ${value}px;`);
for (const [name, value] of Object.entries(tokens.type)) declarations.push(`  --type-${name}: ${value}px;`);
for (const [name, value] of Object.entries(tokens.shadows)) declarations.push(`  --shadow-${name}: ${value};`);
for (const [portal, ramp] of Object.entries(tokens.accents)) {
  for (const [shade, value] of Object.entries(ramp)) declarations.push(`  --accent-${portal}-${shade}: ${value};`);
}
declarations.push(`  --touch-target: ${tokens.touchTarget}px;`);

const css = `/* Generated from tokens.json. Do not edit by hand. */\n:root {\n${declarations.join('\n')}\n  --font-display: 'Sora', 'Avenir Next', 'Segoe UI', sans-serif;\n  --font-body: 'Plus Jakarta Sans', 'Avenir Next', 'Segoe UI', sans-serif;\n  --primary-900: ${tokens.accents.patient['900']};\n  --primary-800: ${tokens.accents.patient['800']};\n  --primary-700: ${tokens.accents.patient['700']};\n  --primary-600: ${tokens.accents.patient['600']};\n  --primary-500: ${tokens.accents.patient['500']};\n  --primary-400: ${tokens.accents.patient['400']};\n  --primary-300: ${tokens.accents.patient['300']};\n  --primary-200: ${tokens.accents.patient['200']};\n  --primary-100: ${tokens.accents.patient['100']};\n  --primary-50: ${tokens.accents.patient['50']};\n}\n`;

if (process.argv.includes('--check')) {
  const current = await readFile(outputPath, 'utf8').catch(() => '');
  if (current !== css) {
    console.error('tokens.css is stale; run npm run build in @medichain/design-system');
    process.exit(1);
  }
} else {
  await writeFile(outputPath, css, 'utf8');
}
