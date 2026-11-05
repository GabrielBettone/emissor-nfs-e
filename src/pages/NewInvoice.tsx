import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Send,
  Save,
  Calculator,
  Building,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Receipt,
} from 'lucide-react'
import { listServices } from '@/services/services'
import { getCompanySettings } from '@/services/company'
import { getNextRpsNumber, createInvoice, transmitInvoice } from '@/services/invoices'
import { ServiceItem, CompanySettings, calculateTaxes, TomadorTipo } from '@/types/nfse'

export default function NewInvoicePage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [company, setCompany] = useState<CompanySettings | null>(null)
  const [services, setServices] = useState<ServiceItem[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [rpsNumber, setRpsNumber] = useState<number>(1)
  const [serieRps, setSerieRps] = useState<string>('1')
  const [dataEmissao, setDataEmissao] = useState<string>(new Date().toISOString().split('T')[0])

  // Tomador
  const [tomadorTipo, setTomadorTipo] = useState<TomadorTipo>('PJ')
  const [tomadorDoc, setTomadorDoc] = useState('')
  const [tomadorNome, setTomadorNome] = useState('')
  const [tomadorEmail, setTomadorEmail] = useState('')
  const [tomadorTelefone, setTomadorTelefone] = useState('')
  const [tomadorLogradouro, setTomadorLogradouro] = useState('')
  const [tomadorNumero, setTomadorNumero] = useState('')
  const [tomadorComplemento, setTomadorComplemento] = useState('')
  const [tomadorBairro, setTomadorBairro] = useState('')
  const [tomadorMunicipio, setTomadorMunicipio] = useState('')
  const [tomadorUf, setTomadorUf] = useState('')
  const [tomadorCep, setTomadorCep] = useState('')
  const [tomadorCodMun, setTomadorCodMun] = useState('')

  // Serviço & Prestação
  const [codigoLc, setCodigoLc] = useState('')
  const [cnae, setCnae] = useState('')
  const [discriminacao, setDiscriminacao] = useState('')
  const [municipioPrestacaoCod, setMunicipioPrestacaoCod] = useState('3550407')
  const [municipioPrestacaoNome, setMunicipioPrestacaoNome] = useState('São Pedro/SP')

  // Valores e Impostos
  const [valorServicos, setValorServicos] = useState<number>(1500)
  const [descontoIncondicionado, setDescontoIncondicionado] = useState<number>(0)
  const [deducoes, setDeducoes] = useState<number>(0)
  const [aliquotaIss, setAliquotaIss] = useState<number>(2.0)
  const [issRetido, setIssRetido] = useState<boolean>(false)
  const [aliquotaPis, setAliquotaPis] = useState<number>(0.65)
  const [aliquotaCofins, setAliquotaCofins] = useState<number>(3.0)
  const [aliquotaInss, setAliquotaInss] = useState<number>(0)
  const [aliquotaIrrf, setAliquotaIrrf] = useState<number>(1.5)
  const [aliquotaCsll, setAliquotaCsll] = useState<number>(1.0)
  const [outrasRetencoes, setOutrasRetencoes] = useState<number>(0)

  const [loading, setLoading] = useState(false)
  const [transmitting, setTransmitting] = useState(false)

  useEffect(() => {
    async function init() {
      const [comp, srvList, nextNum] = await Promise.all([
        getCompanySettings(),
        listServices(),
        getNextRpsNumber(),
      ])
      setCompany(comp)
      setServices(srvList)
      setRpsNumber(nextNum)

      if (comp?.codigo_municipio_ibge) {
        setMunicipioPrestacaoCod(comp.codigo_municipio_ibge)
        setMunicipioPrestacaoNome(`${comp.municipio}/${comp.uf}`)
      }

      // Pre-select first service if exists
      if (srvList.length > 0) {
        const first = srvList[0]
        setSelectedServiceId(first.id)
        setCodigoLc(first.codigo_lc116)
        setCnae(first.cnae || '')
        setDiscriminacao(first.descricao_padrao || '')
        setAliquotaIss(first.aliquota_iss)
        setAliquotaPis(first.aliquota_pis || 0)
        setAliquotaCofins(first.aliquota_cofins || 0)
        setAliquotaIrrf(first.aliquota_irrf || 0)
        setAliquotaCsll(first.aliquota_csll || 0)
        setAliquotaInss(first.aliquota_inss || 0)
        setIssRetido(Boolean(first.retencao_iss_padrao))
      }
    }
    init()
  }, [])

  const handleSelectService = (id: string) => {
    setSelectedServiceId(id)
    const srv = services.find((s) => s.id === id)
    if (srv) {
      setCodigoLc(srv.codigo_lc116)
      setCnae(srv.cnae || '')
      setDiscriminacao(srv.descricao_padrao || '')
      setAliquotaIss(srv.aliquota_iss)
      setAliquotaPis(srv.aliquota_pis || 0)
      setAliquotaCofins(srv.aliquota_cofins || 0)
      setAliquotaIrrf(srv.aliquota_irrf || 0)
      setAliquotaCsll(srv.aliquota_csll || 0)
      setAliquotaInss(srv.aliquota_inss || 0)
      setIssRetido(Boolean(srv.retencao_iss_padrao))
    }
  }

  // Tax calculation on the fly
  const taxes = calculateTaxes({
    valorServicos,
    descontoIncondicionado,
    deducoes,
    aliquotaIss,
    issRetido,
    aliquotaPis,
    aliquotaCofins,
    aliquotaInss,
    aliquotaIrrf,
    aliquotaCsll,
    outrasRetencoes,
  })

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const validateForm = () => {
    if (!tomadorDoc.trim() || !tomadorNome.trim()) {
      toast({
        title: 'Dados do tomador incompletos',
        description: 'Informe o documento (CNPJ/CPF) e o nome/razão social do cliente.',
        variant: 'destructive',
      })
      return false
    }
    if (!codigoLc.trim() || !discriminacao.trim()) {
      toast({
        title: 'Serviço incompleto',
        description: 'Informe o código LC 116 e a discriminação dos serviços prestados.',
        variant: 'destructive',
      })
      return false
    }
    if (valorServicos <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'O valor do serviço deve ser maior do que zero.',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return
    setLoading(true)
    try {
      const inv = await createInvoice({
        numero_rps: rpsNumber,
        serie_rps: serieRps,
        tipo_rps: '1',
        data_emissao: dataEmissao,
        status: 'rascunho',
        tomador_tipo: tomadorTipo,
        tomador_documento: tomadorDoc,
        tomador_razao_social: tomadorNome,
        tomador_email: tomadorEmail,
        tomador_telefone: tomadorTelefone,
        tomador_logradouro: tomadorLogradouro,
        tomador_numero: tomadorNumero,
        tomador_complemento: tomadorComplemento,
        tomador_bairro: tomadorBairro,
        tomador_municipio: tomadorMunicipio,
        tomador_uf: tomadorUf,
        tomador_cep: tomadorCep,
        tomador_codigo_municipio: tomadorCodMun || municipioPrestacaoCod,
        service_id: selectedServiceId || undefined,
        codigo_lc116: codigoLc,
        cnae: cnae,
        discriminacao: discriminacao,
        municipio_prestacao_codigo: municipioPrestacaoCod,
        municipio_prestacao_nome: municipioPrestacaoNome,
        valor_servicos: valorServicos,
        valor_deducoes: deducoes,
        desconto_incondicionado: descontoIncondicionado,
        desconto_condicionado: 0,
        base_calculo: taxes.baseCalculo,
        aliquota_iss: aliquotaIss,
        valor_iss: taxes.valorIss,
        iss_retido: issRetido,
        aliquota_pis: aliquotaPis,
        valor_pis: taxes.valorPis,
        aliquota_cofins: aliquotaCofins,
        valor_cofins: taxes.valorCofins,
        aliquota_inss: aliquotaInss,
        valor_inss: taxes.valorInss,
        aliquota_irrf: aliquotaIrrf,
        valor_irrf: taxes.valorIrrf,
        aliquota_csll: aliquotaCsll,
        valor_csll: taxes.valorCsll,
        outras_retencoes: outrasRetencoes,
        valor_liquido: taxes.valorLiquido,
        ambiente: company?.ambiente || 'homologacao',
      })

      toast({
        title: 'Rascunho salvo',
        description: `RPS Nº ${rpsNumber} salvo com sucesso!`,
      })
      navigate(`/notas/${inv.id}`)
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar rascunho',
        description: err?.message || 'Falha ao salvar a nota.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmitAndTransmit = async () => {
    if (!validateForm()) return
    setTransmitting(true)
    try {
      // 1. Criar a nota
      const inv = await createInvoice({
        numero_rps: rpsNumber,
        serie_rps: serieRps,
        tipo_rps: '1',
        data_emissao: dataEmissao,
        status: 'enviada',
        tomador_tipo: tomadorTipo,
        tomador_documento: tomadorDoc,
        tomador_razao_social: tomadorNome,
        tomador_email: tomadorEmail,
        tomador_telefone: tomadorTelefone,
        tomador_logradouro: tomadorLogradouro,
        tomador_numero: tomadorNumero,
        tomador_complemento: tomadorComplemento,
        tomador_bairro: tomadorBairro,
        tomador_municipio: tomadorMunicipio,
        tomador_uf: tomadorUf,
        tomador_cep: tomadorCep,
        tomador_codigo_municipio: tomadorCodMun || municipioPrestacaoCod,
        service_id: selectedServiceId || undefined,
        codigo_lc116: codigoLc,
        cnae: cnae,
        discriminacao: discriminacao,
        municipio_prestacao_codigo: municipioPrestacaoCod,
        municipio_prestacao_nome: municipioPrestacaoNome,
        valor_servicos: valorServicos,
        valor_deducoes: deducoes,
        desconto_incondicionado: descontoIncondicionado,
        desconto_condicionado: 0,
        base_calculo: taxes.baseCalculo,
        aliquota_iss: aliquotaIss,
        valor_iss: taxes.valorIss,
        iss_retido: issRetido,
        aliquota_pis: aliquotaPis,
        valor_pis: taxes.valorPis,
        aliquota_cofins: aliquotaCofins,
        valor_cofins: taxes.valorCofins,
        aliquota_inss: aliquotaInss,
        valor_inss: taxes.valorInss,
        aliquota_irrf: aliquotaIrrf,
        valor_irrf: taxes.valorIrrf,
        aliquota_csll: aliquotaCsll,
        valor_csll: taxes.valorCsll,
        outras_retencoes: outrasRetencoes,
        valor_liquido: taxes.valorLiquido,
        ambiente: company?.ambiente || 'homologacao',
      })

      // 2. Transmitir ao Sistema Nacional via pb_hook
      const res = await transmitInvoice(inv.id)

      toast({
        title: 'NFS-e Emitida e Autorizada!',
        description: `Nota Nacional Nº ${res.numero_nfse} gerada com protocolo ${res.protocolo}.`,
      })

      navigate(`/notas/${inv.id}`)
    } catch (err: any) {
      toast({
        title: 'Erro na transmissão da NFS-e',
        description: err?.message || 'Falha ao transmitir ao Sistema Nacional da Receita Federal.',
        variant: 'destructive',
      })
    } finally {
      setTransmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Emitir Nova NFS-e Nacional
          </h1>
          <p className="text-sm text-slate-500">
            Geração de RPS, cálculo instantâneo de tributos e envio ao sistema nacional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-slate-50 border-slate-300">
            Ambiente:{' '}
            <strong className="ml-1 text-slate-800 uppercase">
              {company?.ambiente || 'homologacao'}
            </strong>
          </Badge>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            RPS Sugerido: Nº {rpsNumber}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Forms (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* RPS Data */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                Dados do RPS (Recibo Provisório de Serviços)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="num_rps">Número RPS</Label>
                  <Input
                    id="num_rps"
                    type="number"
                    value={rpsNumber}
                    onChange={(e) => setRpsNumber(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="serie_rps">Série</Label>
                  <Input
                    id="serie_rps"
                    value={serieRps}
                    onChange={(e) => setSerieRps(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dt_emissao">Data Emissão</Label>
                  <Input
                    id="dt_emissao"
                    type="date"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tomador Data */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Dados do Tomador (Cliente)
              </CardTitle>
              <CardDescription className="text-xs">
                Identificação e endereço para onde a NFS-e será gerada e destinada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo de Pessoa</Label>
                  <Select
                    value={tomadorTipo}
                    onValueChange={(val: TomadorTipo) => setTomadorTipo(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PJ">Pessoa Jurídica (CNPJ)</SelectItem>
                      <SelectItem value="PF">Pessoa Física (CPF)</SelectItem>
                      <SelectItem value="EXTERIOR">Exterior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tomador_doc">
                    {tomadorTipo === 'PJ'
                      ? 'CNPJ *'
                      : tomadorTipo === 'PF'
                        ? 'CPF *'
                        : 'Documento *'}
                  </Label>
                  <Input
                    id="tomador_doc"
                    placeholder={tomadorTipo === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    value={tomadorDoc}
                    onChange={(e) => setTomadorDoc(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tomador_email">E-mail do Tomador</Label>
                  <Input
                    id="tomador_email"
                    type="email"
                    placeholder="financeiro@cliente.com"
                    value={tomadorEmail}
                    onChange={(e) => setTomadorEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="tomador_nome">Razão Social / Nome Completo *</Label>
                  <Input
                    id="tomador_nome"
                    placeholder="Nome da empresa ou cliente tomador"
                    value={tomadorNome}
                    onChange={(e) => setTomadorNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tomador_tel">Telefone</Label>
                  <Input
                    id="tomador_tel"
                    placeholder="(00) 00000-0000"
                    value={tomadorTelefone}
                    onChange={(e) => setTomadorTelefone(e.target.value)}
                  />
                </div>
              </div>

              {/* Endereço Tomador */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="tomador_log">Logradouro (Rua, Av.)</Label>
                  <Input
                    id="tomador_log"
                    placeholder="Ex: Av. Paulista"
                    value={tomadorLogradouro}
                    onChange={(e) => setTomadorLogradouro(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tomador_num">Número</Label>
                  <Input
                    id="tomador_num"
                    placeholder="Ex: 1000"
                    value={tomadorNumero}
                    onChange={(e) => setTomadorNumero(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tomador_bairro">Bairro</Label>
                  <Input
                    id="tomador_bairro"
                    placeholder="Ex: Bela Vista"
                    value={tomadorBairro}
                    onChange={(e) => setTomadorBairro(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tomador_mun">Município</Label>
                  <Input
                    id="tomador_mun"
                    placeholder="Ex: São Paulo"
                    value={tomadorMunicipio}
                    onChange={(e) => setTomadorMunicipio(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tomador_uf">UF</Label>
                  <Input
                    id="tomador_uf"
                    maxLength={2}
                    placeholder="SP"
                    value={tomadorUf}
                    onChange={(e) => setTomadorUf(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tomador_cep">CEP</Label>
                  <Input
                    id="tomador_cep"
                    placeholder="00000-000"
                    value={tomadorCep}
                    onChange={(e) => setTomadorCep(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Serviço Prestado */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Serviço e Discriminação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Selecionar Serviço Pré-cadastrado (GB Soluções)</Label>
                <Select value={selectedServiceId} onValueChange={handleSelectService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um dos serviços da empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.codigo_lc116} - {s.nome} (ISS {s.aliquota_iss}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="srv_lc">Código LC 116 *</Label>
                  <Input
                    id="srv_lc"
                    placeholder="Ex: 01.07"
                    value={codigoLc}
                    onChange={(e) => setCodigoLc(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv_cnae">CNAE</Label>
                  <Input
                    id="srv_cnae"
                    placeholder="Ex: 6201-5/01"
                    value={cnae}
                    onChange={(e) => setCnae(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mun_prest">Município de Prestação</Label>
                  <Input
                    id="mun_prest"
                    value={municipioPrestacaoNome}
                    onChange={(e) => setMunicipioPrestacaoNome(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="srv_disc">Discriminação dos Serviços *</Label>
                <Textarea
                  id="srv_disc"
                  rows={4}
                  placeholder="Descreva detalhadamente o serviço prestado..."
                  value={discriminacao}
                  onChange={(e) => setDiscriminacao(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Alíquotas e Configurações de Impostos */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Alíquotas dos Impostos e Retenções (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="aliq_iss">ISS (%) *</Label>
                  <Input
                    id="aliq_iss"
                    type="number"
                    step="0.01"
                    value={aliquotaIss}
                    onChange={(e) => setAliquotaIss(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aliq_pis">PIS (%)</Label>
                  <Input
                    id="aliq_pis"
                    type="number"
                    step="0.01"
                    value={aliquotaPis}
                    onChange={(e) => setAliquotaPis(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aliq_cof">COFINS (%)</Label>
                  <Input
                    id="aliq_cof"
                    type="number"
                    step="0.01"
                    value={aliquotaCofins}
                    onChange={(e) => setAliquotaCofins(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aliq_irrf">IRRF (%)</Label>
                  <Input
                    id="aliq_irrf"
                    type="number"
                    step="0.01"
                    value={aliquotaIrrf}
                    onChange={(e) => setAliquotaIrrf(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="aliq_csll">CSLL (%)</Label>
                  <Input
                    id="aliq_csll"
                    type="number"
                    step="0.01"
                    value={aliquotaCsll}
                    onChange={(e) => setAliquotaCsll(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aliq_inss">INSS (%)</Label>
                  <Input
                    id="aliq_inss"
                    type="number"
                    step="0.01"
                    value={aliquotaInss}
                    onChange={(e) => setAliquotaInss(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v_desc">Desc. Incondicionado</Label>
                  <Input
                    id="v_desc"
                    type="number"
                    step="0.01"
                    value={descontoIncondicionado}
                    onChange={(e) => setDescontoIncondicionado(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="v_deduc">Deduções Legais</Label>
                  <Input
                    id="v_deduc"
                    type="number"
                    step="0.01"
                    value={deducoes}
                    onChange={(e) => setDeducoes(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="iss_retido_toggle" checked={issRetido} onCheckedChange={setIssRetido} />
                <Label htmlFor="iss_retido_toggle" className="text-sm font-medium">
                  ISS Retido pelo Tomador (o tomador recolhe o imposto)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary & Actions (1 col sticky) */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-md sticky top-6 bg-white">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Resumo da Nota & Impostos
              </CardTitle>
              <CardDescription className="text-xs">
                Cálculo instantâneo baseado nas alíquotas informadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="v_servicos" className="text-sm font-bold text-slate-800">
                  Valor Bruto dos Serviços (R$) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">
                    R$
                  </span>
                  <Input
                    id="v_servicos"
                    type="number"
                    step="0.01"
                    className="pl-10 text-lg font-bold text-blue-700"
                    value={valorServicos}
                    onChange={(e) => setValorServicos(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base de Cálculo:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(taxes.baseCalculo)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>ISS ({aliquotaIss}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(taxes.valorIss)}{' '}
                    {issRetido && <span className="text-[10px] text-amber-600">(Retido)</span>}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>PIS ({aliquotaPis}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(taxes.valorPis)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>COFINS ({aliquotaCofins}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(taxes.valorCofins)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>IRRF ({aliquotaIrrf}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(taxes.valorIrrf)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>CSLL ({aliquotaCsll}%):</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(taxes.valorCsll)}
                  </span>
                </div>

                {taxes.valorInss > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>INSS ({aliquotaInss}%):</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(taxes.valorInss)}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-2 flex justify-between font-semibold text-slate-700">
                  <span>Total de Retenções:</span>
                  <span className="text-red-600">- {formatCurrency(taxes.totalRetencoes)}</span>
                </div>
              </div>

              {/* Valor Líquido Box */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5">
                <div className="text-xs text-blue-600 font-medium">Valor Líquido a Receber</div>
                <div className="text-2xl font-extrabold text-blue-900 mt-0.5">
                  {formatCurrency(taxes.valorLiquido)}
                </div>
                <p className="text-[10px] text-blue-700/80 mt-1">
                  Valor bruto deduzidas todas as retenções aplicáveis.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleEmitAndTransmit}
                  disabled={transmitting || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 shadow-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {transmitting ? 'Transmitindo à Receita...' : 'Emitir e Transmitir NFS-e'}
                </Button>

                <Button
                  onClick={handleSaveDraft}
                  disabled={transmitting || loading}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar como Rascunho / RPS'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
