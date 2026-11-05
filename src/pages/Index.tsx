import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  PlusCircle,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Send,
} from 'lucide-react'
import { listInvoices } from '@/services/invoices'
import { listServices } from '@/services/services'
import { getCompanySettings } from '@/services/company'
import { InvoiceItem, ServiceItem, CompanySettings } from '@/types/nfse'

export default function Index() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [company, setCompany] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [invs, srvs, comp] = await Promise.all([
          listInvoices(),
          listServices(),
          getCompanySettings(),
        ])
        setInvoices(invs)
        setServices(srvs)
        setCompany(comp)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalEmitidas = invoices.filter(
    (i) => i.status === 'autorizada' || i.status === 'emitida',
  ).length
  const totalValor = invoices
    .filter((i) => i.status === 'autorizada')
    .reduce((acc, curr) => acc + (curr.valor_servicos || 0), 0)
  const totalIss = invoices
    .filter((i) => i.status === 'autorizada')
    .reduce((acc, curr) => acc + (curr.valor_iss || 0), 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'autorizada':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Autorizada</Badge>
      case 'enviada':
      case 'processando':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Processando</Badge>
      case 'rascunho':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'rejeitada':
      case 'cancelada':
        return <Badge variant="destructive">Cancelada / Rejeitada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Painel de Emissão NFS-e Nacional
            </h1>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 font-medium"
            >
              {company?.ambiente === 'producao' ? 'Produção' : 'Homologação'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Emitente:{' '}
            <strong className="text-slate-700">
              {company?.razao_social || 'GB SOLUCOES LTDA'}
            </strong>{' '}
            • CNPJ {company?.cnpj || '53.242.055/0001-74'} • {company?.municipio || 'São Pedro'}/
            {company?.uf || 'SP'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Link to="/notas/nova">
              <PlusCircle className="w-4 h-4 mr-2" />
              Emitir Nova NFS-e
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/servicos">
              <Layers className="w-4 h-4 mr-2" />
              Cadastrar Serviços
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Notas Autorizadas
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEmitidas}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">Sistema Nacional</span> Receita Federal
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Faturamento Emitido
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalValor)}</div>
            <p className="text-xs text-slate-500 mt-1">Valor bruto dos serviços</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              ISS Calculado
            </CardTitle>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalIss)}</div>
            <p className="text-xs text-slate-500 mt-1">
              Município: {company?.municipio || 'São Pedro/SP'} (2,00%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Serviços dos CNAEs
            </CardTitle>
            <Layers className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{services.length}</div>
            <p className="text-xs text-slate-500 mt-1">Mapeados na LC 116/2003</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Latest Invoices and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Invoices (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Últimas NFS-e Emitidas</h2>
              <p className="text-xs text-slate-500">Histórico de RPS e notas transmitidas</p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              <Link to="/notas">
                Ver todas <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">Carregando notas...</div>
            ) : invoices.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-600">Nenhuma nota emitida ainda</p>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/notas/nova">Criar primeira nota</Link>
                </Button>
              </div>
            ) : (
              invoices.slice(0, 5).map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">
                        {inv.numero_nfse
                          ? `NFS-e Nº ${inv.numero_nfse}`
                          : `RPS Nº ${inv.numero_rps}`}
                      </span>
                      {getStatusBadge(inv.status)}
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                      {inv.tomador_razao_social}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Doc: {inv.tomador_documento} • Emissão: {inv.data_emissao} • LC 116:{' '}
                      {inv.codigo_lc116}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-slate-900">
                      {formatCurrency(inv.valor_servicos)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Líq: {formatCurrency(inv.valor_liquido)}
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-2 h-7 text-xs">
                      <Link to={`/notas/${inv.id}`}>Detalhes</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info & Config Card (1 col) */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
                <CardTitle className="text-base">Sistema Nacional NFS-e</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Integração configurada para emissão e transmissão no padrão nacional da Receita
                Federal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1">
                <div className="text-slate-500">Município de Incidência</div>
                <div className="font-semibold text-slate-800">
                  {company?.municipio || 'São Pedro'} / {company?.uf || 'SP'} (Cód. IBGE 3550407)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1">
                <div className="text-slate-500">Ambiente de Operação</div>
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>{company?.ambiente === 'producao' ? 'Produção' : 'Homologação'}</span>
                  <Link to="/certificado" className="text-blue-600 hover:underline text-[11px]">
                    Alterar
                  </Link>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1">
                <div className="text-slate-500">Certificado Digital A1</div>
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>A1 (.pfx) Configurado</span>
                  <Link to="/certificado" className="text-blue-600 hover:underline text-[11px]">
                    Gerenciar
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  asChild
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  size="sm"
                >
                  <Link to="/certificado">Configurar Certificado e Ambiente</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CNAE quick info */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Atividades Econômicas GB Soluções</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {services.slice(0, 3).map((s) => (
                <div key={s.id} className="p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="font-medium text-slate-800 truncate">{s.nome}</div>
                  <div className="text-slate-500 flex justify-between mt-0.5 text-[11px]">
                    <span>Item LC 116: {s.codigo_lc116}</span>
                    <span>ISS: {s.aliquota_iss}%</span>
                  </div>
                </div>
              ))}
              <Button asChild variant="ghost" size="sm" className="w-full text-blue-600 text-xs">
                <Link to="/servicos">Ver todos os serviços</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
