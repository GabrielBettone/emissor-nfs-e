import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Download,
  Send,
  RefreshCw,
  ArrowLeft,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import { getInvoiceById, transmitInvoice, consultInvoice } from '@/services/invoices'
import { getCompanySettings } from '@/services/company'
import { InvoiceItem, CompanySettings } from '@/types/nfse'

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [invoice, setInvoice] = useState<InvoiceItem | null>(null)
  const [company, setCompany] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [transmitting, setTransmitting] = useState(false)
  const [consulting, setConsulting] = useState(false)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [inv, comp] = await Promise.all([getInvoiceById(id), getCompanySettings()])
      setInvoice(inv)
      setCompany(comp)
    } catch (err) {
      toast({
        title: 'Erro ao carregar nota',
        description: 'Nota fiscal não encontrada.',
        variant: 'destructive',
      })
      navigate('/notas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleTransmit = async () => {
    if (!invoice) return
    setTransmitting(true)
    try {
      const res = await transmitInvoice(invoice.id)
      toast({
        title: 'NFS-e Transmitida com Sucesso!',
        description: `Nota Nacional gerada: Nº ${res.numero_nfse} • Protocolo: ${res.protocolo}`,
      })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao transmitir',
        description: err?.message || 'Falha na comunicação com o sistema nacional.',
        variant: 'destructive',
      })
    } finally {
      setTransmitting(false)
    }
  }

  const handleConsult = async () => {
    if (!invoice) return
    setConsulting(true)
    try {
      const res = await consultInvoice(invoice.id)
      toast({
        title: 'Consulta realizada',
        description: `Status no sistema nacional: ${res.status.toUpperCase()} • ${res.mensagem}`,
      })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro na consulta',
        description: err?.message || 'Falha ao consultar webservice nacional.',
        variant: 'destructive',
      })
    } finally {
      setConsulting(false)
    }
  }

  const handleDownloadXml = () => {
    if (!invoice?.xml_conteudo) {
      toast({
        title: 'XML indisponível',
        description: 'Transmita a nota para gerar o XML nacional assinado.',
        variant: 'destructive',
      })
      return
    }

    const blob = new Blob([invoice.xml_conteudo], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `NFSe_${invoice.numero_nfse || invoice.numero_rps}_${invoice.chave_acesso || 'nacional'}.xml`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Download iniciado',
      description: 'O arquivo XML da nota foi baixado com sucesso.',
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
    })
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  if (loading || !invoice) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Carregando detalhes da nota fiscal...
      </div>
    )
  }

  const isAuthorized = invoice.status === 'autorizada'

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link to="/notas">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {invoice.numero_nfse
                  ? `NFS-e Nº ${invoice.numero_nfse}`
                  : `RPS Nº ${invoice.numero_rps}`}
              </h1>
              {isAuthorized ? (
                <Badge className="bg-emerald-600 text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Autorizada no Sistema Nacional
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-700">
                  {invoice.status.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              RPS Série {invoice.serie_rps} • Emitido em {invoice.data_emissao} • Ambiente:{' '}
              <span className="uppercase font-semibold">{invoice.ambiente}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {invoice.xml_conteudo && (
            <Button
              onClick={handleDownloadXml}
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar XML da Nota
            </Button>
          )}

          {isAuthorized ? (
            <Button onClick={handleConsult} disabled={consulting} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${consulting ? 'animate-spin' : ''}`} />
              Consultar Status
            </Button>
          ) : (
            <Button
              onClick={handleTransmit}
              disabled={transmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {transmitting ? 'Transmitindo...' : 'Transmitir ao Sistema Nacional'}
            </Button>
          )}
        </div>
      </div>

      {/* Protocol & National Integration Return Box */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-blue-700">
            <ShieldCheck className="w-5 h-5" />
            <CardTitle className="text-base">
              Retorno do Sistema Nacional da Receita Federal
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500">Número da NFS-e</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {invoice.numero_nfse || 'Aguardando transmissão'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500">Protocolo de Envio</div>
              <div className="font-mono font-semibold text-slate-900 text-xs mt-0.5 flex items-center justify-between">
                <span>{invoice.protocolo_envio || '—'}</span>
                {invoice.protocolo_envio && (
                  <button onClick={() => copyToClipboard(invoice.protocolo_envio!, 'Protocolo')}>
                    <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500">Código de Verificação</div>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                {invoice.codigo_verificacao || '—'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-500">Data de Autorização</div>
              <div className="font-semibold text-slate-900 text-xs mt-0.5">
                {invoice.data_autorizacao
                  ? new Date(invoice.data_autorizacao).toLocaleString('pt-BR')
                  : '—'}
              </div>
            </div>
          </div>

          {invoice.chave_acesso && (
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-slate-500 font-medium mr-2">Chave de Acesso Nacional:</span>
                <span className="font-mono text-slate-800 select-all">{invoice.chave_acesso}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(invoice.chave_acesso!, 'Chave de Acesso')}
                className="h-7 px-2 text-xs text-blue-600"
              >
                Copiar Chave
              </Button>
            </div>
          )}

          {invoice.mensagem_retorno && (
            <div className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200">
              <strong>Mensagem:</strong> {invoice.mensagem_retorno}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prestador & Tomador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prestador */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Prestador (Emitente)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  {company?.razao_social || 'GB SOLUCOES LTDA'}
                </div>
                <div className="text-slate-600">
                  CNPJ:{' '}
                  <span className="font-mono font-medium">
                    {company?.cnpj || '53.242.055/0001-74'}
                  </span>
                </div>
                <div className="text-slate-600">
                  Inscrição Municipal: {company?.inscricao_municipal || '12345/01'}
                </div>
                <div className="text-slate-600">
                  {company?.logradouro}, {company?.numero} {company?.complemento}
                </div>
                <div className="text-slate-600">
                  {company?.bairro} • {company?.municipio}/{company?.uf} • CEP {company?.cep}
                </div>
              </CardContent>
            </Card>

            {/* Tomador */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                  <User className="w-4 h-4 text-blue-600" />
                  Tomador (Cliente)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  {invoice.tomador_razao_social}
                </div>
                <div className="text-slate-600">
                  {invoice.tomador_tipo === 'PJ' ? 'CNPJ' : 'CPF'}:{' '}
                  <span className="font-mono font-medium">{invoice.tomador_documento}</span>
                </div>
                {invoice.tomador_email && (
                  <div className="text-slate-600">E-mail: {invoice.tomador_email}</div>
                )}
                {invoice.tomador_telefone && (
                  <div className="text-slate-600">Telefone: {invoice.tomador_telefone}</div>
                )}
                <div className="text-slate-600">
                  {invoice.tomador_logradouro}{' '}
                  {invoice.tomador_numero && `nº ${invoice.tomador_numero}`}
                  {invoice.tomador_bairro && ` - ${invoice.tomador_bairro}`}
                </div>
                {(invoice.tomador_municipio || invoice.tomador_uf) && (
                  <div className="text-slate-600">
                    {invoice.tomador_municipio}/{invoice.tomador_uf} • CEP {invoice.tomador_cep}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Discriminação do Serviço */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Receipt className="w-4 h-4 text-blue-600" />
                Discriminação dos Serviços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-800 font-mono"
                >
                  Item LC 116: {invoice.codigo_lc116}
                </Badge>
                {invoice.cnae && (
                  <Badge variant="outline" className="font-mono">
                    CNAE: {invoice.cnae}
                  </Badge>
                )}
                <Badge variant="outline">
                  Prestado em: {invoice.municipio_prestacao_nome || 'São Pedro/SP'}
                </Badge>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg text-slate-800 text-sm whitespace-pre-wrap leading-relaxed border border-slate-100">
                {invoice.discriminacao}
              </div>
            </CardContent>
          </Card>

          {/* XML Preview */}
          {invoice.xml_conteudo && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                  <FileText className="w-4 h-4 text-blue-600" />
                  XML Padrão Nacional Gerado
                </CardTitle>
                <Button
                  onClick={handleDownloadXml}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Baixar .xml
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-52">
                  {invoice.xml_conteudo}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Tax Summary (1 col) */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Demonstrativo de Tributação
              </CardTitle>
              <CardDescription className="text-xs">
                Valores calculados e retidos na fonte.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                  <span>Valor Total do Serviço:</span>
                  <span className="text-blue-700">{formatCurrency(invoice.valor_servicos)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Base de Cálculo:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(invoice.base_calculo)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>ISS ({invoice.aliquota_iss}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(invoice.valor_iss)}
                    {invoice.iss_retido && (
                      <span className="text-[10px] text-amber-600 ml-1">(Retido)</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>PIS ({invoice.aliquota_pis || 0}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(invoice.valor_pis || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>COFINS ({invoice.aliquota_cofins || 0}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(invoice.valor_cofins || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>IRRF ({invoice.aliquota_irrf || 0}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(invoice.valor_irrf || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>CSLL ({invoice.aliquota_csll || 0}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(invoice.valor_csll || 0)}
                  </span>
                </div>

                {(invoice.valor_inss || 0) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>INSS ({invoice.aliquota_inss || 0}%):</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(invoice.valor_inss || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Box Valor Líquido */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="text-xs text-emerald-700 font-medium">Valor Líquido da NFS-e</div>
                <div className="text-2xl font-extrabold text-emerald-900 mt-0.5">
                  {formatCurrency(invoice.valor_liquido)}
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Município de Incidência do ISS: {company?.municipio || 'São Pedro'} -{' '}
                  {company?.uf || 'SP'}
                </p>
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" className="w-full text-xs">
                  <Link to="/notas">Voltar para a Lista de Notas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
