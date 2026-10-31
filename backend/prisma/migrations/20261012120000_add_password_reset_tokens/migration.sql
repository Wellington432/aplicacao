CREATE TABLE "recuperacao_senha" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recuperacao_senha_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "recuperacao_senha_tokenHash_key" ON "recuperacao_senha"("tokenHash");
CREATE INDEX "recuperacao_senha_id_usuario_idx" ON "recuperacao_senha"("id_usuario");

ALTER TABLE "recuperacao_senha"
ADD CONSTRAINT "recuperacao_senha_id_usuario_fkey"
FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;