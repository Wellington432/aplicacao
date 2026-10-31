import prismaClient from "../../prisma";
import { hash } from "bcryptjs";
import { normalizarEmail } from "../../utils/token";
import { ClientError } from "../../errors/ClientError";

interface CreateUserRequest {
    nome: string;
    email: string;
    senha: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class CreateUserService {

    async execute({ nome, email, senha }: CreateUserRequest) {

        const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
        const emailNormalizado = normalizarEmail(email);

        if (!nomeLimpo || !emailNormalizado || !senha) {
            throw new ClientError("Dados ausentes!");
        }

        if (!EMAIL_REGEX.test(emailNormalizado)) {
            throw new ClientError("E-mail inválido!");
        }

        if (String(senha).length < 8) {
            throw new ClientError("A senha deve ter ao menos 8 caracteres!");
        }

        const emailExists = await prismaClient.usuario.findFirst({
            where: { email: { equals: emailNormalizado, mode: "insensitive" } }
        });

        if (emailExists) {
            throw new ClientError("Email já Cadastrado!");
        }

        const senhaHash = await hash(String(senha), 10);

        const user = await prismaClient.usuario.create({
            data: {
                nome: nomeLimpo,
                email: emailNormalizado,
                senha: senhaHash
            },
            select: {
                id: true,
                nome: true,
                email: true
            }
        });

        return user;
    }
}

export { CreateUserService };
