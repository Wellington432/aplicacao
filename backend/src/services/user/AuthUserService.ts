import prismaClient from "../../prisma";
import { compare } from "bcryptjs";
import { gerarToken, normalizarEmail } from "../../utils/token";
import { ClientError } from "../../errors/ClientError";

interface AuthUserRequest {
    email: string;
    senha: string;
}

class AuthUserService {

    async execute({ email, senha }: AuthUserRequest) {

        const emailNormalizado = normalizarEmail(email);

        if (!emailNormalizado || !senha) {
            throw new ClientError("Informe e-mail e senha.");
        }

        const user = await prismaClient.usuario.findFirst({
            where: { email: { equals: emailNormalizado, mode: "insensitive" } }
        });

        if (!user) {
            throw new ClientError("Usuário ou senha incorretos!");
        }

        if (!user.senha) {
            throw new ClientError("Esta conta usa login com Google. Entre com o Google.");
        }

        const senhaMatch = await compare(String(senha), user.senha);

        if (!senhaMatch) {
            throw new ClientError("Usuário ou senha incorretos!");
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

export { AuthUserService };
