import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const packageJson = JSON.parse(readFileSync(new URL('../package.json',import.meta.url), 'utf8'));
const schema = readFileSync(new URL('../banco/schema.sql',import.meta.url), 'utf8');

test('inicio de desenvolvimento prepara somente o D1 local', () => {
  const scripts = packageJson.scripts;
  assert.equal(scripts.predev, 'npm run db:init:local');
  assert.match(scripts['db:init:local'], /wrangler d1 execute educa-digital --local/);
  assert.doesNotMatch(scripts['db:init:local'], /--remote/);
});

test('schema local e idempotente, preservando usuarios e progresso', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(schema);
    db.prepare('INSERT INTO usuarios(nome, numero) VALUES (?, ?)').run('Pessoa teste', '65911111111');
    db.exec(schema);
    assert.equal(db.prepare("SELECT count(*) as n FROM usuarios WHERE numero='65911111111'").get().n, 1);
    assert.equal(db.prepare('SELECT count(*) as n FROM atividades').get().n,22);
  } finally { db.close(); }
});
