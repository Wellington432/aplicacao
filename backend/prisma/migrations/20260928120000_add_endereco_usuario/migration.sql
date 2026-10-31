CREATE TABLE "public"."endereco" (
    "id" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificado_em" TIMESTAMP(3) NOT NULL,
    "id_usuario" TEXT NOT NULL,

    CONSTRAINT "endereco_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "endereco_id_usuario_key" ON "public"."endereco"("id_usuario");

ALTER TABLE "public"."endereco"
ADD CONSTRAINT "endereco_id_usuario_fkey"
FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;