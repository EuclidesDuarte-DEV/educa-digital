import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/worker.js';

function bancoVazio() {
  const sqlite = new DatabaseSync(':memory:');
  let execucoes = 0;
  const DB = {
    prepare(sql) {
      return {
        first: async () => sqlite.prepare(sql).get() || null,
        run: async () => { execucoes++; return sqlite.prepare(sql).run(); },
        bind(...args) {
          return {
            first: async () => sqlite.prepare(sql).get(...args) || null,
            run: async () => sqlite.prepare(sql).run(...args),
            all: async () => ({ results: sqlite.prepare(sql).all(...args) })
          };
        }
      };
    },
    async exec(sql) { execucoes++; sqlite.exec(sql); }
  };
  return { sqlite, DB, contarExecucoes: () => execucoes };
}

test('Preview D1 inicializa tabelas e permite cadastro por telefone', async () => {
  const banco = bancoVazio();
  try {
    const env = { DB: banco.DB, PREVIEW_DB_BOOTSTRAP: 'true' };
    const url = 'https://preview.example/api/conta';
    const cadastrar = () => worker.fetch(new Request(url, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: '6500000000' })
    }), env);
    const primeiro = await cadastrar();
    assert.equal(primeiro.status, 201, await primeiro.text());
    const segundo = await cadastrar();
    assert.equal(segundo.status, 409);
    const instrucoes = banco.contarExecucoes();
    assert.ok(instrucoes >= 30, 'O esquema deve ser criado e populado');
    assert.equal(banco.sqlite.prepare('SELECT concluido FROM preview_bootstrap WHERE id=1').get().concluido, 1);
    assert.equal(banco.contarExecucoes(), instrucoes);
    assert.ok(banco.sqlite.prepare("SELECT name FROM sqlite_master WHERE name='progresso'").get());
    assert.ok(banco.sqlite.prepare("SELECT name FROM sqlite_master WHERE name='perfil_acessibilidade'").get());
    assert.equal(banco.sqlite.prepare('SELECT COUNT(*) AS total FROM atividades').get().total, 22);
  } finally {
    banco.sqlite.close();
  }
});

test('Banco oficial nunca executa bootstrap sem sinalizador de Preview', async () => {
  const banco = bancoVazio();
  try {
    const env = { DB: banco.DB };
    const resposta = await worker.fetch(new Request('https://site.example/api/conta', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: '6500000000' })
    }), env);
    assert.equal(resposta.status, 500);
    assert.equal(banco.contarExecucoes(), 0);
    assert.equal(banco.sqlite.prepare("SELECT COUNT(*) AS total FROM sqlite_master WHERE type='table'").get().total, 0);
  } finally {
    banco.sqlite.close();
  }
});
