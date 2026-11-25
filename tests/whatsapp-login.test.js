import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import worker from '../src/worker.js';

const celular = '65999990000';
const canal = { channel: 'whatsapp' };
const outrosDigitos = code => code === '000000' ? '111111' : '000000';
const confirmar = '/api/login/confirmar';
const pedir = '/api/login/codigo';

function ambiente(t) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  sqlite.exec(readFileSync(new URL('../banco/schema.sql', import.meta.url), 'utf8'));
  const DB = {
    prepare(sql) {
      const bind = (...args) => ({
        bind,
        execute: () => sqlite.prepare(sql).run(...args),
        async run() { return this.execute(); },
        async first() { return sqlite.prepare(sql).get(...args) || null; },
        async all() { return { results: sqlite.prepare(sql).all(...args) }; }
      });
      return bind();
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results = statements.map(statement => statement.execute());
        sqlite.exec('COMMIT');
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    }
  };
  const env = {
    DB, EDUCA_AUTH_MODE: 'whatsapp', WHATSAPP_PHONE_NUMBER_ID: '123456789',
    WHATSAPP_ACCESS_TOKEN: 'token-de-teste', WHATSAPP_OTP_SECRET: 'somente-para-este-teste-de-integracao'
  };
  async function api(path, data, method = data ? 'POST' : 'GET', token) {
    const response = await worker.fetch(new Request('https://educa.example' + path, {
      method, headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(data ? { 'Content-Type': 'application/json' } : {}),
        'cf-connecting-ip': '192.0.2.1'
      },
      body: data && JSON.stringify(data)
    }), env);
    return { status: response.status, data: await response.json() };
  }
  const mensagens = [];
  const meta = t.mock.method(globalThis, 'fetch', async (url, options) => {
    mensagens.push({ url, options, payload: JSON.parse(options.body) });
    return Response.json({ messages: [{ id: 'wamid.teste', message_status: 'accepted' }] });
  });
  const codigoMeta = () => mensagens.at(-1).payload.template.components[0].parameters[0].text;
  return { api, env, sqlite, mensagens, meta, codigoMeta };
}

test('login real só cria conta após OTP e protege progresso, perfil e XP com sessão verificada', async t => {
  const { api, sqlite, mensagens, codigoMeta } = ambiente(t);
  assert.equal((await api('/api/login/status')).data.channel, 'whatsapp');
  assert.equal((await api('/api/conta', { phone: celular })).data.needs_login, true);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total, 0);
  assert.equal((await api(pedir, { phone: celular })).status, 400);
  assert.equal(mensagens.length, 0);
  const numeroFormatado = '+55 (65) 99999-0000';
  const pedidos = await Promise.all([
    api(pedir, { ...canal, phone: numeroFormatado }), api(pedir, { ...canal, phone: celular })
  ]);
  assert.deepEqual(pedidos.map(res => res.status).sort(), [200, 429]);
  assert.ok(pedidos.every(res => res.data.demo_code === undefined));
  assert.equal(mensagens.length, 1);
  const [{ url, options, payload }] = mensagens;
  const code = codigoMeta();
  assert.match(code, /^\d{6}$/);
  assert.equal(url, 'https://graph.facebook.com/v27.0/123456789/messages');
  assert.equal(options.headers.Authorization, 'Bearer token-de-teste');
  assert.equal(payload.to, '55' + celular);
  assert.equal(payload.type, 'template');
  assert.deepEqual(payload.template, {
    name: 'educa_login_codigo', language: { code: 'pt_BR' }, components: [
      { type: 'body', parameters: [{ type: 'text', text: code }] },
      { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] }
    ]
  });
  const pedido = sqlite.prepare('SELECT * FROM whatsapp_login_codigos').get();
  assert.match(pedido.codigo_hash, /^[a-f0-9]{64}$/);
  assert.notEqual(pedido.destinatario, celular);
  assert.equal((await api(confirmar, { phone: celular, code: outrosDigitos(code) })).status, 400);
  const resultados = await Promise.all([
    api(confirmar, { phone: celular, code }), api(confirmar, { phone: celular, code })
  ]);
  assert.deepEqual(resultados.map(res => res.status).sort(), [200, 400]);
  const { level_token: token } = resultados.find(res => res.status === 200).data;
  assert.match(token, /^[a-f0-9]{64}$/);
  const progresso = '/api/progresso?phone=' + celular;
  const perfil = '/api/perfil-acessibilidade?phone=' + celular;
  assert.equal((await api(progresso)).status, 401);
  assert.equal((await api(perfil)).status, 401);
  assert.equal((await api(progresso, null, 'GET', token)).status, 200);
  assert.equal((await api(perfil, null, 'GET', token)).status, 200);
  assert.equal((await api('/api/progresso?phone=65999990001', null, 'GET', token)).status, 401);
  assert.equal((await api('/api/modo-livre/nivel', null, 'GET', token)).status, 200);
  assert.equal((await api('/api/login/sessao', null, 'DELETE', token)).status, 200);
  assert.equal((await api(progresso, null, 'GET', token)).status, 401);
});

