#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

if (process.argv.length <= 2) {
  console.log('Uso: node scripts/normalize-encoding.js <file1> [file2 ...]');
  process.exit(1);
}

for (let i = 2; i < process.argv.length; i++) {
  const p = path.resolve(process.cwd(), process.argv[i]);
  try {
    const buf = fs.readFileSync(p);
    // Interpret bytes as latin1 (single-byte) and re-encode as UTF-8
    const text = buf.toString('latin1');
    fs.writeFileSync(p, text, 'utf8');
    console.log('Normalizado a UTF-8:', process.argv[i]);
  } catch (err) {
    console.error('Error procesando', process.argv[i], err.message);
  }
}
