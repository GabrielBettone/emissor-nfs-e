import pb from '@/lib/pocketbase/client'
import { InvoiceItem } from '@/types/nfse'

export async function listInvoices(): Promise<InvoiceItem[]> {
  try {
    return await pb.collection('invoices').getFullList<InvoiceItem>({
      sort: '-created',
      expand: 'service_id',
    })
  } catch (error) {
    console.error('Erro ao listar notas:', error)
    return []
  }
}

export async function getInvoiceById(id: string): Promise<InvoiceItem | null> {
  try {
    return await pb.collection('invoices').getOne<InvoiceItem>(id, {
      expand: 'service_id',
    })
  } catch (error) {
    console.error('Erro ao buscar nota por id:', error)
    return null
  }
}

export async function getNextRpsNumber(): Promise<number> {
  try {
    const list = await pb.collection('invoices').getList<InvoiceItem>(1, 1, {
      sort: '-numero_rps',
    })
    if (list.items.length > 0 && list.items[0].numero_rps) {
      return list.items[0].numero_rps + 1
    }
    return 1
  } catch (error) {
    console.error('Erro ao calcular próximo RPS:', error)
    return 1
  }
}

export async function createInvoice(data: Partial<InvoiceItem>): Promise<InvoiceItem> {
  return await pb.collection('invoices').create<InvoiceItem>(data)
}

export async function updateInvoice(id: string, data: Partial<InvoiceItem>): Promise<InvoiceItem> {
  return await pb.collection('invoices').update<InvoiceItem>(id, data)
}

export interface TransmitResult {
  success: boolean
  invoiceId: string
  numero_nfse: string
  chave_acesso: string
  protocolo: string
  status: string
  ambiente: string
  mensagem: string
}

export async function transmitInvoice(invoiceId: string): Promise<TransmitResult> {
  return await pb.send<TransmitResult>('/backend/v1/nfse/transmit', {
    method: 'POST',
    body: { invoiceId },
  })
}

export async function consultInvoice(invoiceId: string): Promise<{
  invoiceId: string
  status: string
  protocolo: string
  numero_nfse: string
  chave_acesso: string
  data_autorizacao: string
  mensagem: string
}> {
  return await pb.send('/backend/v1/nfse/consult', {
    method: 'POST',
    body: { invoiceId },
  })
}
