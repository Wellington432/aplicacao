import { sign, SignOptions } from "jsonwebtoken";

interface TokenUser {
    id: string;
    nome: string;
    email: string;
}

/**
 * Gera o JWT da sessão. Centralizado aqui para que o login por e-mail/senha
 * e o login com Google gerem exatamente o mesmo formato de token.
 */
export function gerarToken(user: TokenUser): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Configuração de segurança ausente no servidor.");

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"];

    return sign(
        { nome: user.nome, usuario: user.email },
        secret,
        { subject: user.id, expiresIn }
    );
}

/** Padroniza e-mails para evitar contas duplicadas por diferença de maiúsculas/espaços. */
export function normalizarEmail(email: unknown): string {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}
