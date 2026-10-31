import { createStaticPix, hasError } from 'pix-utils';

interface GerarPayloadPixParams {
  chavePix: string;
  nomeRecebedor: string;
  cidade: string;
  valor: number;
  txid: string;
}

function normalizarTextoPix(valor: string, limite: number): string {
  return valor.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limite)
    .trim();
}

function obterDadosRecebedorPix() {
  const chavePix = process.env.PIX_KEY?.trim();
  const nomeRecebedor = normalizarTextoPix(process.env.PIX_NOME_RECEBEDOR ?? '', 25);
  const cidade = normalizarTextoPix(process.env.PIX_CIDADE ?? '', 15);
  if (!chavePix || !nomeRecebedor || !cidade) {
    throw new Error('Configure PIX_KEY, PIX_NOME_RECEBEDOR e PIX_CIDADE no ambiente.');
  }
  return { chavePix, nomeRecebedor, cidade };
}

function gerarPayloadPix({
  chavePix,
  nomeRecebedor,
  cidade,
  valor,
  txid,
}: GerarPayloadPixParams): string {
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('O valor do Pix deve ser maior que zero.');
  if (!/^[A-Za-z0-9]{1,25}$/.test(txid)) throw new Error('O identificador Pix deve ter de 1 a 25 caracteres alfanuméricos.');
  const dadosRecebedor = obterDadosRecebedorPix();
  const pix = createStaticPix({
    merchantName: dadosRecebedor.nomeRecebedor,
    merchantCity: dadosRecebedor.cidade,
    pixKey: dadosRecebedor.chavePix,
    infoAdicional: 'Compra FeiraEtec',
    transactionAmount: valor,
    txid,
  });

  if (hasError(pix)) {
    throw new Error('Erro ao gerar payload Pix: ' + pix.error);
  }

  return pix.toBRCode();
}

export { gerarPayloadPix, normalizarTextoPix, obterDadosRecebedorPix };