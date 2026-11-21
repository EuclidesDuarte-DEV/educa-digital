-- V111.87 — LIA Neural Memory, migração idempotente para Cloudflare D1.
-- Executar MANUALMENTE no banco de Preview e, após validação, no oficial.
-- Não armazena falas ou dados de participantes automaticamente.
CREATE TABLE IF NOT EXISTS lia_kb_nodes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('conhecimento','cenario','memoria','aprendizado','decisao')),
  project TEXT NOT NULL DEFAULT 'Educa+ Digital',
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lia_kb_nodes_scope ON lia_kb_nodes(status, visibility, category);
CREATE INDEX IF NOT EXISTS idx_lia_kb_nodes_project ON lia_kb_nodes(project, updated_at);
CREATE TABLE IF NOT EXISTS lia_kb_links (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES lia_kb_nodes(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES lia_kb_nodes(id) ON DELETE CASCADE,
  relation TEXT NOT NULL DEFAULT 'relacionado',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source_id,target_id,relation),
  CHECK(source_id<>target_id)
);
CREATE INDEX IF NOT EXISTS idx_lia_kb_links_source ON lia_kb_links(source_id);
CREATE INDEX IF NOT EXISTS idx_lia_kb_links_target ON lia_kb_links(target_id);
