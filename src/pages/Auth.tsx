import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { FileText, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react'

export default function AuthPage() {
  const { login, register, requestPasswordReset, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Login form
  const [loginEmail, setLoginEmail] = useState('gabrielgiovani@msn.com')
  const [loginPassword, setLoginPassword] = useState('Skip@Pass')

  // Register form
  const [regName, setRegName] = useState('GB Soluções')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Forgot password form
  const [resetEmail, setResetEmail] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha seu e-mail e senha para continuar.',
        variant: 'destructive',
      })
      return
    }
    try {
      await login(loginEmail, loginPassword)
      toast({
        title: 'Bem-vindo!',
        description: 'Login efetuado com sucesso.',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Erro ao entrar',
        description: error?.message || 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para cadastrar.',
        variant: 'destructive',
      })
      return
    }
    if (regPassword.length < 8) {
      toast({
        title: 'Senha fraca',
        description: 'A senha deve conter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
      return
    }
    try {
      await register(regName, regEmail, regPassword)
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Um e-mail de confirmação foi enviado. Você já está logado.',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: error?.message || 'Não foi possível criar a conta. Tente outro e-mail.',
        variant: 'destructive',
      })
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Informe seu e-mail para enviarmos o link de recuperação.',
        variant: 'destructive',
      })
      return
    }
    try {
      await requestPasswordReset(resetEmail)
      toast({
        title: 'E-mail enviado',
        description: 'Se houver uma conta associada a este e-mail, as instruções foram enviadas.',
      })
      setShowForgot(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao solicitar',
        description: error?.message || 'Falha ao processar solicitação de recuperação.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Emissor NFS-e Fácil</h1>
          <p className="text-sm text-slate-500 mt-1">
            Padrão Nacional da Receita Federal para GB SOLUCOES LTDA
          </p>
        </div>

        {showForgot ? (
          <Card className="border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recuperar Senha</CardTitle>
              <CardDescription>
                Informe seu e-mail para receber as instruções de redefinição de acesso.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-mail cadastrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-600"
                  onClick={() => setShowForgot(false)}
                >
                  Voltar para o login
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className="border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm">
            <Tabs defaultValue="login" className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Criar Conta</TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-9"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Senha</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgot(true)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <span>
                        Credenciais pré-configuradas: <strong>gabrielgiovani@msn.com</strong> (senha
                        padrão: <strong>Skip@Pass</strong>).
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 font-medium"
                      disabled={loading}
                    >
                      {loading ? 'Entrando...' : 'Acessar Sistema'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Nome completo ou Empresa</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-name"
                          type="text"
                          placeholder="GB SOLUCOES LTDA"
                          className="pl-9"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">E-mail corporativo</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="contato@gbsolucoes.com.br"
                          className="pl-9"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Senha (mínimo 8 dígitos)</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 font-medium"
                      disabled={loading}
                    >
                      {loading ? 'Cadastrando...' : 'Criar Conta e Confirmar'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Emitente padrão: <strong>GB SOLUCOES LTDA</strong> (CNPJ 53.242.055/0001-74) • São
          Pedro/SP
        </div>
      </div>
    </div>
  )
}
