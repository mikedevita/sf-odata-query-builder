import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, '../public/icon.svg');
const svg = readFileSync(svgPath, 'utf8');

const sizes = [16, 32, 64, 128, 256, 512];

for (const size of sizes) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  writeFileSync(path.join(__dirname, `../public/icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png`);
}

// 512px as the main icon.png used by electron-builder
const resvg512 = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } });
writeFileSync(path.join(__dirname, '../public/icon.png'), resvg512.render().asPng());
console.log('Generated icon.png (512px)');
