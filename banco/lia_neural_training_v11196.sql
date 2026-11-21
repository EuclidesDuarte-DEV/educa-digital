-- V111.96: padrões anônimos, agregados e com adesão voluntária.
-- Também criados idempotentemente pelo Worker quando LIA_NEURAL_AUTO_SETUP=true.
CREATE TABLE IF NOT EXISTS lia_training_signals (
 day TEXT NOT NULL DEFAULT (date('now')),
 scenario TEXT NOT NULL,
 channel TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('turn','outcome')),
 signal TEXT NOT NULL CHECK(signal IN ('verify','refuse','question','accept','other','safe','unsafe')),
 total INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(day,scenario,channel,kind,signal)
);
CREATE INDEX IF NOT EXISTS idx_lia_training_retention ON lia_training_signals(day,scenario);
-- Não há colunas de usuário, texto, número, IP, identidade ou histórico.
