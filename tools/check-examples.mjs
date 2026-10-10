#!/usr/bin/env node
// Validates every JSON example in examples/*.md against the LMSable authoring contract
// (reference/authoring-format.md). Node 18+, zero dependencies.
// Usage (from the repo root):
//   node tools/check-examples.mjs               examples + self-test
//   node tools/check-examples.mjs --examples    examples only
//   node tools/check-examples.mjs --self-test   negative cases only (tests/negative/*.json)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const onlySelf = args.includes('--self-test');
const onlyExamples = args.includes('--examples');

// ---------------------------------------------------------------- contract
// Block type names are parsed from the contract; required/optional fields live in this map.
const SPEC = {
  text: { req: ['html'], opt: [] },
  statement: { req: ['html'], opt: ['variant'] },
  quote: { req: ['html'], opt: ['source'] },
  accordion: { req: ['items'], opt: [] },
  tabs: { req: ['items'], opt: [] },
  checklist: { req: ['items'], opt: [] },
  columns: { req: [], opt: ['left', 'right', 'leftImageId', 'rightImageId'] },
  hidden: { req: ['html'], opt: ['label'] },
  flashcards: { req: ['cards'], opt: [] },
  image: { req: ['imageId'], opt: ['caption', 'lightbox'] },
  imagesection: { req: ['imageId'], opt: ['title', 'html'] },
  continue: { req: [], opt: ['label'] },
  slider: { req: ['items'], opt: [] },
  hotspot: { req: ['imageId', 'spots'], opt: [] },
  attachment: { req: ['fileId'], opt: ['label'] },
  video: { req: [], opt: ['url', 'videoId', 'caption'] },
  audio: { req: ['fileId'], opt: ['caption'] },
  table: { req: ['rows'], opt: ['header'] },
  divider: { req: [], opt: [] },
  header: { req: ['text'], opt: ['level', 'underline', 'banner', 'icon', 'meta'] },
  survey: { req: ['title', 'questions'], opt: ['intro', 'thanks'] },
  list: { req: ['items', 'style'], opt: ['title'] },
};

function parseContract() {
  const p = join(ROOT, 'reference', 'authoring-format.md');
  if (!existsSync(p)) fatal(`missing ${p}`);
  const lines = readFileSync(p, 'utf8').replace(/\r/g, '').split('\n');
  const h = lines.findIndex((l) => /^Block types \(\d+\):/.test(l));
  if (h < 0) fatal('reference/authoring-format.md: no "Block types (N):" section');
  const n = Number(lines[h].match(/\((\d+)\)/)[1]);
  const types = [];
  for (let i = h + 1; i < lines.length && /^\s+\S/.test(lines[i]); i++) types.push(lines[i].trim().split(/\s+/)[0]);
  if (types.length !== n) fatal(`contract header says ${n} block types, parsed ${types.length}`);
  const unknown = types.filter((t) => !SPEC[t]);
  if (unknown.length) fatal(`contract has block types unknown to this validator (update SPEC in tools/check-examples.mjs): ${unknown.join(', ')}`);
  const stale = Object.keys(SPEC).filter((t) => !types.includes(t));
  if (stale.length) fatal(`validator SPEC has types missing from the contract: ${stale.join(', ')}`);
  return types;
}
function fatal(m) { console.error(`check-examples: ${m}`); process.exit(1); }

const BLOCK_TYPES = parseContract();
const ALLOWED_TAGS = new Set('p br strong b em i u a h2 h3 h4 ul ol li hr blockquote table thead tbody tr th td img'.split(' '));
const ICONS = 'shield mail phone lock alert key cloud user book flag'.split(' ');
const LIST_STYLES = ['bullet', 'check', 'arrow', 'number'];
const VARIANTS = ['highlight', 'info', 'warning', 'success', 'law'];
const LESSON_TYPES = ['lesson', 'video', 'interaction', 'quiz', 'test', 'scenario'];
const OPS = ['replace_text', 'set_field', 'insert_block', 'delete_block'];
const VIDEO_HOSTS = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com|player\.vimeo\.com|loom\.com)\//i;
const ID_KEY = /(?:imageid|fileid|videoid)$/i;

