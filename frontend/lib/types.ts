export type TipoUsuario = 'ADM' | 'CLIENTE'
// Precisa bater com o enum StatusCompra do schema.prisma
export type StatusCompra =
  | 'CARRINHO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'AGUARDANDO_CONFIRMACAO'
  | 'PAGO'
  | 'REJEITADO'
  | 'CANCELADO'
export type TipoEntrega = 'RETIRADA' | 'ENTREGA'

export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: TipoUsuario
}

export interface AuthResponse extends Usuario {
  token: string
}

export interface Categoria {
  id: string
  nome: string
}

export interface Produto {
  id: string
  nome: string
  preco: string
  unidade: string
  descricao: string
  banner: string
  estoque: number
  ativo: boolean
  id_categoria?: string
  categoria?: Categoria
}

export interface ItemCompra {
  id: string
  quantidade: number
  preco_unitario: string | null
  id_compra: string
  id_produto: string
  produto: Produto
}

export interface RelatorioVendas {
  periodo_dias: number
  receita_total: number
  pedidos_finalizados: number
  pedidos_aguardando_pagamento: number
  pedidos_cancelados: number
  receita_por_dia: { data: string; total: number }[]
  produtos_mais_vendidos: { id_produto: string; nome: string; quantidade: number }[]
}

export interface Compra {
  id: string
  status: StatusCompra
  tipo_entrega: TipoEntrega
  endereco: string | null
  forma_pagamento: string | null
  total: string
  comprovante_url: string | null
  comprovante_enviado_em: string | null
  confirmado_em: string | null
  criado_em: string
  id_usuario: string
  itens: ItemCompra[]
}

export interface ApiErrorBody {
  error?: string
}
