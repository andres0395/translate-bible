#!/usr/bin/env node
/**
 * scripts/validate-chapter.mjs
 *
 * Valida un archivo JSON de capítulo contra el esquema y las convenciones
 * del proyecto. Opcionalmente corrige automáticamente el síntoma de
 * "comilla perdida" (« sin cierre con », o " suelto donde debería ir »).
 *
 * Checks (errores bloqueantes):
 *   1. Verses consecutivos desde 1.
 *   2. Parts cubren todos los versículos sin solaparse.
 *   3. Note IDs únicos.
 *   4. Cada [n] en el texto tiene su nota correspondiente.
 *   5. Cada note.verse apunta a un versículo real.
 *   6. Balance de comillas: count(«) == count(»).
 *
 * Checks (warnings):
 *   7. Note IDs consecutivos (recomendado).
 *   8. Notas sin marca [n] en el texto (puede ser intencional si la nota
 *      referencia contexto de varias marcas).
 *   9. Comilla " suelta al final de un versículo dentro de un speech abierto
 *      (auto-fixable: se reemplaza por »).
 *
 * Uso:
 *   node scripts/validate-chapter.mjs <ruta-al-json>
 *   node scripts/validate-chapter.mjs --fix <ruta-al-json>   (auto-corrige)
 *   node scripts/validate-chapter.mjs content/books/genesis/24.json
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const fix = args[0] === "--fix";
const target = fix ? args[1] : args[0];

if (!target) {
  console.error(
    "Uso: node scripts/validate-chapter.mjs [--fix] <ruta-al-json-o-directorio>",
  );
  process.exit(1);
}

/** @type {string[]} */
const files = [];
const stat = fs.statSync(target);
if (stat.isDirectory()) {
  const entries = fs.readdirSync(target);
  for (const entry of entries) {
    const full = path.join(target, entry);
    if (fs.statSync(full).isFile() && entry.endsWith(".json")) {
      files.push(full);
    }
  }
} else {
  files.push(target);
}

let totalErrors = 0;
let totalWarnings = 0;
let totalFixed = 0;

