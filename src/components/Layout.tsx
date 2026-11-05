import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  FileText,
  PlusCircle,
  Layers,
  Settings,
  Shield,
  LogOut,
  Home,
  CheckCircle2,
  Building2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/', label: 'Início', icon: Home, end: true },
    { to: '/notas/nova', label: 'Nova NFS-e', icon: PlusCircle },
    { to: '/notas', label: 'Notas Emitidas', icon: FileText },
    { to: '/servicos', label: 'Serviços & LC 116', icon: Layers },
    { to: '/configuracoes', label: 'Configurações', icon: Settings },
    { to: '/certificado', label: 'Certificado & NFS-e', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight text-white">NFS-e Fácil</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] text-slate-400 font-medium">Padrão Nacional</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="truncate">GB SOLUCOES LTDA</span>
              <Badge
                variant="outline"
                className="text-[9px] py-0 px-1 border-blue-500/40 text-blue-300"
              >
                SP
              </Badge>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              CNPJ 53.242.055/0001-74
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="truncate mr-2">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user ? user.name || user.email : 'Visitante'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'São Pedro - SP'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8"
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-sm">NFS-e Nacional • GB Soluções</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-300 h-8 px-2 text-xs"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Sair
          </Button>
        </header>

        {/* Mobile nav bar */}
        <div className="md:hidden bg-slate-800 p-2 flex overflow-x-auto gap-1 border-b border-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
