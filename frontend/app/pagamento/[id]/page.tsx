'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/AuthGuard';
import PrimaryButton from '@/components/PrimaryButton';
import { api, getApiErrorMessage } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { StatusCompra } from '@/lib/types';

interface DadosPix {
  brCode: string;
  qrCodeBase64: string;
  status: StatusCompra;
  total: number;
  nomeRecebedor: string;
  chavePix: string;
  cidade: string;
}

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

function PagamentoContent() {
  const params = useParams<{ id: string }>();
  const compraId = params.id;

  const [pix, setPix] = useState<DadosPix | null>(null);
  const [status, setStatus] = useState<StatusCompra>('AGUARDANDO_PAGAMENTO');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarPix = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const { data } = await api.get<DadosPix>(`/checkout/${compraId}/qrcode`);
      setPix(data);
      // Antes o status começava sempre como "aguardando pagamento", então quem
      // voltava para a página não via se o pedido já estava pago/rejeitado.
      setStatus(data.status);
    } catch (err) {
      setErro(getApiErrorMessage(err, 'Não foi possível carregar o Pix.'));
    } finally {
      setCarregando(false);
    }
  }, [compraId]);

  useEffect(() => {
    if (compraId) carregarPix();
  }, [compraId, carregarPix]);

  async function copiarCodigo() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.brCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error('Não foi possível copiar. Selecione o código manualmente.');
    }
  }

  function selecionarArquivo(file: File | null) {
    if (file && file.size > TAMANHO_MAXIMO) {
      toast.error('Arquivo muito grande (máx. 5MB).');
      setArquivo(null);
      return;
    }
    setArquivo(file);
  }

  async function enviarComprovante() {
    if (!arquivo) return;
    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append('comprovante', arquivo);
      await api.post(`/checkout/${compraId}/comprovante`, formData);
      setStatus('AGUARDANDO_CONFIRMACAO');
      setArquivo(null);
      toast.success('Comprovante enviado!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erro ao enviar comprovante.'));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <main id="payment-main-content" tabIndex={-1} className="min-h-screen bg-bg-app flex items-center justify-center">
        <a href="#payment-main-content" className="skip-link">
          Ir para o conteúdo
        </a>
        <Loader2 className="w-6 h-6 text-horta-dark animate-spin" />
      </main>
    );
  }

  if (!pix) {
    return (
      <main id="payment-main-content" tabIndex={-1} className="min-h-screen bg-bg-app flex flex-col items-center justify-center gap-4 px-6">
        <a href="#payment-main-content" className="skip-link">
          Ir para o conteúdo
        </a>
        <p className="text-ink-500 text-center">{erro || 'Não foi possível carregar o Pix.'}</p>
        <Link href="/pedidos" className="text-horta-dark font-medium hover:underline text-sm">
          Ver meus pedidos
        </Link>
      </main>
    );
  }

  const podeEnviar = status === 'AGUARDANDO_PAGAMENTO' || status === 'REJEITADO';

  return (
    <main id="payment-main-content" tabIndex={-1} className="min-h-screen bg-bg-app flex items-center justify-center px-6 py-10">
      <a href="#payment-main-content" className="skip-link">
        Ir para o conteúdo
      </a>
      <div className="w-full max-w-md">
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-2 text-horta-dark text-sm font-medium mb-4 hover:opacity-70"
        >
          <ArrowLeft className="w-4 h-4" />
          Meus pedidos
        </Link>

        <div className="bg-white rounded-card border border-card-border shadow-card p-6">
          {status === 'REJEITADO' && (
            <div className="flex items-start gap-3 p-3 mb-5 rounded-input bg-brand-red/10 border border-brand-red/25">
              <XCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
              <p className="text-sm text-brand-red">
                O comprovante anterior foi recusado. Confira o pagamento e envie um novo comprovante.
              </p>
            </div>
          )}

          {podeEnviar && (
            <>
              <h1 className="text-h2 font-bold text-horta-dark text-center mb-1">Pague com Pix</h1>
              <p className="text-center text-ink-500 text-sm mb-5">
                Total: <strong className="text-horta-dark">{formatPrice(pix.total)}</strong>
              </p>

              <img
                src={pix.qrCodeBase64}
                alt="QR Code Pix"
                className="mx-auto mb-5 w-56 h-56 rounded-input border border-card-border"
              />

              <dl className="mb-5 space-y-2 rounded-input bg-bg-app p-3 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-ink-500">Recebedor</dt><dd className="font-medium text-ink-800">{pix.nomeRecebedor}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-ink-500">Chave PIX</dt><dd className="font-medium text-ink-800">{pix.chavePix}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-ink-500">Cidade</dt><dd className="font-medium text-ink-800">{pix.cidade}</dd></div>
              </dl>

              <PrimaryButton onClick={copiarCodigo} className="mb-6">
                {copiado ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  'Copiar código PIX'
                )}
              </PrimaryButton>

              <div className="border-t border-card-border pt-5">
                <label htmlFor="comprovante-pagamento" className="block mb-2 text-body-sm font-medium text-ink-700">
                  Envie o comprovante de pagamento (imagem ou PDF, até 5MB):
                </label>
                <input
                  id="comprovante-pagamento"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => selecionarArquivo(e.target.files?.[0] ?? null)}
                  className="mb-4 w-full text-body-sm text-ink-600 file:mr-3 file:py-2 file:px-3 file:rounded-input file:border-0 file:bg-horta-medium/10 file:text-horta-dark file:font-medium"
                />
                <PrimaryButton onClick={enviarComprovante} disabled={!arquivo} loading={enviando}>
                  Enviar comprovante
                </PrimaryButton>
              </div>
            </>
          )}

          {status === 'AGUARDANDO_CONFIRMACAO' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-horta-medium mx-auto mb-3" />
              <h2 className="text-h3 font-bold text-ink-800 mb-2">Comprovante enviado</h2>
              <p className="text-ink-600 text-body-sm">
                Aguardando aprovação do pagamento pelo administrador. Acompanhe o status em
                “Meus pedidos”.
              </p>
            </div>
          )}

          {status === 'PAGO' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-horta-medium mx-auto mb-3" />
              <h2 className="text-h3 font-bold text-horta-dark">Pagamento confirmado!</h2>
            </div>
          )}

          {status === 'CANCELADO' && (
            <div className="text-center py-4">
              <XCircle className="w-10 h-10 text-brand-red mx-auto mb-3" />
              <h2 className="text-h3 font-bold text-brand-red">Pedido cancelado</h2>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// A página não tinha proteção: sem login ela só mostrava um erro genérico.
export default function PagamentoPage() {
  return (
    <AuthGuard>
      <PagamentoContent />
    </AuthGuard>
  );
}