test('troca de modo invalida sessões e códigos demonstrativos e mantém a conta e o progresso existentes', async t => {
  const { api, env, sqlite, codigoMeta } = ambiente(t);
  env.EDUCA_AUTH_MODE = 'demo';
  const cadastro = await api('/api/conta', { phone: celular, name: 'Maria' });
  assert.equal(cadastro.status, 201);
  await api('/api/progresso', { phone: celular, activity_code: 'pix-key', event: 'complete' });
  const demo = (await api(pedir, { phone: celular })).data.demo_code;
  env.EDUCA_AUTH_MODE = 'whatsapp';
  assert.equal((await api('/api/modo-livre/nivel', null, 'GET', cadastro.data.level_token)).status, 401);
  assert.equal((await api(confirmar, { phone: celular, code: demo })).status, 400);
  assert.equal((await api(pedir, { ...canal, phone: celular, name: 'Outro nome' })).status, 200);
  const real = await api(confirmar, { phone: celular, code: codigoMeta() });
  assert.equal(real.status, 200);
  assert.equal(real.data.name, 'Maria');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total, 1);
  const progresso = await api('/api/progresso?phone=' + celular, null, 'GET', real.data.level_token);
  assert.equal(progresso.data.atividades[0].concluido, 1);
});

test('modo real falha sem credenciais ou aceite da Meta, e bloqueia OTP expirado e excesso de tentativas', async t => {
  const { api, env, meta, sqlite, codigoMeta } = ambiente(t);
  const dados = { ...canal, phone: celular };
  const token = env.WHATSAPP_ACCESS_TOKEN;
  delete env.WHATSAPP_ACCESS_TOKEN;
  assert.equal((await api(pedir, dados)).status, 503);
  assert.equal(meta.mock.callCount(), 0);
  env.WHATSAPP_ACCESS_TOKEN = token;
  meta.mock.mockImplementationOnce(async () => Response.json({ error: { code: 190 } }, { status: 401 }));
  assert.equal((await api(pedir, dados)).status, 502);
  assert.equal((await api(pedir, dados)).status, 429);
  assert.equal(sqlite.prepare('SELECT enviado FROM whatsapp_login_codigos').get().enviado, 0);
  sqlite.exec('UPDATE whatsapp_login_codigos SET disponivel_em = 0');
  assert.equal((await api(pedir, dados)).status, 200);
  const code = codigoMeta();
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    assert.equal((await api(confirmar, { phone: celular, code: outrosDigitos(code) })).status, 400);
  }
  assert.equal((await api(confirmar, { phone: celular, code })).status, 400);
  sqlite.exec('UPDATE whatsapp_login_codigos SET disponivel_em = 0');
  assert.equal((await api(pedir, dados)).status, 200);
  sqlite.exec('UPDATE whatsapp_login_codigos SET expira_em = 0');
  assert.equal((await api(confirmar, { phone: celular, code: codigoMeta() })).status, 400);
});
