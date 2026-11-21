-- V111.97: somente trechos curtos de cenários simulados e consentidos.
CREATE TABLE IF NOT EXISTS lia_training_examples (
 id TEXT PRIMARY KEY,
 scenario TEXT NOT NULL,
 channel TEXT NOT NULL,
 signal TEXT NOT NULL CHECK(signal IN ('verify','refuse','question','accept','other')),
 participant_excerpt TEXT NOT NULL,
 character_excerpt TEXT NOT NULL,
 review_state TEXT NOT NULL DEFAULT 'pending' CHECK(review_state IN ('pending','reviewed')),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 expires_at TEXT NOT NULL DEFAULT (datetime('now','+7 days'))
);
CREATE INDEX IF NOT EXISTS idx_lia_training_examples_expires ON lia_training_examples(expires_at);
CREATE INDEX IF NOT EXISTS idx_lia_training_examples_review ON lia_training_examples(review_state,created_at);
-- A limpeza automatizada acontece na leitura ou inserção no Worker.
