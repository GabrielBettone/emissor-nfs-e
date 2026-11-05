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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Building2, Save, ShieldCheck, MapPin, Percent, CheckCircle2 } from 'lucide-react'
import { getCompanySettings, saveCompanySettings } from '@/services/company'
import { CompanySettings, AmbienteType } from '@/types/nfse'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [companyId, setCompanyId] = useState<string>('')
  const [razaoSocial, setRazaoSocial] = useState('GB SOLUCOES LTDA')
  const [nomeFantasia, setNomeFantasia] = useState('GB Soluções')
  const [cnpj, setCnpj] = useState('53.242.055/0001-74')
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState('12345/01')
  const [email, setEmail] = useState('contato@gbsolucoes.com.br')
  const [telefone, setTelefone] = useState('(19) 3481-9000')
  const [logradouro, setLogradouro] = useState('Rua Heitor Mariotti')
  const [numero, setNumero] = useState('185')
  const [complemento, setComplemento] = useState('Sala 01')
  const [bairro, setBairro] = useState('Mariluz')
  const [municipio, setMunicipio] = useState('São Pedro')
  const [uf, setUf] = useState('SP')
  const [codigoIbge, setCodigoIbge] = useState('3550407') // São Pedro/SP
  const [cep, setCep] = useState('13522-340')
  const [simplesNacional, setSimplesNacional] = useState(true)
  const [aliquotaIssPadrao, setAliquotaIssPadrao] = useState(2.0)
  const [ambiente, setAmbiente] = useState<AmbienteType>('homologacao')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const comp = await getCompanySettings()
        if (comp) {
          setCompanyId(comp.id)
          setRazaoSocial(comp.razao_social)
          setNomeFantasia(comp.nome_fantasia || '')
          setCnpj(comp.cnpj)
          setInscricaoMunicipal(comp.inscricao_municipal || '')
          setEmail(comp.email || '')
          setTelefone(comp.telefone || '')
          setLogradouro(comp.logradouro)
          setNumero(comp.numero)
          setComplemento(comp.complemento || '')
          setBairro(comp.bairro)
          setMunicipio(comp.municipio)
          setUf(comp.uf)
          setCodigoIbge(comp.codigo_municipio_ibge || '3550407')
          setCep(comp.cep)
          setSimplesNacional(Boolean(comp.optante_simples_nacional))
          setAliquotaIssPadrao(comp.aliquota_iss_padrao ?? 2.0)
          setAmbiente(comp.ambiente || 'homologacao')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await saveCompanySettings(
        {
          razao_social: razaoSocial.trim(),
          nome_fantasia: nomeFantasia.trim(),
          cnpj: cnpj.trim(),
          inscricao_municipal: inscricaoMunicipal.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
          logradouro: logradouro.trim(),
          numero: numero.trim(),
          complemento: complemento.trim(),
          bairro: bairro.trim(),
          municipio: municipio.trim(),
          uf: uf.trim().toUpperCase(),
          codigo_municipio_ibge: codigoIbge.trim(),
          cep: cep.trim(),
          optante_simples_nacional: simplesNacional,
          aliquota_iss_padrao: Number(aliquotaIssPadrao) || 2.0,
          ambiente: ambiente,
        },
        companyId || undefined,
      )

      toast({
        title: 'Configurações salvas!',
        description: 'Dados da empresa e alíquotas atualizados com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar configurações',
        description: err?.message || 'Falha ao salvar as informações da empresa.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configurações da Empresa
        </h1>
        <p className="text-sm text-slate-500">
          Dados do emitente GB SOLUCOES LTDA, endereço fiscal em São Pedro/SP e alíquotas padrão.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identificação Fiscal */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Identificação do Emitente (GB SOLUCOES LTDA)
            </CardTitle>
            <CardDescription className="text-xs">
              Dados cadastrais utilizados no cabeçalho e assinatura das notas fiscais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="razao_social">Razão Social *</Label>
                <Input
                  id="razao_social"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="im">Inscrição Municipal</Label>
                <Input
                  id="im"
                  value={inscricaoMunicipal}
                  onChange={(e) => setInscricaoMunicipal(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tel">Telefone Comercial</Label>
                <Input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email_emitente">E-mail para Notificações e Envio de XML</Label>
              <Input
                id="email_emitente"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço Fiscal */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Endereço Fiscal em São Pedro - SP
            </CardTitle>
            <CardDescription className="text-xs">
              Município de incidência do ISS do emitente no Sistema Nacional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <Label htmlFor="logradouro">Logradouro (Rua, Av.) *</Label>
                <Input
                  id="logradouro"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cep">CEP *</Label>
                <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="municipio">Município *</Label>
                <Input
                  id="municipio"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uf">UF *</Label>
                <Input
                  id="uf"
                  maxLength={2}
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cod_ibge">Código IBGE Município *</Label>
                <Input
                  id="cod_ibge"
                  value={codigoIbge}
                  onChange={(e) => setCodigoIbge(e.target.value)}
                  required
                />
                <p className="text-[10px] text-slate-400">3550407 = São Pedro/SP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tributação & Alíquotas Padrão */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              Regime Tributário & Alíquotas Padrão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-slate-900">
                  Optante pelo Simples Nacional
                </div>
                <div className="text-xs text-slate-500">
                  GB Soluções enquadrada no regime diferenciado do Simples Nacional.
                </div>
              </div>
              <Switch checked={simplesNacional} onCheckedChange={setSimplesNacional} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="aliq_padrao">Alíquota Padrão de ISS (%)</Label>
                <Input
                  id="aliq_padrao"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={aliquotaIssPadrao}
                  onChange={(e) => setAliquotaIssPadrao(parseFloat(e.target.value) || 2.0)}
                />
                <p className="text-[11px] text-slate-500">
                  Alíquota municipal aplicada aos serviços em São Pedro/SP (geralmente 2,00%).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Ambiente do Sistema Nacional</Label>
                <Select value={ambiente} onValueChange={(val: AmbienteType) => setAmbiente(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homologacao">Homologação (Ambiente de Testes)</SelectItem>
                    <SelectItem value="producao">
                      Produção (Ambiente Oficial com Validade Jurídica)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-500">
                  Recomendado iniciar em homologação para validar RPS e formato XML.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-end p-4">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Gravando...' : 'Salvar Configurações'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
