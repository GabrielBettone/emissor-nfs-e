/* Main App Component - Handles routing (using react-router-dom), query client and other providers */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Index from './pages/Index'
import AuthPage from './pages/Auth'
import ServicesPage from './pages/Services'
import NewInvoicePage from './pages/NewInvoice'
import InvoicesListPage from './pages/InvoicesList'
import InvoiceDetailsPage from './pages/InvoiceDetails'
import SettingsPage from './pages/Settings'
import CertificatePage from './pages/Certificate'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected Routes inside Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/notas/nova" element={<NewInvoicePage />} />
            <Route path="/notas" element={<InvoicesListPage />} />
            <Route path="/notas/:id" element={<InvoiceDetailsPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route path="/certificado" element={<CertificatePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
