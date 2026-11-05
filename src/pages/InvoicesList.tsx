import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { listInvoices } from '@/services/invoices'
import { InvoiceItem } from '@/types/nfse'

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await listInvoices()
      setInvoices(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'autorizada':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> Autorizada
          </Badge>
        )
      case 'enviada':
      case 'processando':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Processando
          </Badge>
        )
      case 'rascunho':
        return (
          <Badge variant="secondary" className="w-fit">
            Rascunho
          </Badge>
        )
      case 'cancelada':
      case 'rejeitada':
        return (
          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" /> {status}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="w-fit">
            {status}
          </Badge>
        )
    }
  }

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.tomador_razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.tomador_documento.includes(searchTerm) ||
      (inv.numero_nfse && inv.numero_nfse.includes(searchTerm)) ||
      String(inv.numero_rps).includes(searchTerm) ||
      (inv.protocolo_envio && inv.protocolo_envio.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'todos' || inv.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notas Fiscais Emitidas
          </h1>
          <p className="text-sm text-slate-500">
            Histórico completo de RPS e NFS-e autorizadas no Sistema Nacional.
          </p>
        </div>

        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-sm shrink-0">
          <Link to="/notas/nova">
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova NFS-e
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por Tomador, CNPJ/CPF, Nº NFS-e, RPS ou Protocolo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="autorizada">Autorizada</SelectItem>
                  <SelectItem value="enviada">Enviada / Processando</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[120px]">Nº NFS-e / RPS</TableHead>
                <TableHead className="w-[110px]">Data</TableHead>
                <TableHead className="min-w-[200px]">Tomador (Cliente)</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[130px] text-right">Valor Bruto</TableHead>
                <TableHead className="w-[130px] text-right">Valor Líquido</TableHead>
                <TableHead className="w-[100px] text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Carregando notas fiscais...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Nenhuma nota fiscal encontrada com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="font-semibold text-sm text-slate-900">
                        {inv.numero_nfse ? `Nº ${inv.numero_nfse}` : `RPS ${inv.numero_rps}`}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        RPS: {inv.numero_rps}/{inv.serie_rps}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{inv.data_emissao}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 text-sm truncate max-w-[260px]">
                        {inv.tomador_razao_social}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {inv.tomador_documento}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="text-right font-medium text-slate-900 text-sm">
                      {formatCurrency(inv.valor_servicos)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 text-sm">
                      {formatCurrency(inv.valor_liquido)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                        <Link to={`/notas/${inv.id}`}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
