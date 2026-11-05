import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit2, Trash2, Layers, Search, Sparkles } from 'lucide-react'
import { listServices, createService, updateService, deleteService } from '@/services/services'
import { ServiceItem } from '@/types/nfse'

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)

  const { toast } = useToast()

  // Form states
  const [nome, setNome] = useState('')
  const [codigoLc, setCodigoLc] = useState('')
  const [cnae, setCnae] = useState('')
  const [descricao, setDescricao] = useState('')
  const [aliqIss, setAliqIss] = useState(2.0)
  const [aliqPis, setAliqPis] = useState(0.65)
  const [aliqCofins, setAliqCofins] = useState(3.0)
  const [aliqIrrf, setAliqIrrf] = useState(1.5)
  const [aliqCsll, setAliqCsll] = useState(1.0)
  const [aliqInss, setAliqInss] = useState(0)
  const [retencaoIss, setRetencaoIss] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await listServices()
      setServices(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openNew = () => {
    setEditingService(null)
    setNome('')
    setCodigoLc('')
    setCnae('')
    setDescricao('')
    setAliqIss(2.0)
    setAliqPis(0.65)
    setAliqCofins(3.0)
    setAliqIrrf(1.5)
    setAliqCsll(1.0)
    setAliqInss(0)
    setRetencaoIss(false)
    setDialogOpen(true)
  }

  const openEdit = (s: ServiceItem) => {
    setEditingService(s)
    setNome(s.nome)
    setCodigoLc(s.codigo_lc116)
    setCnae(s.cnae || '')
    setDescricao(s.descricao_padrao || '')
    setAliqIss(s.aliquota_iss)
    setAliqPis(s.aliquota_pis || 0)
    setAliqCofins(s.aliquota_cofins || 0)
    setAliqIrrf(s.aliquota_irrf || 0)
    setAliqCsll(s.aliquota_csll || 0)
    setAliqInss(s.aliquota_inss || 0)
    setRetencaoIss(Boolean(s.retencao_iss_padrao))
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !codigoLc.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe o nome do serviço e o código da LC 116.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        nome: nome.trim(),
        codigo_lc116: codigoLc.trim(),
        cnae: cnae.trim(),
        descricao_padrao: descricao.trim(),
        aliquota_iss: Number(aliqIss) || 0,
        aliquota_pis: Number(aliqPis) || 0,
        aliquota_cofins: Number(aliqCofins) || 0,
        aliquota_irrf: Number(aliqIrrf) || 0,
        aliquota_csll: Number(aliqCsll) || 0,
        aliquota_inss: Number(aliqInss) || 0,
        retencao_iss_padrao: retencaoIss,
        ativo: true,
      }

      if (editingService) {
        await updateService(editingService.id, payload)
        toast({ title: 'Serviço atualizado com sucesso!' })
      } else {
        await createService(payload)
        toast({ title: 'Serviço cadastrado com sucesso!' })
      }

      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Não foi possível gravar o serviço.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este serviço?')) return
    try {
      await deleteService(id)
      toast({ title: 'Serviço excluído' })
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err?.message || 'Falha ao remover o serviço.',
        variant: 'destructive',
      })
    }
  }

  const filtered = services.filter((s) => {
    const term = searchTerm.toLowerCase()
    return (
      s.nome.toLowerCase().includes(term) ||
      s.codigo_lc116.toLowerCase().includes(term) ||
      (s.cnae && s.cnae.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Serviços & LC 116</h1>
          <p className="text-sm text-slate-500">
            Serviços derivados das atividades econômicas (CNAEs) da GB SOLUCOES LTDA com alíquotas
            de ISS e retenções.
          </p>
        </div>

        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 shadow-sm shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome do serviço, código LC 116 ou CNAE..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[110px]">Cód. LC 116</TableHead>
                <TableHead className="min-w-[220px]">Nome do Serviço</TableHead>
                <TableHead className="w-[120px]">CNAE</TableHead>
                <TableHead className="w-[100px] text-right">Alíq. ISS</TableHead>
                <TableHead className="w-[180px]">Retenções Federais</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Carregando serviços cadastrados...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/70">
                    <TableCell className="font-mono font-medium text-xs text-blue-700">
                      <Badge variant="outline" className="border-blue-200 bg-blue-50/50">
                        {s.codigo_lc116}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 text-sm">{s.nome}</div>
                      {s.descricao_padrao && (
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {s.descricao_padrao}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      {s.cnae || '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900 text-sm">
                      {s.aliquota_iss.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          PIS: {s.aliquota_pis || 0}%
                        </span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          COF: {s.aliquota_cofins || 0}%
                        </span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          IR: {s.aliquota_irrf || 0}%
                        </span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          CSLL: {s.aliquota_csll || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(s)}
                          className="h-8 w-8 text-slate-600 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s.id)}
                          className="h-8 w-8 text-slate-600 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog New/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              Vincule o serviço ao código da Lei Complementar 116 e configure alíquotas de
              tributação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="codigo_lc">Item LC 116 *</Label>
                <Input
                  id="codigo_lc"
                  placeholder="Ex: 01.07"
                  value={codigoLc}
                  onChange={(e) => setCodigoLc(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cnae">CNAE correspondente</Label>
                <Input
                  id="cnae"
                  placeholder="Ex: 6201-5/01"
                  value={cnae}
                  onChange={(e) => setCnae(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aliq_iss">Alíquota ISS (%) *</Label>
                <Input
                  id="aliq_iss"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={aliqIss}
                  onChange={(e) => setAliqIss(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome do Serviço *</Label>
              <Input
                id="nome"
                placeholder="Ex: Desenvolvimento de Programas de Computador sob Encomenda"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição Padrão para Discriminação</Label>
              <Textarea
                id="descricao"
                placeholder="Texto explicativo pré-carregado no RPS ao emitir a nota fiscal..."
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Alíquotas de Retenções Federais (%)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="aliq_pis" className="text-xs">
                    PIS (%)
                  </Label>
                  <Input
                    id="aliq_pis"
                    type="number"
                    step="0.01"
                    value={aliqPis}
                    onChange={(e) => setAliqPis(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="aliq_cofins" className="text-xs">
                    COFINS (%)
                  </Label>
                  <Input
                    id="aliq_cofins"
                    type="number"
                    step="0.01"
                    value={aliqCofins}
                    onChange={(e) => setAliqCofins(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="aliq_irrf" className="text-xs">
                    IRRF (%)
                  </Label>
                  <Input
                    id="aliq_irrf"
                    type="number"
                    step="0.01"
                    value={aliqIrrf}
                    onChange={(e) => setAliqIrrf(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="aliq_csll" className="text-xs">
                    CSLL (%)
                  </Label>
                  <Input
                    id="aliq_csll"
                    type="number"
                    step="0.01"
                    value={aliqCsll}
                    onChange={(e) => setAliqCsll(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="retencao_iss" checked={retencaoIss} onCheckedChange={setRetencaoIss} />
              <Label htmlFor="retencao_iss" className="text-sm">
                ISS Retido na Fonte por padrão para este serviço
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar Serviço'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
