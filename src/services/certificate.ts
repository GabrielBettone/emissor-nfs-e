import pb from '@/lib/pocketbase/client'
import { CertificateItem } from '@/types/nfse'

export async function getActiveCertificate(): Promise<CertificateItem | null> {
  try {
    const list = await pb.collection('certificates').getList<CertificateItem>(1, 1, {
      filter: 'ativo = true',
      sort: '-created',
    })
    if (list.items.length > 0) {
      return list.items[0]
    }
    const anyList = await pb.collection('certificates').getList<CertificateItem>(1, 1, {
      sort: '-created',
    })
    return anyList.items[0] || null
  } catch (error) {
    console.error('Erro ao buscar certificado:', error)
    return null
  }
}

export async function uploadCertificate(formData: FormData): Promise<CertificateItem> {
  return await pb.collection('certificates').create<CertificateItem>(formData)
}

export async function listCertificates(): Promise<CertificateItem[]> {
  try {
    return await pb.collection('certificates').getFullList<CertificateItem>({
      sort: '-created',
    })
  } catch (error) {
    console.error('Erro ao listar certificados:', error)
    return []
  }
}
