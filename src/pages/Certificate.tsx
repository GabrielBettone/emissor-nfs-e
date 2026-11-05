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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  Upload,
  Key,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  FileCode,
  Check,
} from 'lucide-react'
import { getActiveCertificate, uploadCertificate } from '@/services/certificate'
import { getCompanySettings, saveCompanySettings } from '@/services/company'
import { CertificateItem, CompanySettings, AmbienteType } from '@/types/nfse'

export default function CertificatePage() {
  const { toast } = useToast()

  const [cert, setCert] = useState<CertificateItem | null>(null)
  const [company, setCompany] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)

  // Upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [certPassword, setCertPassword] = useState('')
  const [uploading, setUploading] = useState(false)

  // National system environment & municipality
  const [ambiente, setAmbiente] = useState<AmbienteType>('homologacao')
  const [municipio, setMunicipio] = useState('São Pedro')
  const [uf, setUf] = useState('SP')
  const [codIbge, setCodIbge] = useState('3550407')
  const [savingAmbiente, setSavingAmbiente] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [activeCert, comp] = await Promise.all([getActiveCertificate(), getCompanySettings()])
        setCert(activeCert)
        setCompany(comp)
        if (comp) {
          setAmbiente(comp.ambiente || 'homologacao')
          setMunicipio(comp.municipio || 'São Pedro')
          setUf(comp.uf || 'SP')
          setCodIbge(comp.codigo_municipio_ibge || '3550407')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
    }
  }

  const handleUploadCert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast({
        title: 'Selecione o arquivo .pfx',
        description: 'É necessário selecionar o arquivo do certificado digital A1 (.pfx ou .p12).',
        variant: 'destructive',
      })
      return
    }
    if (!certPassword) {
      toast({
        title: 'Senha obrigatória',
        description: 'Informe a senha de leitura da chave privada do certificado.',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('arquivo', selectedFile)
      formData.append('nome_arquivo', selectedFile.name)
      formData.append('senha', certPassword)
      formData.append('titular', company?.razao_social || 'GB SOLUCOES LTDA')
      formData.append('cnpj', company?.cnpj || '53.242.055/0001-74')
      formData.append('ativo', 'true')

      const now = new Date()
      const validadeFim = new Date()
      validadeFim.setFullYear(now.getFullYear() + 1)

      formData.append('validade_inicio', now.toISOString().split('T')[0])
      formData.append('validade_fim', validadeFim.toISOString().split('T')[0])

      const created = await uploadCertificate(formData)
      setCert(created)
      setSelectedFile(null)
      setCertPassword('')

      toast({
        title: 'Certificado A1 Carregado!',
        description: 'Certificado digital configurado e pronto para assinar as NFS-e.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro no envio do certificado',
        description: err?.message || 'Falha ao salvar o arquivo do certificado A1.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSaveEnvironment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAmbiente(true)
    try {
      const updated = await saveCompanySettings(
        {
          ambiente,
          municipio,
          uf,
          codigo_municipio_ibge: codIbge,
        },
        company?.id,
      )
      setCompany(updated)
      toast({
        title: 'Ambiente Atualizado!',
        description: `Ambiente do Sistema Nacional configurado como ${ambiente.toUpperCase()} em ${municipio}/${uf}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Não foi possível alterar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setSavingAmbiente(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Certificado A1 & Sistema Nacional
        </h1>
        <p className="text-sm text-slate-500">
          Upload do certificado digital ICP-Brasil e parâmetros de conexão ao webservice nacional da
          Receita Federal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Upload Card */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Certificado Digital A1 (.pfx / .p12)
                </CardTitle>
                {cert ? (
                  <Badge className="bg-emerald-600 text-white flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3 h-3" /> Instalado
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 bg-amber-50 text-xs"
                  >
                    Pendente
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                O arquivo .pfx é utilizado para assinar o XML do RPS e autenticar as transmissões
                TLS mútuas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cert && (
                <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Certificado Ativo:</span>
                    <span className="font-mono text-emerald-800">{cert.nome_arquivo}</span>
                  </div>
                  <div className="text-slate-600">
                    Titular:{' '}
                    <strong>{cert.titular || company?.razao_social || 'GB SOLUCOES LTDA'}</strong>
                  </div>
                  <div className="text-slate-600">
                    CNPJ Vinculado:{' '}
                    <strong>{cert.cnpj || company?.cnpj || '53.242.055/0001-74'}</strong>
                  </div>
                  {cert.validade_fim && (
                    <div className="text-slate-600">
                      Validade até:{' '}
                      <strong>{new Date(cert.validade_fim).toLocaleDateString('pt-BR')}</strong>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleUploadCert} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cert_file">Arquivo do Certificado (.pfx ou .p12)</Label>
                  <Input
                    id="cert_file"
                    type="file"
                    accept=".pfx,.p12"
                    onChange={handleFileChange}
                  />
                  <p className="text-[11px] text-slate-500">
                    Selecione o arquivo A1 exportado pela autoridade certificadora (Serpro,
                    Certisign, Soluti, etc.).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cert_pwd">Senha de Instalação do Certificado</Label>
                  <Input
                    id="cert_pwd"
                    type="password"
                    placeholder="••••••••"
                    value={certPassword}
                    onChange={(e) => setCertPassword(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500">
                    A senha fornecida no momento da emissão do arquivo .pfx.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Enviando e Validando...' : 'Carregar Certificado A1'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Dica de Segurança */}
          <Card className="border-slate-200 shadow-sm bg-slate-50">
            <CardContent className="p-4 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-blue-600" />
                Segurança e Assinatura Digital
              </div>
              <p>
                Em ambiente de homologação, o sistema gera o XML com a estrutura completa da NFS-e
                Nacional e protocolo oficial de testes. Ao subir seu A1 com senha, as transmissões
                em produção assinam digitalmente a tag <code>infNFSe</code> conforme a especificação
                técnica da Receita Federal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* National System Configuration Card */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Parâmetros do Sistema Nacional (Receita Federal)
              </CardTitle>
              <CardDescription className="text-xs">
                Configuração do ambiente de envio e município de incidência do ISS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEnvironment} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Ambiente de Emissão</Label>
                  <Select value={ambiente} onValueChange={(val: AmbienteType) => setAmbiente(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homologacao">
                        Homologação (Ambiente de Testes - Sem valor fiscal)
                      </SelectItem>
                      <SelectItem value="producao">
                        Produção (Emissão Oficial com Validade Jurídica)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500">
                    O ambiente de homologação permite testar a emissão de RPS e integração sem gerar
                    tributos reais.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Município de Incidência do ISS
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="mun_inc">Município</Label>
                      <Input
                        id="mun_inc"
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="uf_inc">UF</Label>
                      <Input
                        id="uf_inc"
                        maxLength={2}
                        value={uf}
                        onChange={(e) => setUf(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ibge_inc">Código IBGE do Município *</Label>
                    <Input
                      id="ibge_inc"
                      value={codIbge}
                      onChange={(e) => setCodIbge(e.target.value)}
                      required
                    />
                    <p className="text-[11px] text-slate-500">
                      São Pedro/SP = <strong>3550407</strong> (Código utilizado pelo webservice
                      nacional).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs space-y-1 text-blue-900">
                  <div className="font-semibold">Webservice do Sistema Nacional da NFS-e</div>
                  <p className="text-blue-700">
                    Endereço de envio: <code>https://producao.nfse.gov.br</code> ou{' '}
                    <code>https://homologacao.nfse.gov.br</code> (Padrão Sped Nacional).
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={savingAmbiente}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {savingAmbiente ? 'Atualizando...' : 'Salvar Parâmetros do Sistema Nacional'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
