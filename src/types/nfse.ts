export type AmbienteType = 'homologacao' | 'producao'

export type InvoiceStatus =
  | 'rascunho'
  | 'emitida'
  | 'enviada'
  | 'processando'
  | 'autorizada'
  | 'cancelada'
  | 'rejeitada'

export type TomadorTipo = 'PJ' | 'PF' | 'EXTERIOR'

export interface CompanySettings {
  id: string
  razao_social: string
  nome_fantasia?: string
  cnpj: string
  inscricao_municipal?: string
  email?: string
  telefone?: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  municipio: string
  uf: string
  codigo_municipio_ibge: string
  cep: string
  optante_simples_nacional?: boolean
  regime_especial_tributacao?: string
  aliquota_iss_padrao: number
  ambiente: AmbienteType
  created?: string
  updated?: string
}

export interface ServiceItem {
  id: string
  codigo_lc116: string
  cnae?: string
  nome: string
  descricao_padrao?: string
  aliquota_iss: number
  aliquota_pis?: number
  aliquota_cofins?: number
  aliquota_irrf?: number
  aliquota_csll?: number
  aliquota_inss?: number
  retencao_iss_padrao?: boolean
  ativo?: boolean
  created?: string
  updated?: string
}

export interface CertificateItem {
  id: string
  nome_arquivo: string
  arquivo?: string
  senha?: string
  validade_inicio?: string
  validade_fim?: string
  titular?: string
  cnpj?: string
  ativo?: boolean
  created?: string
  updated?: string
}

export interface InvoiceItem {
  id: string
  numero_rps: number
  serie_rps: string
  tipo_rps?: string
  data_emissao: string
  status: InvoiceStatus

  // Tomador
  tomador_tipo: TomadorTipo
  tomador_documento: string
  tomador_razao_social: string
  tomador_email?: string
  tomador_telefone?: string
  tomador_logradouro?: string
  tomador_numero?: string
  tomador_complemento?: string
  tomador_bairro?: string
  tomador_municipio?: string
  tomador_uf?: string
  tomador_cep?: string
  tomador_codigo_municipio?: string

  // Serviço
  service_id?: string
  expand?: {
    service_id?: ServiceItem
  }
  codigo_lc116: string
  cnae?: string
  discriminacao: string
  municipio_prestacao_codigo: string
  municipio_prestacao_nome?: string

  // Valores e Impostos
  valor_servicos: number
  valor_deducoes?: number
  desconto_incondicionado?: number
  desconto_condicionado?: number
  base_calculo: number

  aliquota_iss: number
  valor_iss: number
  iss_retido?: boolean

  aliquota_pis?: number
  valor_pis?: number

  aliquota_cofins?: number
  valor_cofins?: number

  aliquota_inss?: number
  valor_inss?: number

  aliquota_irrf?: number
  valor_irrf?: number

  aliquota_csll?: number
  valor_csll?: number

  outras_retencoes?: number
  valor_liquido: number

  // Retorno Sistema Nacional
  ambiente: AmbienteType
  numero_nfse?: string
  codigo_verificacao?: string
  chave_acesso?: string
  protocolo_envio?: string
  data_autorizacao?: string
  link_danfse?: string
  xml_conteudo?: string
  mensagem_retorno?: string
  motivo_rejeicao?: string

  created?: string
  updated?: string
}

export interface TaxCalculationInput {
  valorServicos: number
  descontoIncondicionado?: number
  deducoes?: number
  aliquotaIss: number
  issRetido: boolean
  aliquotaPis?: number
  aliquotaCofins?: number
  aliquotaInss?: number
  aliquotaIrrf?: number
  aliquotaCsll?: number
  outrasRetencoes?: number
}

export interface TaxCalculationResult {
  baseCalculo: number
  valorIss: number
  valorPis: number
  valorCofins: number
  valorInss: number
  valorIrrf: number
  valorCsll: number
  totalRetencoes: number
  valorLiquido: number
}

export function calculateTaxes(input: TaxCalculationInput): TaxCalculationResult {
  const valorServicos = Math.max(0, Number(input.valorServicos) || 0)
  const desconto = Math.max(0, Number(input.descontoIncondicionado) || 0)
  const deducoes = Math.max(0, Number(input.deducoes) || 0)

  const baseCalculo = Math.max(0, valorServicos - deducoes - desconto)

  const aliqIss = Number(input.aliquotaIss) || 0
  const aliqPis = Number(input.aliquotaPis) || 0
  const aliqCofins = Number(input.aliquotaCofins) || 0
  const aliqInss = Number(input.aliquotaInss) || 0
  const aliqIrrf = Number(input.aliquotaIrrf) || 0
  const aliqCsll = Number(input.aliquotaCsll) || 0
  const outrasRet = Math.max(0, Number(input.outrasRetencoes) || 0)

  const valorIss = Number(((baseCalculo * aliqIss) / 100).toFixed(2))
  const valorPis = Number(((baseCalculo * aliqPis) / 100).toFixed(2))
  const valorCofins = Number(((baseCalculo * aliqCofins) / 100).toFixed(2))
  const valorInss = Number(((baseCalculo * aliqInss) / 100).toFixed(2))
  const valorIrrf = Number(((baseCalculo * aliqIrrf) / 100).toFixed(2))
  const valorCsll = Number(((baseCalculo * aliqCsll) / 100).toFixed(2))

  let totalRetencoes = valorPis + valorCofins + valorInss + valorIrrf + valorCsll + outrasRet
  if (input.issRetido) {
    totalRetencoes += valorIss
  }

  const valorLiquido = Number(Math.max(0, valorServicos - totalRetencoes - desconto).toFixed(2))

  return {
    baseCalculo,
    valorIss,
    valorPis,
    valorCofins,
    valorInss,
    valorIrrf,
    valorCsll,
    totalRetencoes: Number(totalRetencoes.toFixed(2)),
    valorLiquido,
  }
}
