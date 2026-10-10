#!/usr/bin/env node
// Regenerates reference/authoring-format.md from a saved `get_authoring_guide` response.
//
// Usage (from the repository root):
//   node tools/generate-reference.mjs <input> [--date YYYY-MM-DD]
//
// input   path to a text file with the saved response. Text before the line
//         "LMSABLE AUTHORING GUIDE" is removed, and so is everything from the
//         first line that is exactly "---" after it (room for your own notes).
// --date  date shown in the header (default: today, UTC).
//
// Node 18+, no dependencies. The output depends only on the input and the date.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const MARKER = 'LMSABLE AUTHORING GUIDE';
const TAIL_SEPARATOR = '---';

// process.argv[1] is the path of this script as Node resolved it.
const scriptDir = dirname(resolve(process.argv[1]));
const repoRoot = resolve(scriptDir, '..');

function fail(message) {
  console.error(`generate-reference: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  let input = null;
  let date = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--date') {
      date = argv[++i];
      if (!date) fail('--date needs a value (YYYY-MM-DD)');
    } else if (arg.startsWith('--date=')) {
      date = arg.slice('--date='.length);
    } else if (arg.startsWith('--')) {
      fail(`unknown option ${arg}`);
    } else if (input === null) {
      input = arg;
    } else {
      fail(`unexpected argument ${arg}`);
    }
  }
  return { input, date };
}

const { input, date: dateArg } = parseArgs(process.argv.slice(2));

if (input === null) fail('usage: node tools/generate-reference.mjs <input> [--date YYYY-MM-DD]');
const inputPath = resolve(process.cwd(), input);

const date = dateArg ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`invalid date "${date}", expected YYYY-MM-DD`);

let raw;
try {
  raw = readFileSync(inputPath, 'utf8');
} catch (err) {
  fail(`cannot read ${inputPath}: ${err.message}`);
}

const lines = raw.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');

const start = lines.findIndex((line) => line.trim() === MARKER);
if (start === -1) fail(`marker line "${MARKER}" not found in ${inputPath}`);

let end = lines.findIndex((line, i) => i > start && line.trim() === TAIL_SEPARATOR);
if (end === -1) end = lines.length;

const body = lines.slice(start, end);
while (body.length && body[body.length - 1].trim() === '') {
  body.pop();
}
// Strip trailing whitespace so the output is stable across editors.
const cleaned = body.map((line) => line.replace(/[ \t]+$/, ''));

if (cleaned.some((line) => line.startsWith('```'))) fail('input contains a code fence; cannot wrap it safely');

const output = [
  '# LMSable authoring format',
  '',
  `Generated from the live \`get_authoring_guide\` MCP response on ${date}. Do not edit by hand — regenerate instead.`,
  '',
  '```text',
  ...cleaned,
  '```',
  '',
].join('\n');

const outPath = resolve(repoRoot, 'reference', 'authoring-format.md');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, output, 'utf8');
console.log(`generate-reference: wrote ${outPath} (${cleaned.length} lines, date ${date})`);