// ---------------------------------------------------------------- helpers
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
const isInt = (x) => Number.isInteger(x);

function makeCtx() {
  const errors = [];
  return { errors, used: new Map(), err: (m) => errors.push(m) };
}

function noIds(c, where, v) {
  if (Array.isArray(v)) v.forEach((x, i) => noIds(c, `${where}[${i}]`, x));
  else if (isObj(v)) for (const [k, x] of Object.entries(v)) {
    if (ID_KEY.test(k)) c.err(`${where}.${k}: examples must not contain ${k} (ids are issued by the server, never invented)`);
    noIds(c, `${where}.${k}`, x);
  }
}

function text(c, where, s, max, { min = 0 } = {}) {
  if (typeof s !== 'string') return c.err(`${where}: must be a string`);
  if (s.length > max) c.err(`${where}: ${s.length} characters, limit ${max}`);
  if (s.length < min) c.err(`${where}: too short`);
}

function html(c, where, s, max) {
  text(c, where, s, max);
  if (typeof s !== 'string') return;
  for (const m of s.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g)) {
    const tag = m[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) c.err(`${where}: tag <${m[1]}> is not allowed`);
    const attrs = m[2].replace(/\/\s*$/, '').trim();
    if (m[0].startsWith('</') || !attrs) continue;
    if (tag !== 'a' || !/^href\s*=\s*("[^"]*"|'[^']*')$/.test(attrs)) c.err(`${where}: attribute "${attrs}" on <${tag}> is not allowed (only href on <a>)`);
    else if (/^href\s*=\s*["']\s*(javascript|vbscript|data):/i.test(attrs)) c.err(`${where}: unsafe href`);
  }
}

function list(c, where, a, min, max) {
  if (!Array.isArray(a)) { c.err(`${where}: must be a list`); return false; }
  if (a.length < min || a.length > max) c.err(`${where}: ${a.length} entries, allowed ${min}-${max}`);
  return true;
}

function fields(c, where, o, allowed) {
  if (!isObj(o)) { c.err(`${where}: must be an object`); return false; }
  for (const k of Object.keys(o)) if (!allowed.includes(k)) c.err(`${where}: unknown field "${k}"`);
  return true;
}

// ---------------------------------------------------------------- blocks
function checkBlock(c, b, i) {
  const w = `block ${i}`;
  if (!isObj(b)) return c.err(`${w}: must be an object`);
  if (!BLOCK_TYPES.includes(b.type)) return c.err(`${w}: unknown block type "${b.type}"`);
  const spec = SPEC[b.type];
  const W = `${w} (${b.type})`;
  c.used.set(b.type, (c.used.get(b.type) || 0) + 1);
  for (const k of spec.req) if (!(k in b)) c.err(`${W}: missing required field "${k}"`);
  for (const k of Object.keys(b)) if (k !== 'type' && !spec.req.includes(k) && !spec.opt.includes(k)) c.err(`${W}: unknown field "${k}"`);
  noIds(c, W, b);

  const T = b.type;
  if (['text', 'statement', 'quote', 'hidden'].includes(T) && 'html' in b) html(c, `${W}.html`, b.html, 20000);
  if (T === 'imagesection' && 'html' in b) html(c, `${W}.html`, b.html, 20000);
  if (T === 'columns') for (const k of ['left', 'right']) if (k in b) html(c, `${W}.${k}`, b[k], 20000);
  for (const k of ['source', 'label', 'caption', 'title', 'text']) if (k in b && !['accordion', 'tabs'].includes(T)) text(c, `${W}.${k}`, b[k], 500);
  if (T === 'statement' && 'variant' in b && !VARIANTS.includes(b.variant)) c.err(`${W}.variant: "${b.variant}" not in ${VARIANTS.join('|')}`);
  if (T === 'header') {
    if ('level' in b && ![2, 3].includes(b.level)) c.err(`${W}.level: must be 2 or 3`);
    if ('icon' in b && !ICONS.includes(b.icon)) c.err(`${W}.icon: "${b.icon}" not in ${ICONS.join('|')}`);
    if ('meta' in b) text(c, `${W}.meta`, b.meta, 160);
    for (const k of ['underline', 'banner']) if (k in b && typeof b[k] !== 'boolean') c.err(`${W}.${k}: must be boolean`);
  }
  if (T === 'image' && 'lightbox' in b && typeof b.lightbox !== 'boolean') c.err(`${W}.lightbox: must be boolean`);
  if (T === 'table' && 'header' in b && typeof b.header !== 'boolean') c.err(`${W}.header: must be boolean`);
  if (T === 'video') {
    const hasUrl = 'url' in b, hasId = 'videoId' in b;
    if (hasUrl === hasId) c.err(`${W}: exactly one of url / videoId is required`);
    if (hasUrl && !(typeof b.url === 'string' && VIDEO_HOSTS.test(b.url))) c.err(`${W}.url: must be an https YouTube, Vimeo or Loom link`);
  }
  if (T === 'accordion' || T === 'tabs') {
    if (list(c, `${W}.items`, b.items, 1, 30)) b.items.forEach((it, j) => {
      if (!fields(c, `${W}.items[${j}]`, it, ['title', 'html'])) return;
      for (const k of ['title', 'html']) if (!(k in it)) c.err(`${W}.items[${j}]: missing "${k}"`);
      if ('title' in it) text(c, `${W}.items[${j}].title`, it.title, 500, { min: 1 });
      if ('html' in it) html(c, `${W}.items[${j}].html`, it.html, 20000);
    });
  }
  if (T === 'checklist' || T === 'list') {
    if (list(c, `${W}.items`, b.items, 1, 30)) b.items.forEach((s, j) => text(c, `${W}.items[${j}]`, s, 500));
    if (T === 'list' && 'style' in b && !LIST_STYLES.includes(b.style)) c.err(`${W}.style: "${b.style}" not in ${LIST_STYLES.join('|')}`);
  }
  if (T === 'flashcards' && list(c, `${W}.cards`, b.cards, 1, 30)) b.cards.forEach((card, j) => {
    if (!fields(c, `${W}.cards[${j}]`, card, ['front', 'back'])) return;
    for (const k of ['front', 'back']) { if (!(k in card)) c.err(`${W}.cards[${j}]: missing "${k}"`); else { text(c, `${W}.cards[${j}].${k}`, card[k], 500); if (/<[a-z/][^>]*>/i.test(card[k])) c.err(`${W}.cards[${j}].${k}: plain text only, no HTML`); } }
  });
  if (T === 'table' && list(c, `${W}.rows`, b.rows, 1, 30)) b.rows.forEach((r, j) => {
    if (list(c, `${W}.rows[${j}]`, r, 1, 8)) r.forEach((cell, k) => text(c, `${W}.rows[${j}][${k}]`, cell, 500));
  });
  if (T === 'slider' && list(c, `${W}.items`, b.items, 2, 10)) b.items.forEach((it, j) => {
    if (fields(c, `${W}.items[${j}]`, it, ['imageId', 'caption']) && 'caption' in it) text(c, `${W}.items[${j}].caption`, it.caption, 500);
  });
  if (T === 'hotspot' && list(c, `${W}.spots`, b.spots, 1, 15)) b.spots.forEach((s, j) => {
    if (!fields(c, `${W}.spots[${j}]`, s, ['x', 'y', 'title', 'html'])) return;
    for (const k of ['x', 'y']) if (typeof s[k] !== 'number' || s[k] < 0 || s[k] > 100) c.err(`${W}.spots[${j}].${k}: number 0-100 required`);
    if ('title' in s) text(c, `${W}.spots[${j}].title`, s.title, 500);
    if ('html' in s) html(c, `${W}.spots[${j}].html`, s.html, 20000);
  });
  if (T === 'survey') {
    for (const k of ['intro', 'thanks']) if (k in b) text(c, `${W}.${k}`, b[k], 500);
    if (list(c, `${W}.questions`, b.questions, 1, 10)) {
      const ids = new Set();
      b.questions.forEach((q, j) => {
        const Q = `${W}.questions[${j}]`;
        if (!fields(c, Q, q, ['id', 'kind', 'text', 'minLabel', 'maxLabel', 'options'])) return;
        if (typeof q.id !== 'string' || !/^[a-z0-9_-]{1,32}$/.test(q.id) || ids.has(q.id)) c.err(`${Q}.id: must be a unique slug`);
        ids.add(q.id);
        if (!['rating', 'nps', 'choice', 'text'].includes(q.kind)) c.err(`${Q}.kind: invalid`);
        text(c, `${Q}.text`, q.text, 500, { min: 1 });
        if (q.kind === 'choice') { if (list(c, `${Q}.options`, q.options, 2, 6)) q.options.forEach((o, k) => text(c, `${Q}.options[${k}]`, o, 500)); }
        else if ('options' in q) c.err(`${Q}: options only for kind "choice"`);
        if (q.kind !== 'rating') for (const k of ['minLabel', 'maxLabel']) if (k in q) c.err(`${Q}: ${k} only for kind "rating"`);
      });
    }
  }
}

function checkBlocksDoc(c, d) {
  fields(c, 'blocks document', d, ['version', 'blocks']);
  if (d.version !== 1) c.err('blocks document: version must be 1');
  if (!list(c, 'blocks', d.blocks, 0, 100)) return;
  d.blocks.forEach((b, i) => checkBlock(c, b, i));
  if (d.blocks.filter((b) => b && b.type === 'survey').length > 1) c.err('blocks: at most one survey block per lesson');
  if (Buffer.byteLength(JSON.stringify(d)) > 400 * 1024) c.err('blocks document: over 400 KB');
}

// ---------------------------------------------------------------- quiz
function checkQuiz(c, q) {
  fields(c, 'quiz', q, ['version', 'settings', 'questions']);
  if (q.version !== 1) c.err('quiz: version must be 1');
  if ('settings' in q && fields(c, 'quiz.settings', q.settings, ['shuffleQuestions', 'shuffleAnswers', 'maxAttempts', 'passPercent', 'timeLimitSeconds'])) {
    const s = q.settings;
    for (const k of ['shuffleQuestions', 'shuffleAnswers']) if (k in s && typeof s[k] !== 'boolean') c.err(`quiz.settings.${k}: must be boolean`);
    if ('maxAttempts' in s && !(isInt(s.maxAttempts) && s.maxAttempts >= 0 && s.maxAttempts <= 10)) c.err('quiz.settings.maxAttempts: integer 0-10');
    if ('passPercent' in s && !(isInt(s.passPercent) && s.passPercent >= 1 && s.passPercent <= 100)) c.err('quiz.settings.passPercent: integer 1-100');
    if ('timeLimitSeconds' in s && !(isInt(s.timeLimitSeconds) && (s.timeLimitSeconds === 0 || (s.timeLimitSeconds >= 120 && s.timeLimitSeconds <= 7200)))) c.err('quiz.settings.timeLimitSeconds: 0 or 120-7200');
    if (s.timeLimitSeconds > 0) c.err('quiz.settings.timeLimitSeconds: > 0 is behind a feature flag, examples must use 0');
  }
  if (!list(c, 'quiz.questions', q.questions, 1, 40)) return;
  const ids = new Set();
  q.questions.forEach((x, i) => {
    const w = `question ${x && x.id !== undefined ? x.id : '#' + i}`;
    if (!fields(c, w, x, ['id', 'type', 'text', 'options', 'feedback', 'answer'])) return;
    if (typeof x.id !== 'string' || !/^[a-z0-9_-]{1,32}$/.test(x.id)) c.err(`${w}: id must match /^[a-z0-9_-]{1,32}$/`);
    else if (ids.has(x.id)) c.err(`${w}: duplicate id`);
    ids.add(x.id);
    text(c, `${w}.text`, x.text, 500, { min: 1 });
    if ('feedback' in x && fields(c, `${w}.feedback`, x.feedback, ['correct', 'incorrect'])) for (const k of ['correct', 'incorrect']) if (k in x.feedback) text(c, `${w}.feedback.${k}`, x.feedback[k], 500);
    if (!['single', 'multi', 'truefalse'].includes(x.type)) return c.err(`${w}: type must be single|multi|truefalse`);
    if (x.type === 'truefalse') {
      if (typeof x.answer !== 'boolean') c.err(`${w}: truefalse needs answer:boolean`);
      if ('options' in x) c.err(`${w}: truefalse must not have options`);
      return;
    }
    if ('answer' in x) c.err(`${w}: "answer" is only for truefalse`);
    if (!list(c, `${w}.options`, x.options, 2, 6)) return;
    x.options.forEach((o, j) => {
      if (!fields(c, `${w}.options[${j}]`, o, ['text', 'correct'])) return;
      text(c, `${w}.options[${j}].text`, o.text, 300, { min: 1 });
      if (typeof o.correct !== 'boolean') c.err(`${w}.options[${j}].correct: must be boolean`);
    });
    const n = x.options.filter((o) => o && o.correct === true).length;
    if (x.type === 'single' && n !== 1) c.err(`${w}: single needs exactly 1 correct option (has ${n})`);
    if (x.type === 'multi' && n < 1) c.err(`${w}: multi needs at least 1 correct option`);
  });
}

// ---------------------------------------------------------------- scenario
function checkScenario(c, s) {
  fields(c, 'scenario', s, ['version', 'mode', 'passPercent', 'start', 'nodes', 'imageStyle']);
  if (s.version !== 1) c.err('scenario: version must be 1');
  if ('mode' in s && !['consequences', 'scored'].includes(s.mode)) c.err('scenario.mode: consequences|scored');
  if ('passPercent' in s && !(isInt(s.passPercent) && s.passPercent >= 1 && s.passPercent <= 100)) c.err('scenario.passPercent: integer 1-100');
  if ('imageStyle' in s) text(c, 'scenario.imageStyle', s.imageStyle, 400);
  if (!list(c, 'scenario.nodes', s.nodes, 2, 40)) return;
  const byId = new Map();
  s.nodes.forEach((n, i) => {
    if (!isObj(n)) return c.err(`node #${i}: must be an object`);
    if (typeof n.id !== 'string' || !/^[a-z0-9_-]{1,40}$/.test(n.id)) c.err(`node #${i}: id must match /^[a-z0-9_-]{1,40}$/`);
    else if (byId.has(n.id)) c.err(`node ${n.id}: duplicate id`);
    byId.set(n.id, n);
  });
  if (!byId.has(s.start)) c.err(`scenario.start: "${s.start}" is not an existing node`);
  else if (byId.get(s.start).ending) c.err('scenario.start: must not be an ending');
  const scored = s.mode === 'scored';
  for (const n of s.nodes) {
    if (!isObj(n)) continue;
    const w = `node ${n.id}`;
    const ending = n.ending === true;
    fields(c, w, n, ending ? ['id', 'ending', 'title', 'html', 'result', 'videoUrl', 'imageId'] : ['id', 'title', 'html', 'question', 'answers', 'videoUrl', 'imageId']);
    text(c, `${w}.title`, n.title, 200, { min: 1 });
    html(c, `${w}.html`, n.html, 5000);
    if ('videoUrl' in n && !(typeof n.videoUrl === 'string' && VIDEO_HOSTS.test(n.videoUrl))) c.err(`${w}.videoUrl: must be an https YouTube, Vimeo or Loom link`);
    if (ending) {
      if ('question' in n || 'answers' in n) c.err(`${w}: an ending must not have question or answers`);
      if ('result' in n && !['positive', 'negative', 'neutral'].includes(n.result)) c.err(`${w}.result: positive|negative|neutral`);
      continue;
    }
    if ('ending' in n) c.err(`${w}: "ending" must be true or absent`);
    text(c, `${w}.question`, n.question, 300, { min: 1 });
    if (!list(c, `${w}.answers`, n.answers, 2, 5)) continue;
    n.answers.forEach((a, j) => {
      const A = `${w}.answers[${j}]`;
      if (!fields(c, A, a, ['text', 'to', 'feedback', 'score'])) return;
      text(c, `${A}.text`, a.text, 200, { min: 1 });
      if ('feedback' in a) text(c, `${A}.feedback`, a.feedback, 500);
      if (!byId.has(a.to)) c.err(`${A}.to: "${a.to}" is not an existing node`);
      if (scored && ![0, 1].includes(a.score)) c.err(`${A}.score: 0 or 1 required in scored mode`);
    });
  }
  // reachability (BFS from start)
  if (byId.has(s.start)) {
    const seen = new Set([s.start]), queue = [s.start];
    while (queue.length) {
      const n = byId.get(queue.shift());
      for (const a of (n && Array.isArray(n.answers) ? n.answers : [])) if (a && byId.has(a.to) && !seen.has(a.to)) { seen.add(a.to); queue.push(a.to); }
    }
    if (!s.nodes.some((n) => isObj(n) && n.ending === true && seen.has(n.id))) c.err('scenario: no ending is reachable from start');
  }
}

// ---------------------------------------------------------------- toc
function checkToc(c, t) {
  fields(c, 'toc', t, ['modules']);
  if (!list(c, 'toc.modules', t.modules, 1, 1000)) return;
  t.modules.forEach((m, i) => {
    if (!fields(c, `module #${i}`, m, ['title', 'lessons'])) return;
    text(c, `module #${i}.title`, m.title, 200, { min: 1 });
    if (!list(c, `module #${i}.lessons`, m.lessons, 1, 1000)) return;
    m.lessons.forEach((l, j) => {
      const w = `module #${i} lesson #${j}`;
      if (!fields(c, w, l, ['title', 'type', 'time', 'description', 'content', 'material'])) return;
      text(c, `${w}.title`, l.title, 200, { min: 1 });
      if (!LESSON_TYPES.includes(l.type)) c.err(`${w}.type: "${l.type}" not in ${LESSON_TYPES.join('|')}`);
      if ('description' in l) text(c, `${w}.description`, l.description, 500);
      if ('time' in l) text(c, `${w}.time`, l.time, 50);
      if ('content' in l && typeof l.content !== 'string') c.err(`${w}.content: must be a string`);
      if ('material' in l && typeof l.material !== 'string') c.err(`${w}.material: must be a string`);
    });
  });
}

// ---------------------------------------------------------------- MCP tool args
function checkToolArgs(c, d) {
  if ('ops' in d) {
    if (list(c, 'tool args.ops', d.ops, 1, 10)) d.ops.forEach((o, i) => {
      if (!isObj(o)) return c.err(`ops[${i}]: must be an object`);
      if (!OPS.includes(o.op)) c.err(`ops[${i}].op: "${o.op}" not in ${OPS.join('|')}`);
      if (o.op === 'insert_block' && isObj(o.data)) checkBlock(c, o.data, `ops[${i}].data`);
    });
  }
  if (isObj(d.blocks)) checkBlocksDoc(c, d.blocks);
  if (isObj(d.quiz)) checkQuiz(c, d.quiz);
  if (isObj(d.scenario)) checkScenario(c, d.scenario);
}

// ---------------------------------------------------------------- dispatch
function detectKind(d) {
  if (!isObj(d)) return null;
  if ('course_uuid' in d || 'ops' in d || 'lesson_id' in d) return 'tool-args';
  if ('modules' in d) return 'toc';
  if ('blocks' in d) return 'blocks';
  if ('questions' in d) return 'quiz';
  if ('nodes' in d) return 'scenario';
  return null;
}
const CHECKERS = { toc: checkToc, blocks: checkBlocksDoc, quiz: checkQuiz, scenario: checkScenario, 'tool-args': checkToolArgs };

function validate(kind, d, c) {
  if (!CHECKERS[kind]) return c.err(`unrecognised JSON shape (kind: ${kind})`);
  if (!isObj(d)) return c.err('top level must be an object');
  noIds(c, '$', d);
  CHECKERS[kind](c, d);
  // de-duplicate (noIds + checkBlock both report ids)
  c.errors.splice(0, c.errors.length, ...new Set(c.errors));
}

// ---------------------------------------------------------------- examples
function runExamples() {
  const errors = [], used = new Map();
  const dir = join(ROOT, 'examples');
  if (!existsSync(dir)) { errors.push('examples/: directory missing'); return { errors, files: 0, json: 0, used }; }
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  let json = 0;
  for (const f of files) {
    const src = readFileSync(join(dir, f), 'utf8').replace(/\r/g, '');
    for (const m of src.matchAll(/```json\n([\s\S]*?)```/g)) {
      const line = src.slice(0, m.index).split('\n').length;
      let d;
      try { d = JSON.parse(m[1]); json++; } catch (e) { errors.push(`examples/${f}:${line}: JSON.parse: ${e.message}`); continue; }
      const kind = detectKind(d);
      const c = makeCtx();
      if (!kind) c.err('unrecognised JSON shape (not TOC / blocks / quiz / scenario / tool args)');
      else validate(kind, d, c);
      for (const e of c.errors) errors.push(`examples/${f}:${line}: ${e}`);
      for (const [k, v] of c.used) used.set(k, (used.get(k) || 0) + v);
    }
  }
  return { errors, files: files.length, json, used };
}

// ---------------------------------------------------------------- self-test
function runSelfTest() {
  const errors = [];
  const dir = join(ROOT, 'tests', 'negative');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  if (files.length < 8) errors.push(`tests/negative: need at least 8 cases, found ${files.length}`);
  let caught = 0;
  for (const f of files) {
    let t;
    try { t = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch (e) { errors.push(`tests/negative/${f}: JSON.parse: ${e.message}`); continue; }
    if (!t.kind || !t.expectError || !('data' in t)) { errors.push(`tests/negative/${f}: needs kind, expectError, data`); continue; }
    const c = makeCtx();
    validate(t.kind, t.data, c);
    if (c.errors.some((e) => e.includes(t.expectError))) caught++;
    else errors.push(`tests/negative/${f}: validator did not report "${t.expectError}" (got: ${c.errors.join(' | ') || 'no errors'})`);
  }
  return { errors, total: files.length, caught };
}

// ---------------------------------------------------------------- main
const all = [];
let summary = [];
if (!onlySelf) {
  const r = runExamples();
  all.push(...r.errors);
  summary.push(`${r.files} example files, ${r.json} JSON blocks, ${r.used.size}/${BLOCK_TYPES.length} block types used (${[...r.used.keys()].sort().join(', ')})`);
}
if (!onlyExamples) {
  const r = runSelfTest();
  all.push(...r.errors);
  summary.push(`self-test ${r.caught}/${r.total} negative cases caught`);
}
if (all.length) {
  console.error(all.join('\n'));
  console.error(`\n${all.length} problem(s).`);
  process.exit(1);
}
console.log(`OK: ${summary.join('; ')}; contract: ${BLOCK_TYPES.length} block types`);
