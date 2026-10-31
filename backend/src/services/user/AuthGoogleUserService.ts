import prismaClient from "../../prisma";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { gerarToken, normalizarEmail } from "../../utils/token";
import { ClientError } from "../../errors/ClientError";

interface AuthGoogleUserRequest {
    /** Código de autorização (fluxo "auth-code" com popup de seleção de conta). */
    code?: string;
    /** ID token (fluxo antigo do botão <GoogleLogin />). Mantido por compatibilidade. */
    credential?: string;
}

function criarClienteGoogle() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("Login com Google não configurado no servidor.");

    // "postmessage" é o redirect_uri exigido pelo Google quando o código
    // vem do popup do Google Identity Services (useGoogleLogin flow: 'auth-code').
    return new OAuth2Client(clientId, process.env.GOOGLE_CLIENT_SECRET, "postmessage");
}

class AuthGoogleUserService {

    async execute({ code, credential }: AuthGoogleUserRequest) {

        if (!code && !credential) {
            throw new ClientError("Credencial do Google ausente.");
        }

        const client = criarClienteGoogle();
        let payload: TokenPayload | undefined;

        try {
            let idToken = credential;

            if (code) {
                if (!process.env.GOOGLE_CLIENT_SECRET) {
                    throw new Error("GOOGLE_CLIENT_SECRET não configurado.");
                }
                const { tokens } = await client.getToken(code);
                idToken = tokens.id_token ?? undefined;
            }

            if (!idToken) throw new Error("ID token ausente.");

            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (err) {
            console.error("[google-auth]", (err as Error).message);
            throw new Error("Não foi possível validar o login com Google.");
        }

        if (!payload || !payload.email) {
            throw new Error("Não foi possível validar o login com Google.");
        }

        if (!payload.email_verified) {
            throw new Error("E-mail do Google não verificado.");
        }

        const googleId = payload.sub;
        const email = normalizarEmail(payload.email);
        const nome = payload.name ?? email;

        let user = await prismaClient.usuario.findUnique({
            where: { googleId }
        });

        if (!user) {
            user = await prismaClient.usuario.findFirst({
                where: { email: { equals: email, mode: "insensitive" } }
            });

            if (user) {
                // Conta já existia com e-mail/senha: vincula o Google a ela.
                user = await prismaClient.usuario.update({
                    where: { id: user.id },
                    data: { googleId }
                });
            }
        }

        if (!user) {
            user = await prismaClient.usuario.create({
                data: {
                    nome,
                    email,
                    googleId,
                    senha: null,
                }
            });
        }

        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            tipo: user.tipo,
            token: gerarToken(user)
        };
    }
}

export { AuthGoogleUserService };
