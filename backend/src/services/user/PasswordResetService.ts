import { createHash, randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import { createTransport } from 'nodemailer';
import prismaClient from '../../prisma';
import { normalizarEmail } from '../../utils/token';

const TEMPO_EXPIRACAO_MS = 30 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class ConfiguracaoEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfiguracaoEmailError';
  }
}

function criarTransportadorEmail() {
  const host = process.env.SMTP_HOST?.trim();
  const remetente = process.env.SMTP_FROM?.trim();
  const port = Number(process.env.SMTP_PORT ?? 587);
  const usuario = process.env.SMTP_USER?.trim();
  const senha = process.env.SMTP_PASS;

  if (!host || !remetente || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfiguracaoEmailError('Configure SMTP_HOST, SMTP_PORT e SMTP_FROM para habilitar a recuperação.');
  }
  if (Boolean(usuario) !== Boolean(senha)) {
    throw new ConfiguracaoEmailError('Configure SMTP_USER e SMTP_PASS juntos.');
  }

  return {
    remetente,
    transportador: createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      ...(usuario && senha ? { auth: { user: usuario, pass: senha } } : {}),
    }),
  };
}

function criarHashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

class PasswordResetService {
  async solicitar(email: unknown) {
    const { remetente, transportador } = criarTransportadorEmail();
    const emailNormalizado = normalizarEmail(email);
    if (!EMAIL_REGEX.test(emailNormalizado)) return;

    const usuario = await prismaClient.usuario.findFirst({
      where: { email: { equals: emailNormalizado, mode: 'insensitive' } },
      select: { id: true, email: true },
    });
    if (!usuario) return;

    const token = randomBytes(32).toString('hex');
    const tokenHash = criarHashToken(token);
    const expiraEm = new Date(Date.now() + TEMPO_EXPIRACAO_MS);
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim();
    if (!frontendUrl) throw new ConfiguracaoEmailError('Configure FRONTEND_URL para enviar links de recuperação.');

    await prismaClient.$transaction([
      prismaClient.recuperacaoSenha.deleteMany({ where: { id_usuario: usuario.id } }),
      prismaClient.recuperacaoSenha.create({
        data: { tokenHash, id_usuario: usuario.id, expiraEm },
      }),
    ]);

    const link = new URL('/redefinir-senha', frontendUrl);
    link.searchParams.set('token', token);

    try {
      await transportador.sendMail({
        from: remetente,
        to: usuario.email,
        subject: 'Redefinição de senha',
        text: `Use este link para criar uma nova senha. Ele expira em 30 minutos: ${link.toString()}`,
        html: `<p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${link.toString()}">Criar nova senha</a></p><p>O link expira em 30 minutos. Se você não solicitou a alteração, ignore esta mensagem.</p>`,
      });
    } catch (error) {
      await prismaClient.recuperacaoSenha.deleteMany({ where: { tokenHash } });
      throw error;
    }
  }

  async redefinir(token: unknown, novaSenha: unknown) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
      throw new Error('Este link é inválido ou expirou. Solicite uma nova recuperação.');
    }
    if (typeof novaSenha !== 'string' || novaSenha.length < 8) {
      throw new Error('A senha deve ter ao menos 8 caracteres.');
    }
    if (Buffer.byteLength(novaSenha, 'utf8') > 72) {
      throw new Error('A senha deve ter no máximo 72 bytes.');
    }

    const tokenHash = criarHashToken(token);
    const agora = new Date();
    const recuperacao = await prismaClient.recuperacaoSenha.findUnique({
      where: { tokenHash },
      select: { id_usuario: true },
    });
    if (!recuperacao) {
      throw new Error('Este link é inválido ou expirou. Solicite uma nova recuperação.');
    }

    const senhaHash = await hash(novaSenha, 10);
    await prismaClient.$transaction(async (transaction) => {
      const consumido = await transaction.recuperacaoSenha.deleteMany({
        where: { tokenHash, expiraEm: { gt: agora } },
      });
      if (consumido.count !== 1) {
        throw new Error('Este link é inválido ou expirou. Solicite uma nova recuperação.');
      }

      await transaction.usuario.update({
        where: { id: recuperacao.id_usuario },
        data: { senha: senhaHash },
      });
      await transaction.recuperacaoSenha.deleteMany({ where: { id_usuario: recuperacao.id_usuario } });
    });
  }
}

export { PasswordResetService };