for (const file of files) {
  console.log(`\n── ${path.relative(process.cwd(), file)} ──`);
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  const errors = [];
  const warnings = [];

  // 1. Verses consecutivos
  const nums = data.verses.map((v) => v.number);
  if (nums[0] !== 1) {
    errors.push(`Primer versículo no es 1: ${nums[0]}`);
  }
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1] + 1) {
      errors.push(`Versículos no consecutivos: ${nums[i - 1]} → ${nums[i]}`);
    }
  }

  // 2. Parts coverage
  const allVerseNums = new Set(nums);
  const seen = new Set();
  for (const part of data.parts) {
    const [s, e] = part.verseRange;
    for (let n = s; n <= e; n++) {
      if (!allVerseNums.has(n)) {
        errors.push(`Parte "${part.title}" referencia versículo inexistente: ${n}`);
      }
      if (seen.has(n)) {
        errors.push(`Versículo ${n} aparece en múltiples partes`);
      }
      seen.add(n);
    }
  }
  for (const n of allVerseNums) {
    if (!seen.has(n)) {
      errors.push(`Versículo ${n} no está cubierto por ninguna parte`);
    }
  }

  // 3. Note IDs únicos
  const noteIds = data.notes.map((n) => n.id);
  const uniqueIds = new Set(noteIds);
  if (uniqueIds.size !== noteIds.length) {
    errors.push(`IDs de notas duplicados`);
  }

  // 4. [n] marks ↔ notes
  const fullText = data.verses.map((v) => v.text).join(" ");
  const marks = [...fullText.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
  for (const m of marks) {
    if (!uniqueIds.has(m)) {
      errors.push(`Marca [${m}] no tiene nota correspondiente`);
    }
  }

  // 5. Notes point to valid verses
  for (const note of data.notes) {
    if (!allVerseNums.has(note.verse)) {
      errors.push(`Nota ${note.id} apunta a versículo inválido: ${note.verse}`);
    }
  }

  // 6. Quote balance
  const openCount = (fullText.match(/«/g) || []).length;
  const closeCount = (fullText.match(/»/g) || []).length;
  if (openCount !== closeCount) {
    errors.push(
      `Desbalance de comillas: ${openCount} aperturas « pero ${closeCount} cierres »`,
    );
  }

  // 7. Note IDs consecutivos
  for (let i = 1; i < noteIds.length; i++) {
    if (noteIds[i] !== noteIds[i - 1] + 1) {
      warnings.push(`IDs de notas no consecutivos: ${noteIds[i - 1]} → ${noteIds[i]}`);
    }
  }

  // 8. Notas sin marca [n]
  for (const id of uniqueIds) {
    if (!marks.includes(id)) {
      warnings.push(`Nota ${id} no tiene marca [${id}] en el texto`);
    }
  }

  // 9. Comilla " suelta con auto-fix
  let openRunning = 0;
  let fixed = 0;
  for (let i = 0; i < data.verses.length; i++) {
    const verse = data.verses[i];
    const opens = (verse.text.match(/«/g) || []).length;
    const closes = (verse.text.match(/»/g) || []).length;
    openRunning += opens - closes;

    if (openRunning > 0 && /"(\.|\?|!)?$/.test(verse.text)) {
      // Miramos el siguiente versículo: si abre un « nuevo, la " actual es
      // un cierre de speech que se perdió (debe ser »).
      const next = data.verses[i + 1];
      const nextOpens = next ? (next.text.match(/«/g) || []).length : 0;
      const isLastVerse = !next;

      if (nextOpens > 0 || isLastVerse) {
        warnings.push(
          `v.${verse.number}: cierre " suelto en medio de un speech (auto-fix: " → »)`,
        );
        if (fix) {
          verse.text = verse.text.replace(/"(\.|\?|!)?$/, "»$1");
          openRunning--;
          fixed++;
        }
      }
    }
  }

  // 10. Comilla « suelta al inicio de un versículo (sin auto-fix).
  // Si la running count ya era > 0 al empezar este versículo, el « de
  // apertura no es un speech nuevo sino un sub-párrafo mal marcado.
  openRunning = 0;
  for (let i = 0; i < data.verses.length; i++) {
    const verse = data.verses[i];
    if (openRunning > 0 && verse.text.startsWith("«")) {
      // Verificamos que el versículo anterior no sea el cierre del speech
      const prev = data.verses[i - 1];
      const prevClosed = prev && /»/.test(prev.text);
      if (!prevClosed) {
        warnings.push(
          `v.${verse.number}: « inicial cuando ya hay un speech abierto (no es speech nuevo)`,
        );
      }
    }
    const opens = (verse.text.match(/«/g) || []).length;
    const closes = (verse.text.match(/»/g) || []).length;
    openRunning += opens - closes;
  }

  console.log(
    `  Versículos: ${data.verses.length} | Partes: ${data.parts.length} | Notas: ${data.notes.length} | Comillas: ${openCount} « / ${closeCount} »`,
  );

  if (errors.length > 0) {
    console.log(`  ✗ ${errors.length} error(es):`);
    for (const e of errors) console.log(`    - ${e}`);
    totalErrors += errors.length;
  }
  if (warnings.length > 0) {
    console.log(`  ⚠ ${warnings.length} advertencia(s):`);
    for (const w of warnings) console.log(`    - ${w}`);
    totalWarnings += warnings.length;
  }
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`  ✓ Sin problemas`);
  }

  if (fix && fixed > 0) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log(`  🔧 ${fixed} comilla(s) corregida(s) y archivo reescrito`);
    totalFixed += fixed;
  }
}

console.log(
  `\n── Resumen ──\n  Archivos: ${files.length}\n  Errores: ${totalErrors}\n  Advertencias: ${totalWarnings}\n  Auto-fixes aplicados: ${totalFixed}`,
);
process.exit(totalErrors > 0 ? 1 : 0);
